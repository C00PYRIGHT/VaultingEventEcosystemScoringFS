import express from 'express';

import {logger} from '../logger.js';
import Validate from "../middleware/Validate.js";
import { Verify, VerifyRole } from "../middleware/Verify.js";
import entryController from '../controllers/entryController.js';



const entryRouter = express.Router();

entryRouter.get('/new', Verify, VerifyRole(), entryController.renderNew);

entryRouter.post('/new', Verify, VerifyRole(), entryController.createNew);
  entryRouter.get('/dashboard', Verify, VerifyRole(), entryController.dashboard);


entryRouter.get('/edit/:id', Verify, VerifyRole(), entryController.editGet);
entryRouter.post('/edit/:id', Verify, VerifyRole(), Validate, entryController.editPost);

     /*  entryRouter.delete('/delete/:id',Verify, VerifyRole(), async (req, res) => {
        try {

          const entry = await Entries.findByIdAndDelete(req.params.id);
          logger.db(`Entry ${entry.name} deleted by user ${req.user.username}.`);
          if (!entry) {
            req.session.failMessage = 'Entry not found';
            return res.status(404).json({ message: 'Entry not found' });
          }
          res.status(200).json({ message: 'Entry deleted successfully' });
        } catch (err) {
          logger.error(err + " User: "+ req.user.username);
          req.session.failMessage = 'Server error';
          res.status(500).json({ message: 'Server error' });
        }
      });*/
entryRouter.delete('/deleteIncident/:id', Verify, VerifyRole(), entryController.deleteIncident);
entryRouter.post('/newIncident/:id', Verify, VerifyRole(), entryController.newIncidentPost);

entryRouter.get('/vetCheck', Verify, VerifyRole(), entryController.vetCheckGet);

    entryRouter.post('/updateVetStatus/:horseId', Verify, VerifyRole(), entryController.updateVetStatus);





export default entryRouter;