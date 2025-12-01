import express from 'express';

import {logger} from '../logger.js';
import { Login } from "../controllers/auth.js";
import { Logout } from "../controllers/auth.js";
import Validate from "../middleware/Validate.js";
import { check } from "express-validator";
import { Verify, VerifyRole } from "../middleware/Verify.js";
import DailyTimeTable from '../models/DailyTimeTable.js';
import Permissions from '../models/Permissions.js';
import User from '../models/User.js';
import TimetablePart from '../models/Timetablepart.js';
import Category from '../models/Category.js';
import Event from '../models/Event.js';
import Entries from '../models/Entries.js'; // vagy a te modell fájlneved



const orderRouter = express.Router();

orderRouter.get('/edit/:id', Verify, VerifyRole(), async (req, res) => {

    
  try {
    const timetablePart = await TimetablePart.findById(req.params.id).populate('dailytimetable').exec();
    const eventID = res.locals.selectedEvent?._id;

    if (!timetablePart) {
      req.session.failMessage = "Timetable part not found.";
      return res.redirect('/dailytimetable');
    }
    if (!timetablePart.StartingOrder.length === 0 || timetablePart.drawingDone === false) {
      req.session.failMessage = "No starting order set for this timetable part.";
      return res.redirect('/order/createSelect/' + req.params.id);
    }

    // biztosítsuk, hogy categories tömb legyen
    const categories = Array.isArray(timetablePart.Category)
      ? timetablePart.Category
      : (timetablePart.Category ? [timetablePart.Category] : []);

    // category mező egyezzen bármelyik elemmel a listában
    const entries = await Entries.find({ event: eventID, status: 'confirmed', category: { $in: categories } })
      .populate('vaulter horse lunger')
      .exec();



    //Egyeztetjük a két listát, hogy csak akkor legyen StartingOrder-ban entry, ha az entries-ben is benne van
    const validEntryIds = new Set(entries.map(e => e._id.toString()));
    timetablePart.StartingOrder = timetablePart.StartingOrder.filter(so => validEntryIds.has(so.Entry.toString()));
    await timetablePart.save();












    res.render('order/editorder', {
      entries: entries,
      formData: timetablePart,
      rolePermissons: req.user?.role?.permissions,
      failMessage: req.session.failMessage,
      successMessage: req.session.successMessage,
      user: req.user
    });
    req.session.failMessage = null; // Clear the fail message after rendering
    req.session.successMessage = null; // Clear the success message after rendering
    


    } catch (err) {
    logger.error(err);
    req.session.failMessage = 'Hiba történt.';
    return res.redirect('/dailytimetable');
  }
});






orderRouter.post('/overwrite/:id', Verify, VerifyRole(), async (req, res) => {
    try {
        const timetablePart = await TimetablePart.findById(req.params.id);
        if (!timetablePart) {
            return res.status(404).json({ message: 'Timetable part not found.' });
        }
        let changed = false;
        let oldOrder = "";
        timetablePart.StartingOrder = timetablePart.StartingOrder.filter(so => String(so.Entry) !== String(req.body.id));
        for(let i = 0; i < timetablePart.StartingOrder.length; i++){
            if(timetablePart.StartingOrder[i].Order== req.body.newOrder){
                oldOrder = timetablePart.StartingOrder[i].Entry;
                timetablePart.StartingOrder[i].Entry = req.body.id;
                changed = true;
                logger.db(`Order overwritten: TimetablePart ${timetablePart._id}, Entry ${req.body.id} set to Order ${req.body.newOrder}`);                
            }
        }
        timetablePart.StartingOrder = timetablePart.StartingOrder.filter(so => String(so.Entry) !== String(oldOrder));

        if (!changed) {
            timetablePart.StartingOrder.push({ Entry: req.body.id, Order: req.body.newOrder });
            logger.db(`Order added: TimetablePart ${timetablePart._id}, Entry ${req.body.id} set to Order ${req.body.newOrder}`);
        }

        await timetablePart.save();
        req.session.successMessage = 'Starting order updated successfully.';
        return res.status(200).json({ message: 'Starting order updated successfully.' });

    } catch (err) {
        logger.error(err);
        
        return res.status(500).json({ message: 'Internal server error.' });
    }
});

