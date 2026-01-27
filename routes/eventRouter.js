import express from 'express';

import {logger} from '../logger.js';
import Validate from "../middleware/Validate.js";
import { Verify, VerifyRole } from "../middleware/Verify.js";
import eventController from '../controllers/eventController.js';
const eventRouter = express.Router();

eventRouter.get('/new', Verify, VerifyRole(), eventController.renderNew);

eventRouter.post('/new', Verify, VerifyRole(), eventController.createNew);
  eventRouter.get('/dashboard', Verify, VerifyRole(), eventController.dashboard);


eventRouter.get('/edit/:id', Verify, VerifyRole(), eventController.editGet);
eventRouter.post('/edit/:id', Verify, VerifyRole(), Validate, eventController.editPost);



eventRouter.get('/details/:id', Verify, VerifyRole(), eventController.details);
eventRouter.delete('/deleteResponsiblePerson/:id', Verify, VerifyRole(), eventController.deleteResponsiblePersonHandler);
eventRouter.post('/addResponsiblePerson/:id', Verify, VerifyRole(), eventController.addResponsiblePersonHandler);
    eventRouter.post('/selectEvent/:eventId', Verify, VerifyRole(), eventController.selectEventHandler);


export default eventRouter;