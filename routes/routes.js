import express from 'express';

import logger from '../logger.js';
import { Login } from "../controllers/auth.js";
import { Logout } from "../controllers/auth.js";
import Validate from "../middleware/Validate.js";
import { check } from "express-validator";
import { CheckLoggedIn, Verify, VerifyRole } from "../middleware/Verify.js";
import DashCards from '../models/DashCards.js';

const router = express.Router();


router.get("/", async (req, res) => {
    res.redirect("/dashboard");

});
router.dashboard = router.get("/dashboard", Verify, async (req, res) => {
    console.log(await DashCards.find({ dashtype: 'user' }).sort({ priority: 1 }));
    req.session.successMessage = null; // Üzenet törlése a session-ből  
    req.session.failMessage = null; // Üzenet törlése a session-ből
    res.render("dashboard", {userrole: req.user.role, 
        cardsFromDB: await DashCards.find({ dashtype: 'user' }).sort({ priority: 1 }),
        successMessage: req.session.successMessage, 
        rolePermissons: req.user.role.permissions,
        failMessage: req.session.failMessage,
        formData: req.session.formData
    });
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
router.get("/login", CheckLoggedIn,(req, res) => {
    const failMessage = req.session.failMessage; // Üzenet beállítása a session-ből
    res.render("login", { failMessage, rolePermissons: req.user?.role.permissions, successMessage: req.session.successMessage});
        req.session.failMessage = null; // Üzenet törlése a session-ből
        req.session.successMessage = null; // Üzenet törlése a session-ből
});








router.get('/logout', Logout);



export default router;