orderRouter.get('/createOrder/:id', Verify, VerifyRole(), async (req, res) => {

    try {
        const timetablePart = await TimetablePart.findById(req.params.id).populate('dailytimetable').exec();
    
        const eventID = res.locals.selectedEvent?._id;
        if (!timetablePart) {
            req.session.failMessage = "Timetable part not found.";
            return res.redirect('/dailytimetable');
        }
            // biztosítsuk, hogy categories tömb legyen
            const categories = Array.isArray(timetablePart.Category)
            ? timetablePart.Category
            : (timetablePart.Category ? [timetablePart.Category] : []);

            // category mező egyezzen bármelyik elemmel a listában
            const entries = await Entries.find({ event: eventID, status: 'confirmed', category: { $in: categories } })
            .populate('vaulter horse lunger')
            .exec();    
        if (!timetablePart.conflictsChecked) {
            let StartingOrdersConfilct = [];
            let usedNumbers = new Set();
            

            const conflictedEntries = [];
            for (let i = 0; i < entries.length; i++) {
                let hasConflict = false;
                for (let j = 0; j < entries.length; j++) {
                    if (i !== j) {
                        if (String(entries[i].horse) === String(entries[j].horse) || String(entries[i].lunger) === String(entries[j].lunger)) {
                            hasConflict = true;
                            break;
                        }
                    }
                }
                if (hasConflict) {
                    conflictedEntries.push(entries[i]);

                    let isGenerated = false;
                    for (let k = 0; k < timetablePart.StartingOrder.length; k++) {
                        if (String(timetablePart.StartingOrder[k].Entry) === String(entries[i]._id)) {
                            isGenerated = true;
                            break;
                        }
                    }

                    if(!isGenerated){
                    

                        let randomnumber;
                        do {
                            randomnumber = Math.floor(Math.random() * entries.length) + 1;
                        } while (usedNumbers.has(randomnumber));
                        usedNumbers.add(randomnumber);
                        timetablePart.StartingOrder.push({ Entry: entries[i]._id, Order: randomnumber });
                        
                    
                    }
                }

            }


        await timetablePart.save();


        
             res.render('order/checkconflicts', {

            PreGeneratedOrder: timetablePart.StartingOrder,
            entries: conflictedEntries,
            formData: timetablePart,
            rolePermissons: req.user?.role?.permissions,
            failMessage: req.session.failMessage,
            successMessage: req.session.successMessage,
            user: req.user
        });
        req.session.failMessage = null; // Clear the fail message after rendering
        req.session.successMessage = null; // Clear the success message after rendering
        } else {
            
            let UsedEntryIds = new Set();
            for(let i = 0; i < timetablePart.StartingOrder.length; i++){
                UsedEntryIds.add(String(timetablePart.StartingOrder[i].Entry));
            }
            let UsedNumbers = new Set();
            for(let i = 0; i < timetablePart.StartingOrder.length; i++){
                UsedNumbers.add(timetablePart.StartingOrder[i].Order);
            }
            for(let i = 0; i < entries.length; i++){
                if(!UsedEntryIds.has(String(entries[i]._id))){
                    let randomnumber;
                    do {
                        randomnumber = Math.floor(Math.random() * entries.length) + 1;
                    } while (UsedNumbers.has(randomnumber));
                    UsedNumbers.add(randomnumber);
                    timetablePart.StartingOrder.push({ Entry: entries[i]._id, Order: randomnumber });
                }
            }
            timetablePart.drawingDone = true;
            await timetablePart.save();



            res.render('order/vieworder', {
            entries: entries,
            formData: timetablePart,
            rolePermissons: req.user?.role?.permissions,
            failMessage: req.session.failMessage,
            successMessage: req.session.successMessage,
            user: req.user
            });
            req.session.failMessage = null; // Clear the fail message after rendering
            req.session.successMessage = null; // Clear the success message after rendering
        }
    } catch (err) {
        logger.error(err);
        req.session.failMessage = 'Error occurred.';
        return res.redirect('/dailytimetable');
    }
});



