import { SECURE_MODE } from "../app.js";
import { logger } from "../logger.js";
import { asyncHandler } from '../middleware/asyncHandler.js';
import {
    findUserByUsername,
    findUserByUsernameWithPassword,
    createUser,
    validateUserPassword,
    isTokenBlacklisted,
    blacklistToken
} from '../DataServices/authData.js';

/**
 * @route POST v1/auth/register
 * @desc Registers a user
 * @access Public
 */
const Register = asyncHandler(async (req, res) => {
    logger.userManagement("Registering user: " + JSON.stringify(req.body));
    const { username, fullname, password, feiid, role } = req.body;

    await createUser({ username, fullname, password, feiid, role });
    req.session.successMessage = "User created successfully.";
    res.redirect("/admin/dashboard/users");
});


/**
 * @route POST v1/auth/login
 * @desc logs in a user
 * @access Public
 */
const Login = asyncHandler(async (req, res) => {
    const { username, password } = req.body;
    
    const user = await findUserByUsernameWithPassword(username);
    if (!user) {
        req.session.failMessage = "User not found";
        return res.redirect("/login");
    }
    logger.userManagement("User: " + user.username);

    const isPasswordValid = await validateUserPassword(password, user.password);
    if (!isPasswordValid) {
        req.session.failMessage = "Invalid username or password";
        return res.redirect("/login");
    }

    let options = {
        maxAge: 20 * 60 * 1000,
        httpOnly: true,
        secure: SECURE_MODE === 'true',
        sameSite: "None",
    };

    const token = user.generateAccessJWT();
    res.cookie("token", token, options);
    return res.redirect("/dashboard");
});


/**
 * @route POST /auth/logout
 * @desc Logout user
 * @access Public
 */
const Logout = asyncHandler(async (req, res) => {
    const authHeader = req.headers['cookie'];
    if (!authHeader) return res.sendStatus(204);
    const cookie = authHeader.split('=')[1];
    const accessToken = cookie.split(';')[0];
    
    const checkIfBlacklisted = await isTokenBlacklisted(accessToken);
    if (checkIfBlacklisted) return res.sendStatus(204);
    
    await blacklistToken(accessToken);
    
    res.setHeader('Clear-Site-Data', '"cookies"');
    return res.redirect('/login');
});

export default { Register, Login, Logout };