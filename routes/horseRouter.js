import express from 'express';

import {logger} from '../logger.js';
import Validate from "../middleware/Validate.js";
import { Verify, VerifyRole } from "../middleware/Verify.js";
import horseController from '../controllers/horseController.js';


const HorseRouter = express.Router();

HorseRouter.get('/new', Verify, VerifyRole(), horseController.renderNew);

HorseRouter.post('/new', Verify, VerifyRole(), Validate, horseController.createNew);

HorseRouter.get('/dashboard', Verify, VerifyRole(), horseController.dashboard);


HorseRouter.get('/details/:id', Verify, VerifyRole(), horseController.details);
HorseRouter.get('/edit/:id', Verify, VerifyRole(), horseController.editGet);
HorseRouter.post('/edit/:id', Verify, VerifyRole(), Validate, horseController.editPost);
  
HorseRouter.delete('/deleteNote/:id', Verify, VerifyRole(), horseController.deleteNote);
HorseRouter.post('/newNote/:id', Verify, VerifyRole(), horseController.newNotePost);



HorseRouter.get('/numbers', Verify, VerifyRole(), horseController.numbersGet);
HorseRouter.post('/updatenums/:id', Verify, VerifyRole(), horseController.updateNums);

export default HorseRouter;