orderRouter.get('/confirmConflicts/:id', Verify, VerifyRole(), async (req, res) => {

    try {
        const timetablePart = await TimetablePart.findById(req.params.id);
    
        if (!timetablePart) {
            req.session.failMessage = "Timetable part not found.";
            return res.redirect('/dailytimetable');
        }

        timetablePart.conflictsChecked = true;
        await timetablePart.save();

        req.session.successMessage = 'Conflicts confirmed. You can now create the starting order.';
        return res.redirect('/order/createOrder/' + req.params.id);

    } catch (err) {
        logger.error(err);
        req.session.failMessage = 'Error occurred.';
        return res.redirect('/dailytimetable');
    }
});
orderRouter.post('/getNewOrder/:id', Verify, VerifyRole(), async (req, res) => {
    try {
        const timetablePart = await TimetablePart.findById(req.params.id);
        const eventID = res.locals.selectedEvent?._id;

            // biztosítsuk, hogy categories tömb legyen
            const categories = Array.isArray(timetablePart.Category)
            ? timetablePart.Category
            : (timetablePart.Category ? [timetablePart.Category] : []);

            // category mező egyezzen bármelyik elemmel a listában
            const entries = await Entries.find({ event: eventID, status: 'confirmed', category: { $in: categories } })
            .populate('vaulter horse lunger')
            .exec();



        if (!timetablePart) {
            return res.status(404).json({ message: 'Timetable part not found.' });
        }

        let oldOrderNr = req.body.oldNumber;
        let id = req.body.id;
        let usedNumbers = new Set();
        for(let i = 0; i < timetablePart.StartingOrder.length; i++){
            usedNumbers.add(timetablePart.StartingOrder[i].Order);
            logger.debug(`Used number added: ${timetablePart.StartingOrder[i].Order}`);
        }
        let i = 50;
        do {
            var randomnumber = Math.floor(Math.random() * entries.length) + 1;
            if(i-- < 0){
                req.session.failMessage = "Could not generate a new order number, please try again.";
                return res.redirect('/dailytimetable/dayparts/' + timetablePart.dailytimetable);
            }  // safety break to avoid infinite loop
        } while (usedNumbers.has(randomnumber) || (String(randomnumber) === String(oldOrderNr)));

        for(let i = 0; i < timetablePart.StartingOrder.length; i++){
            if(timetablePart.StartingOrder[i].Entry== id){
                timetablePart.StartingOrder[i].Order = randomnumber;
                logger.db(`Order re-generated: TimetablePart ${timetablePart._id}, Entry ${id} set to Order ${randomnumber}`);                
            }
        }

        await timetablePart.save();

        return res.status(200).json({ newOrder: randomnumber });

    } catch (err) {
        logger.error(err);
        
        return res.status(500).json({ message: 'Internal server error.' });
    }
});
orderRouter.get('/createSelect/:id', Verify, VerifyRole(), async (req, res) => {
    try {
        const timetablePart = await TimetablePart.findById(req.params.id).populate('dailytimetable').exec();

        if (!timetablePart) {
            req.session.failMessage = "Timetable part not found.";
            return res.redirect('/dailytimetable');
        }
        res.render('order/createselect', {
            formData: timetablePart,
            rolePermissons: req.user?.role?.permissions,
            failMessage: req.session.failMessage,
            successMessage: req.session.successMessage,
            user: req.user
        });
        req.session.failMessage = null; // Clear the fail message after rendering
        req.session.successMessage = null; // Clear the success message after rendering
    } catch (err) {
        logger.error(err);
        req.session.failMessage = 'Error occurred.';
        return res.redirect('/dailytimetable');
    }
});

orderRouter.post('/createSelect/:id', Verify, VerifyRole(), async (req, res) => {
    try {
        const timetablePart = await TimetablePart.findById(req.params.id);

        if (!timetablePart) {
            req.session.failMessage = "Timetable part not found.";
            return res.redirect('/dailytimetable');
        }

        if (!req.body.creationMethod || (req.body.creationMethod !== 'Drawing' && req.body.creationMethod !== 'Copy')) {
            req.session.failMessage = "Invalid creation method selected.";
            return res.redirect('/order/createSelect/' + req.params.id);
        }else if (req.body.creationMethod === 'Drawing') {
            timetablePart.StartingOrder = [];
            await timetablePart.save();
            return res.redirect('/order/createOrder/' + req.params.id);

        }
        else if (req.body.creationMethod === 'Copy') {
            req.session.failMessage = "Copy method not implemented yet.";
            return res.redirect('/order/createSelect/' + req.params.id);
        }
        else {
            req.session.failMessage = "Invalid creation method selected.";
            return res.redirect('/order/createSelect/' + req.params.id);
        }

    } catch (err) {
        logger.error(err);
        req.session.failMessage = 'Error occurred.';
        timetablePart.drawingDone = false;
        timetablePart.creationMethod = req.body.creationMethod;
        res.render('order/createselect', {
            formData: timetablePart,
            rolePermissons: req.user?.role?.permissions,
            failMessage: req.session.failMessage,
            successMessage: req.session.successMessage,
            user: req.user
        });
        req.session.failMessage = null; // Clear the fail message after rendering
        req.session.successMessage = null; // Clear the success message after rendering

    }
});

export default orderRouter;