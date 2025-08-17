import express from 'express';

import logger from '../logger.js';
import { Login } from "../controllers/auth.js";
import { Logout } from "../controllers/auth.js";
import Validate from "../middleware/Validate.js";
import { check } from "express-validator";
import { Verify, VerifyRole } from "../middleware/Verify.js";

import bcrypt from "bcrypt";
const router = express.Router();


router.get("/", async (req, res) => {
    const fetchedforms = await Form.find();
    req.session.successMessage = null; // Üzenet törlése a session-ből
    res.render("mainpage", { userrole: req.user?.role || "notlogged", forms : fetchedforms, successMessage: req.session.successMessage, failMessage: req.session.failMessage });
});


router.post(
    "/login",
    check("username")
        .not()
        .isEmpty()
        .withMessage("Enter a valid email address"),
    check("password").not().isEmpty(),
    Validate,
    Login
);
router.get("/login", (req, res) => {
    const failMessage = req.session.failMessage; // Üzenet beállítása a session-ből
    req.session.failMessage = null; // Üzenet törlése a session-ből
    res.render("login", { failMessage, userrole: req.user?.role || "notlogged" });
});



/*router.get("/dashboard", Verify, async (req, res) => {
    const forms = await Form.find();
    req.session.successMessage = null; // Üzenet törlése a session-ből  
    req.session.failMessage = null; // Üzenet törlése a session-ből
    res.render("dashboard", {userrole: req.user.role, forms, successMessage: req.session.successMessage, failMessage: req.session.failMessage });
});*/






router.get('/logout', Logout);



export default router;