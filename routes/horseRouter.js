import express from 'express';

import logger from '../logger.js';
import { Login } from "../controllers/auth.js";
import { Logout } from "../controllers/auth.js";
import Validate from "../middleware/Validate.js";
import { check } from "express-validator";
import { Verify, VerifyRole } from "../middleware/Verify.js";
import Horse from '../models/Horse.js';

const HorseRouter = express.Router();

HorseRouter.get('/new',Verify, VerifyRole(), (req, res) => {
    res.render('horse/newHorse', {
        formData: req.session.formData, 
        rolePermissons: req.user?.role?.permissions
        , failMessage: req.session.failMessage, successMessage: req.session.successMessage });
    req.session.failMessage = null; // Clear the fail message after rendering
    req.session.successMessage = null; // Clear the success message after rendering 
});

HorseRouter.post('/new',Verify, VerifyRole(), Validate, async (req, res) => {
    try {
        const newHorse = new Horse(req.body);
        await newHorse.save()
        req.session.successMessage = 'Horse created successfully!';
        res.redirect('/horse/new');
    } catch (err) {
    console.error(err);

    const errorMessage = err.errors
      ? Object.values(err.errors).map(e => e.message).join(' ')
      : 'Server error';

    return res.render('horse/newHorse', {
        permissionList: await Permissions.find(),
      formData: req.body,
      successMessage: null,
      failMessage: errorMessage,
      card: { ...req.body, _id: req.params.id }
    });
    
  }
});
  HorseRouter.get('/dashboard',Verify, VerifyRole(), async (req, res) => {
        const horses = await Horse.find().sort({ name: 1 });
        res.render('horse/horsedash', {
            horses,
            rolePermissons: req.user?.role?.permissions,
            failMessage: req.session.failMessage,
            successMessage: req.session.successMessage
        });
        req.session.failMessage = null; // Clear the fail message after rendering
        req.session.successMessage = null; // Clear the success message after rendering 
    });


    HorseRouter.get('/details/:id',Verify, VerifyRole(), async (req, res) => {
        try {
            console.log(req.params.id);
            const horse = await Horse.findById(req.params.id);
            if (!horse) {
            req.session.failMessage = 'Horse not found';
            return res.redirect('/horse/dashboard');
          }
            res.render('horse/horseDetail', {
                formData: horse,
                rolePermissons: req.user?.role?.permissions,
                failMessage: req.session.failMessage,
                successMessage: req.session.successMessage
            });
            req.session.failMessage = null; // Clear the fail message after rendering
            req.session.successMessage = null; // Clear the success message after rendering 
        } catch (err) {
            console.error(err);
            req.session.failMessage = 'Server error';
            return res.redirect('/horse/dashboard');
        }
    });
    HorseRouter.get('/edit/:id',Verify, VerifyRole(), async (req, res) => {
        try {
          const horse = await Horse.findById(req.params.id);
          if (!horse) {
            req.session.failMessage = 'Horse not found';
            return res.redirect('/horse/dashboard');
          }
          res.render('horse/editHorse', {
            formData: horse,
            rolePermissons: req.user?.role?.permissions,
            failMessage: req.session.failMessage,
            successMessage: req.session.successMessage
          });
          req.session.failMessage = null; // Clear the fail message after rendering
          req.session.successMessage = null; // Clear the success message after rendering
        } catch (err) {
          console.error(err);
          req.session.failMessage = 'Server error';
          return res.redirect('/horse/dashboard');
        }
      });
      HorseRouter.post('/edit/:id',Verify, VerifyRole(), Validate, async (req, res) => {
        try {
          const horse = await Horse.findByIdAndUpdate(req.params.id, req.body, { runValidators: true });
          if (!horse) {
            req.session.failMessage = 'Horse not found';
            return res.redirect('/horse/dashboard');
          }
          req.session.successMessage = 'Horse updated successfully!';
          res.redirect('/horse/dashboard'
          );
        } catch (err) {
          console.error(err);
      
          const errorMessage = err.errors
            ? Object.values(err.errors).map(e => e.message).join(' ')
            : 'Server error';
      
          return res.render('horse/editHorse', {
            permissionList: await Permissions.find(),
            formData: { ...req.body, _id: req.params.id },
            successMessage: null,
            failMessage: errorMessage,
          });
        }
      });

      HorseRouter.delete('/delete/:id',Verify, VerifyRole(), async (req, res) => {
        try {
          const horse = await Horse.findByIdAndDelete(req.params.id);
          if (!horse) {
            req.session.failMessage = 'Horse not found';
            res.status(404).json({ message: 'Horse not found' });
          }
          res.status(200).json({ message: 'Horse deleted successfully' });
        } catch (err) {
          console.error(err);
          req.session.failMessage = 'Server error';
          res.status(500).json({ message: 'Server error' });
        }
      });
      HorseRouter.delete('/deleteNote/:id',Verify,VerifyRole(), async (req,res) =>{
        try{
          const horse = await Horse.findById(req.params.id);
          if (!horse) {
            req.session.failMessage = 'Horse not found';
            res.status(404).json({ message: 'Horse not found' });
          }
          let notes = horse.Notes
          notes.forEach(note => {
            if(note.note === req.body.note){
              notes.remove(note);
            }
          });
            horse.Notes = notes;
            await Horse.findByIdAndUpdate(req.params.id,horse, { runValidators: true })
            res.status(200).json({ message: 'Horse deleted successfully' });


     } catch (err) {
          console.error(err);
          req.session.failMessage = 'Server error';
          res.status(500).json({ message: 'Server error' });
        }
     
     });
     HorseRouter.post('/newNote/:id',Verify,VerifyRole(), async (req,res) =>{
      try{
        console.log('start')
        const horse = await Horse.findById(req.params.id);
        const newNote = {
          note: req.body.note,
          timestamp: Date.now()
        }    
        console.log(horse)
        horse.Notes.push(newNote);
        await Horse.findByIdAndUpdate(req.params.id, horse, { runValidators: true})
        res.status(200).json({ message: 'Note added successfully!'})
             } catch (err) {
          console.error(err);
          req.session.failMessage = 'Server error';
          res.status(500).json({ message: 'Server error' });
        }

    });

export default HorseRouter;