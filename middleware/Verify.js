import Blacklist from "../models/Blacklist.js"; // import the Blacklist model
import jwt from "jsonwebtoken"; // import jsonwebtoken to verify the access token
import User from "../models/User.js"; // import the User model
import { SECRET_ACCESS_TOKEN } from "../app.js"; // import the secret access token from the app.js file
import logger from "../logger.js"; // import the logger to log errors
import RoleModel from "../models/Role.js"; // import the Role model if needed
import PermissionModel from "../models/Permissions.js"; // import the Permission model if needed

export async function Verify(req, res, next) {
    const cookieHeader = req.headers["cookie"];
    const MAX_INACTIVITY = 20 * 60 * 1000; // 20 perc milliszekundumban


    if (!cookieHeader) {
        req.session.failMessage = "Unauthorized access. Please login.";
        return res.redirect("/login");
    }

    const cookies = cookieHeader.split(";").map(c => c.trim());
    const sessionCookie = cookies.find(c => c.startsWith("SessionID="));

    if (!sessionCookie) {
        req.session.failMessage = "Unauthorized access. Please login.";
        return res.redirect("/login");
    }

    const accessToken = sessionCookie.split("=")[1];

    if (!accessToken) {
        req.session.failMessage = "Invalid session. Please login.";
        return res.redirect("/login");
    }

            // Last activity ellenőrzés
        const now = Date.now();
        if (req.session.lastActivity && now - req.session.lastActivity > MAX_INACTIVITY) {
            // Túl sok inaktivitás → logout
            req.session.destroy(err => {});
            return res.redirect("/login");
        }

        // Frissítjük az utolsó aktivitást
        req.session.lastActivity = now;


    try {
        // Check if token is blacklisted
        const checkIfBlacklisted = await Blacklist.findOne({ token: accessToken });
        if (checkIfBlacklisted) {
            req.session.failMessage = "This session logged out. Please login again.";
            return res.redirect("/login");
        }

        // Verify the JWT token - promisify jwt.verify
        const decoded = await new Promise((resolve, reject) => {
            jwt.verify(accessToken, SECRET_ACCESS_TOKEN, (err, decoded) => {
                if (err) reject(err);
                else resolve(decoded);
            });
        });

        const { id } = decoded;

        const user = await User.findById(id).populate('role'); // Populate the role field with the role name
        if (!user) {
            logger.info("User not found for decoded token id: ", id);
            req.session.failMessage = "User not found for decoded token id";
            return res.redirect("/login");
        }

        const { password, ...data } = user._doc;
        req.user = data;

        next();

    } catch (error) {
        logger.error("Internal server error in Verify middleware: ", error);
        req.session.failMessage = "This session has expired or is invalid. Please login.";
        return res.redirect("/login");
    }
}
function urlsMatch(pattern, actual) {
    const patternParts = pattern.split('/').filter(Boolean);
    const actualParts = actual.split('/').filter(Boolean);

    if (patternParts.length !== actualParts.length) return false;

    return patternParts.every((part, i) => {
        return part.startsWith(':') || part === actualParts[i];
    });
}

export function VerifyRole(neededPermission) {
    return async function (req, res, next) {
        try {
            const user = req.user;
            const { role } = user;
            if (!role) {
                req.session.failMessage = "User role not found.";
                return res.redirect("/login");
            }

            const roleFromDB = await RoleModel.findById(role);

            const permissionsDocs = await PermissionModel.find({
            name: { $in: roleFromDB.permissions } // keresés az összes permission név alapján
            });

            // Most minden permission dokumentum elérhető a permissionsDocs tömbben
            const allAttachedURLs = permissionsDocs.flatMap(p => p.attachedURL);


            
            const hasPermission = allAttachedURLs.some(pattern => urlsMatch(pattern, req.originalUrl));
            logger.info(`Checking permissions for user with role ${roleFromDB.roleName} on URL ${req.originalUrl}. Has permission: ${hasPermission}`);
            if (!roleFromDB || !hasPermission)  {
                req.session.failMessage = "You do not have permission to access this resource.";
                return res.redirect(req.get('Referer') || '/login'); // vissza az előző oldalra, vagy login ha nincs
            }
            next();
        } catch (err) {

            logger.error("Internal server error in VerifyRole middleware: ", err);
            req.session.failMessage = "Internal server error.";
                return res.redirect(req.get('Referer') || '/login'); // vissza az előző oldalra, vagy login ha nincs
        }
    };
}
