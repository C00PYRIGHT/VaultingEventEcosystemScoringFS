import express from 'express';

import {logger} from '../logger.js';
import Validate from "../middleware/Validate.js";
import { Verify, VerifyRole } from "../middleware/Verify.js";
import lungerController from '../controllers/lungerController.js';

const lungerRouter = express.Router();

lungerRouter.get('/new', Verify, VerifyRole(), lungerController.renderNew);

lungerRouter.post('/new', Verify, VerifyRole(), lungerController.createNew);

lungerRouter.get('/dashboard', Verify, VerifyRole(), lungerController.dashboard);


lungerRouter.get('/details/:id', Verify, VerifyRole(), lungerController.details);
lungerRouter.get('/edit/:id', Verify, VerifyRole(), lungerController.editGet);
lungerRouter.post('/edit/:id', Verify, VerifyRole(), Validate, lungerController.editPost);

lungerRouter.delete('/deleteIncident/:id', Verify, VerifyRole(), lungerController.deleteIncident);
lungerRouter.post('/newIncident/:id', Verify, VerifyRole(), lungerController.newIncidentPost);

export default lungerRouter;