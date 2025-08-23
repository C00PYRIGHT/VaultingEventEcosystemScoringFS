import express from 'express';

import logger from '../logger.js';
import { Login } from "../controllers/auth.js";
import { Logout } from "../controllers/auth.js";
import Validate from "../middleware/Validate.js";
import { check } from "express-validator";
import { Verify, VerifyRole } from "../middleware/Verify.js";

const HorseRouter = express.Router();



export default HorseRouter;