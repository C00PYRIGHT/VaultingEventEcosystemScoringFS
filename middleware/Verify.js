import Blacklist from "../models/Blacklist.js"; // import the Blacklist model
import jwt from "jsonwebtoken"; // import jsonwebtoken to verify the access token
import User from "../models/User.js"; // import the User model
import { SECRET_ACCESS_TOKEN } from "../app.js"; // import the secret access token from the app.js file
import logger from "../logger.js"; // import the logger to log errors

export async function Verify(req, res, next) {
    const cookieHeader = req.headers["cookie"];

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

        const user = await User.findById(id);
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

export function VerifyRole(req, res, next) {
    try {
        const user = req.user; // we have access to the user object from the request
        const { role } = user; // extract the user role
        // check if user has no advance privileges
        // return an unathorized response
        if (role !== "admin") {
            req.session.failMessage = "Unauthorized access. Admins only.";
            return res.redirect("/login");
        }
        next(); // continue to the next middleware or function
    } catch (err) {
        logger.error("Internal server error in VerifyRole middleware: ", err);
        req.session.failMessage = "Internal server error.";
        return res.redirect("/login");
    }
}
