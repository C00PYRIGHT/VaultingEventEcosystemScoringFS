import express from 'express';

import {logger} from '../logger.js';
import { Login } from "../controllers/auth.js";
import { Logout } from "../controllers/auth.js";
import Validate from "../middleware/Validate.js";
import { check, param } from "express-validator";
import { Verify, VerifyRole } from "../middleware/Verify.js";
import DailyTimeTable from '../models/DailyTimeTable.js';
import Permissions from '../models/Permissions.js';
import User from '../models/User.js';
import TimetablePart from '../models/Timetablepart.js';
import Category from '../models/Category.js';
import Event from '../models/Event.js';
import Entries from '../models/Entries.js'; // vagy a te modell fájlneved
import resultGroup from '../models/resultGroup.js';
import calcTemplate from '../models/calcTemplate.js';
import resultGenerator from '../models/resultGenerator.js';
import Score from '../models/Score.js';
import { FirstLevel, SecondLevel, TotalLevel } from '../services/resultCalculations.js';




const resultRouter = express.Router();

resultRouter.get("/calcTemp/dashboard", Verify, VerifyRole(), async (req, res) => {
    try {
        res.render("resultCalc/dashboard", {
            resultCalcs: await calcTemplate.find(),
            rolePermissons: req.user?.role?.permissions,
            failMessage: req.session.failMessage,
            successMessage: req.session.successMessage,
            user: req.user
        });
        req.session.failMessage = null; // Üzenet törlése a session-ből  
        req.session.successMessage = null; // Üzenet törlése a session-ből
    } catch (err) {
        logger.error(err + " User: "+ req.user.username);
      
          const errorMessage = err.errors
            ? Object.values(err.errors).map(e => e.message).join(' ')
            : 'Server error';


          res.session.failMessage = errorMessage;
          return res.redirect('/dashboard')

    }
});
resultRouter.get("/calcTemp/new", Verify, VerifyRole(), async (req, res) => {
    try {
        const categories = await Category.find();
        res.render("resultCalc/newResultCalc", {
            formData: req.session.formData || {},
            categoryList: categories,
            rolePermissons: req.user?.role?.permissions,
            failMessage: req.session.failMessage,
            successMessage: req.session.successMessage,
            user: req.user
        });
        req.session.failMessage = null; // Üzenet törlése a session-ből  
        req.session.successMessage = null; // Üzenet törlése a session-ből
    } catch (err) {
        logger.error(err + " User: "+ req.user.username);
      
          const errorMessage = err.errors
            ? Object.values(err.errors).map(e => e.message).join(' ')
            : 'Server error';
      


          res.session.failMessage = errorMessage;
          return res.redirect('/result/calcTemp/dashboard')

         
        

    }
});
resultRouter.post("/calcTemp/new", Verify, VerifyRole(), async (req, res) => {
    try {

        if(Number(req.body.round2FirstP)+Number(req.body.round1FirstP)+Number(req.body.round1SecondP) !==100){
            req.session.failMessage = "The sum of the percentages must be 100%.";
            res.session.formData = req.body;
            return res.redirect("/result/calcTemp/new");
            
        }
        const calcTemp = new calcTemplate(req.body);

        await calcTemp.save();
        logger.db(`Result calculation template ${calcTemp._id} created by user ${req.user.username}.`);
        req.session.successMessage = "Result calculation template created successfully.";
        res.redirect("/result/calcTemp/dashboard");
    } catch (err) {
        logger.error(err + " User: "+ req.user.username);
      
          const errorMessage = err.errors
            ? Object.values(err.errors).map(e => e.message).join(' ')
            : 'Server error';
      


            return res.render("resultCalc/newResultCalc", {
                        formData: req.body,
                        categoryList: categories,
                        rolePermissons: req.user?.role?.permissions,
                        failMessage: errorMessage,
                        successMessage: req.session.successMessage,
                        user: req.user
                });


    }

});
resultRouter.get("/calcTemp/edit/:id", Verify, VerifyRole(),  async (req, res) => {
    try {
        const calcTemp = await calcTemplate.findById(req.params.id);
        res.render("resultCalc/editResultCalc", {
            formData: calcTemp,
            rolePermissons: req.user?.role?.permissions,
            failMessage: req.session.failMessage,
            successMessage: req.session.successMessage,
            user: req.user
        });
        req.session.failMessage = null; // Üzenet törlése a session-ből  
        req.session.successMessage = null; // Üzenet törlése a session-ből
    } catch (err) {
        logger.error(err + " User: "+ req.user.username);
      
          const errorMessage = err.errors
            ? Object.values(err.errors).map(e => e.message).join(' ')
            : 'Server error';
      


          res.session.failMessage = errorMessage;
          return res.redirect('/result/calcTemp/dashboard')

    }
});

resultRouter.post("/calcTemp/edit/:id", Verify, VerifyRole(), async (req, res) => {
    try {
         if( Number(req.body.round2FirstP)+Number(req.body.round1FirstP)+Number(req.body.round1SecondP) !=100){
            const sum = Number(req.body.round2FirstP)+Number(req.body.round1FirstP)+Number(req.body.round1SecondP);
            logger.error('Percentage sum error by user: ' + req.user.username + sum);
            req.session.failMessage = "The sum of the percentages must be 100%.";
            return res.redirect("/result/calcTemp/edit/" + req.params.id);

        }
        const calcTemp = await calcTemplate.findByIdAndUpdate(req.params.id, req.body);
        

        logger.db(`Result calculation template ${calcTemp._id} edited by user ${req.user.username}.`);
        req.session.successMessage = "Result calculation template edited successfully.";
        res.redirect("/result/calcTemp/dashboard");
    } catch (err) {
        logger.error(err + " User: "+ req.user.username);
      
          const errorMessage = err.errors
            ? Object.values(err.errors).map(e => e.message).join(' ')
            : 'Server error';
      


            return res.render("resultCalc/editResultCalc", {
                        formData: { ...req.body, _id: req.params.id },
                        rolePermissons: req.user?.role?.permissions,
                        failMessage: errorMessage,
                        successMessage: req.session.successMessage,
                        user: req.user

    });
    }

});


resultRouter.delete("/calcTemp/delete/:id", Verify, VerifyRole(), async (req, res) => {
    try {
        if (await resultGroup.findOne({ calcTemplate: req.params.id }) || await resultGenerator.findOne({ calcTemplate: req.params.id })) {
            logger.error('Attempt to delete in-use calculation template by user: ' + req.user.username);
            return res.status(400).send("Cannot delete calculation template as it is in use by a result group.");
        }




        const calcTemp = await calcTemplate.findByIdAndDelete(req.params.id);
        logger.db(`Result calculation template ${calcTemp._id} deleted by user ${req.user.username}.`);
        res.status(200).send("Calculation template deleted successfully.");
    } catch (err) {
        logger.error(err + " User: "+ req.user.username);
      
          const errorMessage = err.errors
            ? Object.values(err.errors).map(e => e.message).join(' ')
            : 'Server error';
      


          res.session.failMessage = errorMessage;
          return res.redirect('/result/calcTemp/dashboard')

    }
});



//Result Generator

resultRouter.get("/generator/dashboard", Verify, VerifyRole(), async (req, res) => {
    try {
        const generators = await resultGenerator.find().populate('category').populate('calcSchemaTemplate');
        res.render("resultGen/dashboard", {
            generators: generators,
            rolePermissons: req.user?.role?.permissions,
            failMessage: req.session.failMessage,
            successMessage: req.session.successMessage,
            user: req.user
        });
        req.session.failMessage = null; // Üzenet törlése a session-ből  
        req.session.successMessage = null; // Üzenet törlése a session-ből
    } catch (err) {
        logger.error(err + " User: "+ req.user.username);
      
          const errorMessage = err.errors
            ? Object.values(err.errors).map(e => e.message).join(' ')
            : 'Server error';
      


          res.session.failMessage = errorMessage;
          return res.redirect('/dashboard')

    }
});

resultRouter.get("/generator/new", Verify, VerifyRole(), async (req, res) => {
    try {
        const categories = await Category.find();
        const calcTemplates = await calcTemplate.find();
        res.render("resultGen/newResultGen", {
            formData: req.session.formData || {},
            categories: categories,
            resultCalcs: calcTemplates,
            rolePermissons: req.user?.role?.permissions,
            failMessage: req.session.failMessage,
            successMessage: req.session.successMessage,
            user: req.user
        });
        req.session.failMessage = null;
        req.session.successMessage = null;
    } catch (err) {
        logger.error(err + " User: "+ req.user.username);
      
          const errorMessage = err.errors
            ? Object.values(err.errors).map(e => e.message).join(' ')
            : 'Server error';
      


          res.session.failMessage = errorMessage;
          return res.redirect('result/generator/dashboard')

    }
});

resultRouter.post("/generator/new", Verify, VerifyRole(), async (req, res) => {
    try {
        const existingGenerator = await resultGenerator.findOne({ category: req.body.category });
        if (existingGenerator) {
            req.session.failMessage = "A result generator for the selected category already exists.";
            req.session.formData = req.body;
            return res.redirect("/result/generator/new");
        }

        const newGenerator = new resultGenerator(req.body);
        await newGenerator.save();
        logger.db(`Result generator ${newGenerator._id} created by user ${req.user.username}.`);
        req.session.successMessage = "Result generator created successfully.";
        res.redirect("/result/generator/dashboard");
    }   catch (err) {
        logger.error(err + " User: "+ req.user.username);
      
          const errorMessage = err.errors
            ? Object.values(err.errors).map(e => e.message).join(' ')
            : 'Server error';
        const categories = await Category.find();
        const calcTemplates = await calcTemplate.find();
          return res.render("resultGen/newResultGen", {
            formData: req.body,
            categories: categories,
            resultCalcs: calcTemplates,
            rolePermissons: req.user?.role?.permissions,
            failMessage:  errorMessage,
            successMessage: req.session.successMessage,
            user: req.user

    });
    }
});


resultRouter.post("/generator/status/:id", Verify, VerifyRole(), async (req, res) => { 
    try {
        const generator =  await resultGenerator.findById(req.params.id);
        if (!generator) {
            return res.status(404).send("Result generator not found.");
        }
        generator.active = req.body.status;
        await generator.save();
        logger.db(`Result generator ${generator._id} status updated to ${req.body.status} by user ${req.user.username}.`);
        res.status(200).send("Result generator status updated successfully.");
    } catch (err) {
        logger.error(err + " User: "+ req.user.username);
      
          const errorMessage = err.errors
            ? Object.values(err.errors).map(e => e.message).join(' ')
            : 'Server error';
      


          res.session.failMessage = errorMessage;
          return res.status(500).send("Error updating result generator status. " + errorMessage);

    }
}); 


resultRouter.get("/generator/edit/:id", Verify, VerifyRole(),  async (req, res) => {
    try {
        const generator = await resultGenerator.findById(req.params.id);
        const categories = await Category.find();
        const calcTemplates = await calcTemplate.find();
        res.render("resultGen/editResultGen", {
            formData: generator,
            categories: categories,
            resultCalcs: calcTemplates,
            rolePermissons: req.user?.role?.permissions,
            failMessage: req.session.failMessage,
            successMessage: req.session.successMessage,
            user: req.user
        });
        req.session.failMessage = null; // Üzenet törlése a session-ből  
        req.session.successMessage = null; // Üzenet törlése a session-ből
    } catch (err) {
        logger.error(err + " User: "+ req.user.username);
      
          const errorMessage = err.errors
            ? Object.values(err.errors).map(e => e.message).join(' ')
            : 'Server error';
      


          res.session.failMessage = errorMessage;
          return res.redirect('result/generator/dashboard')

    }
});

resultRouter.post("/generator/edit/:id", Verify, VerifyRole(), async (req, res) => {
    try {
        const existingGenerator = await resultGenerator.findOne({ category: req.body.category, _id: { $ne: req.params.id } });
        if (existingGenerator) {
            req.session.failMessage = "A result generator for the selected category already exists.";
            return res.redirect("/result/generator/edit/" + req.params.id);
        }

        const generator = await resultGenerator.findByIdAndUpdate(req.params.id, req.body);
        logger.db(`Result generator ${generator._id} edited by user ${req.user.username}.`);
        req.session.successMessage = "Result generator edited successfully.";
        res.redirect("/result/generator/dashboard");
    } catch (err) {
        logger.error(err + " User: "+ req.user.username);
      
          const errorMessage = err.errors
            ? Object.values(err.errors).map(e => e.message).join(' ')
            : 'Server error';
      
        const categories = await Category.find();
        const calcTemplates = await calcTemplate.find();    

        return res.render("resultGen/editResultGen", {
            formData: { ...req.body, _id: req.params.id },
            categories: categories,
            resultCalcs: calcTemplates,
            rolePermissons: req.user?.role?.permissions,
            failMessage: errorMessage,
            successMessage: req.session.successMessage,
            user: req.user
        });

    }
});

resultRouter.delete("/generator/delete/:id", Verify, VerifyRole(), async (req, res) => {
    try {
        const generator = await resultGenerator.findByIdAndDelete(req.params.id);
        logger.db(`Result generator ${generator._id} deleted by user ${req.user.username}.`);
        res.status(200).send("Result generator deleted successfully.");
    } catch (err) {
        logger.error(err + " User: "+ req.user.username);
      
          const errorMessage = err.errors
            ? Object.values(err.errors).map(e => e.message).join(' ')
            : 'Server error';
      


          res.session.failMessage = errorMessage;
          return res.redirect('result/generator/dashboard')

    }
});


// Result Groups

resultRouter.get("/groups/dashboard", Verify, VerifyRole(), async (req, res) => {
    try {
        const resultGroups = await resultGroup.find({ event: res.locals.selectedEvent?._id })
            .populate('event')
            .populate('category')
            .populate('calcTemplate')
            .populate({
                path: 'round1First',
                populate: { path: 'dailytimetable' }
            })
            .populate({
                path: 'round1Second',
                populate: { path: 'dailytimetable' }
            })
            .populate({
                path: 'round2First',
                populate: { path: 'dailytimetable' }
            });
        resultGroups.sort((a, b) => b.category.Star - a.category.Star);
        res.render("resultGroup/dashboard", {
            resultGroups: resultGroups,
            rolePermissons: req.user?.role?.permissions,
            failMessage: req.session.failMessage,
            successMessage: req.session.successMessage,
            user: req.user
        });
        req.session.failMessage = null; // Üzenet törlése a session-ből  
        req.session.successMessage = null; // Üzenet törlése a session-ből
    } catch (err) {
        logger.error(err + " User: "+ req.user.username);
      
          const errorMessage = err.errors
            ? Object.values(err.errors).map(e => e.message).join(' ')
            : 'Server error';
      


          res.session.failMessage = errorMessage;
          return res.redirect('/dashboard')

    }
});

resultRouter.get("/groups/edit/:id", Verify, VerifyRole(), async (req, res) => {
    try {
        const categories = await Category.find();
        const resultGroups = await resultGroup.findById(req.params.id);
        const calcTemplates = await calcTemplate.find();
        const dailyTimetables = await DailyTimeTable.find({ event: res.locals.selectedEvent?._id }).select('_id');
        
        const timetableParts = await TimetablePart.find({ dailytimetable: { $in: dailyTimetables.map(dt => dt._id) } }).populate('dailytimetable');
        const timetablePartsRound1 = await TimetablePart.find({ dailytimetable: { $in: dailyTimetables.map(dt => dt._id) }, Round: '1' }).populate('dailytimetable');
        const timetablePartsRound2 = await TimetablePart.find({ dailytimetable: { $in: dailyTimetables.map(dt => dt._id) }, Round: '2 - Final' }).populate('dailytimetable');
      
        res.render("resultGroup/editResultGroup", {
            categories: categories,
            formData: resultGroups,
            resultCalcs: calcTemplates,
            timetableParts: timetableParts,
            timetablePartsRound1: timetablePartsRound1,
            timetablePartsRound2: timetablePartsRound2,
            rolePermissons: req.user?.role?.permissions,
            failMessage: req.session.failMessage,
            successMessage: req.session.successMessage,
            user: req.user
        });
        req.session.failMessage = null; // Üzenet törlése a session-ből  
        req.session.successMessage = null; // Üzenet törlése a session-ből
    } catch (err) {
        logger.error(err + " User: "+ req.user.username);
      
          const errorMessage = err.errors
            ? Object.values(err.errors).map(e => e.message).join(' ')
            : 'Server error';
      


          res.session.failMessage = errorMessage;
          return res.redirect('/result/groups/dashboard')

    }
});

resultRouter.post("/groups/edit/:id", Verify, VerifyRole(), async (req, res) => {
    try {
        if(req.body.round1First === req.body.round1Second || req.body.round1First === req.body.round2First || req.body.round1Second === req.body.round2First){
            req.session.failMessage = "The same timetable part cannot be selected for multiple rounds.";
            return res.redirect("/result/groups/edit/" + req.params.id);
        }

        if(req.body.round1First === "") req.body.round1First = null;
        if(req.body.round1Second === "") req.body.round1Second = null;
        if(req.body.round2First === "") req.body.round2First = null;


        const resultGroupDoc = await resultGroup.findByIdAndUpdate(req.params.id, req.body);
        logger.db(`Result group ${resultGroupDoc._id} edited by user ${req.user.username}.`);
        req.session.successMessage = "Result group edited successfully.";
        res.redirect("/result/groups/dashboard");
    } catch (err) {
        logger.error(err + " User: "+ req.user.username);
      
          const errorMessage = err.errors
            ? Object.values(err.errors).map(e => e.message).join(' ')
            : 'Server error';
      


        const categories = await Category.find();
        const calcTemplates = await calcTemplate.find();
        const dailyTimetables = await DailyTimeTable.find({ event: res.locals.selectedEvent?._id }).select('_id');
        
        const timetableParts = await TimetablePart.find({ dailytimetable: { $in: dailyTimetables.map(dt => dt._id) } }).populate('dailytimetable');
        const timetablePartsRound1 = await TimetablePart.find({ dailytimetable: { $in: dailyTimetables.map(dt => dt._id) }, Round: '1' }).populate('dailytimetable');
        const timetablePartsRound2 = await TimetablePart.find({ dailytimetable: { $in: dailyTimetables.map(dt => dt._id) }, Round: '2 - Final' }).populate('dailytimetable');
      
        res.render("resultGroup/editResultGroup", {
            categories: categories,
            formData: { ...req.body, _id: req.params.id },
            resultCalcs: calcTemplates,
            timetableParts: timetableParts,
            timetablePartsRound1: timetablePartsRound1,
            timetablePartsRound2: timetablePartsRound2,
            rolePermissons: req.user?.role?.permissions,
            failMessage: errorMessage,
            successMessage: req.session.successMessage,
            user: req.user
        });

    }
}); 


resultRouter.get("/groups/new", Verify, VerifyRole(), async (req, res) => {
    try {
        const categories = await Category.find();
        const calcTemplates = await calcTemplate.find();
        const dailyTimetables = await DailyTimeTable.find({ event: res.locals.selectedEvent?._id }).select('_id');
        const timetableParts = await TimetablePart.find({ dailytimetable: { $in: dailyTimetables.map(dt => dt._id) } }).populate('dailytimetable');
        const timetablePartsRound1 = await TimetablePart.find({ dailytimetable: { $in: dailyTimetables.map(dt => dt._id) }, Round: '1' }).populate('dailytimetable');
        const timetablePartsRound2 = await TimetablePart.find({ dailytimetable: { $in: dailyTimetables.map(dt => dt._id) }, Round: '2 - Final' }).populate('dailytimetable');
        res.render("resultGroup/newResultGroup", {
            categories: categories,
            formData: req.session.formData || {},
            resultCalcs: calcTemplates,
            timetableParts: timetableParts,
            timetablePartsRound1: timetablePartsRound1,
            timetablePartsRound2: timetablePartsRound2,
            rolePermissons: req.user?.role?.permissions,
            failMessage: req.session.failMessage,
            successMessage: req.session.successMessage,
            user: req.user
        });
        req.session.failMessage = null; // Üzenet törlése a session-ből  
        req.session.successMessage = null; // Üzenet törlése a session-ből
    } catch (err) {
        logger.error(err + " User: "+ req.user.username);
      
          const errorMessage = err.errors
            ? Object.values(err.errors).map(e => e.message).join(' ')
            : 'Server error';
      


          res.session.failMessage = errorMessage;
          return res.redirect('/result/groups/dashboard')

    }
});

resultRouter.post("/groups/new", Verify, VerifyRole(), async (req, res) => {
    try {
        if(req.body.round1First === req.body.round1Second || req.body.round1First === req.body.round2First || req.body.round1Second === req.body.round2First){
            req.session.failMessage = "The same timetable part cannot be selected for multiple rounds.";
            req.session.formData = req.body;
            return res.redirect("/result/groups/new");
        }

        if(req.body.round1First === "") req.body.round1First = null;
        if(req.body.round1Second === "") req.body.round1Second = null;
        if(req.body.round2First === "") req.body.round2First = null;

        req.body.event = res.locals.selectedEvent?._id;

        const newResultGroup = new resultGroup(req.body);
        await newResultGroup.save();
        logger.db(`Result group ${newResultGroup._id} created by user ${req.user.username}.`);
        req.session.successMessage = "Result group created successfully.";
        res.redirect("/result/groups/dashboard");
    } catch (err) {
        logger.error(err + " User: "+ req.user.username);
      
          const errorMessage = err.errors
            ? Object.values(err.errors).map(e => e.message).join(' ')
            : 'Server error';
      

        const categories = await Category.find();
        const calcTemplates = await calcTemplate.find();
        const dailyTimetables = await DailyTimeTable.find({ event: res.locals.selectedEvent?._id }).select('_id');
        const timetableParts = await TimetablePart.find({ dailytimetable: { $in: dailyTimetables.map(dt => dt._id) } }).populate('dailytimetable');
        const timetablePartsRound1 = await TimetablePart.find({ dailytimetable: { $in: dailyTimetables.map(dt => dt._id) }, Round: '1' }).populate('dailytimetable');
        const timetablePartsRound2 = await TimetablePart.find({ dailytimetable: { $in: dailyTimetables.map(dt => dt._id) }, Round: '2 - Final' }).populate('dailytimetable');
        return res.render("resultGroup/newResultGroup", {
            categories: categories,
            formData: req.body,
            resultCalcs: calcTemplates,
            timetableParts: timetableParts,
            timetablePartsRound1: timetablePartsRound1,
            timetablePartsRound2: timetablePartsRound2,
            rolePermissons: req.user?.role?.permissions,
            failMessage: errorMessage,
            successMessage: req.session.successMessage,
            user: req.user
        });

    }
});


resultRouter.delete("/groups/delete/:id", Verify, VerifyRole(), async (req, res) => {
    try {
        const resultGroupDoc = await resultGroup.findByIdAndDelete(req.params.id);
        logger.db(`Result group ${resultGroupDoc._id} deleted by user ${req.user.username}.`);
        req.session.successMessage = "Result group deleted successfully.";
        res.status(200).send("Result group deleted successfully.");
    } catch (err) {
        logger.error(err + " User: "+ req.user.username);
      
          const errorMessage = err.errors
            ? Object.values(err.errors).map(e => e.message).join(' ')
            : 'Server error';
      


          res.session.failMessage = errorMessage;
          return res.redirect('/result/groups/dashboard')

    }
});



resultRouter.post("/groups/generate", Verify, VerifyRole(), async (req, res) => {
    try {

        const activeGenerators = await resultGenerator.find({ active: true });
        for (const generator of activeGenerators) {
            const groupExists = await resultGroup.findOne({ event: res.locals.selectedEvent?._id, category: generator.category });
            if (groupExists) {
                continue; // Skip if group already exists
            }
            
            const newResultGroup = new resultGroup({
                event: res.locals.selectedEvent?._id,
                category: generator.category,
                calcTemplate: generator.calcSchemaTemplate,
            });
            await newResultGroup.save();
            logger.db(`Result group ${newResultGroup._id} generated(auto) by user ${req.user.username}.`);
        }





        req.session.successMessage = "Result groups generated successfully.";
        res.status(200).send("Result groups generated successfully.");
    } catch (err) {
        logger.error(err + " User: "+ req.user.username);
      
          const errorMessage = err.errors
            ? Object.values(err.errors).map(e => e.message).join(' ')
            : 'Server error';
      


          res.session.failMessage = errorMessage;
          return res.redirect('/result/groups/dashboard')

    }
});



resultRouter.get("/", Verify, VerifyRole(), async(req,res)=>{
    try {

        const resultGroups = await resultGroup.find({ event: res.locals.selectedEvent?._id })
            .populate('category')
            .populate('calcTemplate')
            .populate({
                path: 'round1First',
                populate: { path: 'dailytimetable' }
            })
            .populate({
                path: 'round1Second',
                populate: { path: 'dailytimetable' }
            })
            .populate({
                path: 'round2First',
                populate: { path: 'dailytimetable' }
            });
        resultGroups.sort((a, b) => b.category.Star - a.category.Star);
        res.render("results/dashboard", {
            resultGroups: resultGroups,
            rolePermissons: req.user?.role?.permissions,
            failMessage: req.session.failMessage,
            successMessage: req.session.successMessage,
            user: req.user
        });
        req.session.failMessage = null;
        req.session.successMessage = null;
    } catch (err) {
        logger.error(err + " User: "+ req.user.username);
      
          const errorMessage = err.errors
            ? Object.values(err.errors).map(e => e.message).join(' ')
            : 'Server error';
      


          res.session.failMessage = errorMessage;
          return res.redirect('/result/groups/dashboard')

    }

});




resultRouter.get("/detailed/:id/:part", Verify, VerifyRole(), async(req,res)=>{
    try {
        const resultGroupDoc = await resultGroup.findById(req.params.id)
            .populate('category')
            .populate('calcTemplate')
            .populate('round1First')
            .populate('round1Second')
            .populate('round2First');

        if (!resultGroupDoc) {
            req.session.failMessage = "Result group not found.";
            return res.redirect("/result");
        }
        if((req.params.part === 'R1F' && !resultGroupDoc.round1First) ||
           (req.params.part === 'R1S' && !resultGroupDoc.round1Second) ||
           (req.params.part === 'R2F' && !resultGroupDoc.round2First)){
            req.session.failMessage = "Selected timetable part is not defined for this result group.";
            return res.redirect("/result");
        }
        if(['R1F', 'R1S', 'R2F'].includes(req.params.part)){
        
            const data =  await FirstLevel(resultGroupDoc,req.params.part);

            res.render("results/detailedResults", {
                title: resultGroupDoc.category.CategoryDispName + " -- " + data.title,
                resultGroup: resultGroupDoc,
                pointDetailsLevel: 1,
                param: req.params.part,
                results: data.results.sort((a, b) => b.TotalScore - a.TotalScore),
                rolePermissons: req.user?.role?.permissions,
                failMessage: req.session.failMessage,
                successMessage: req.session.successMessage,
                user: req.user
            });
        }
        else if(['R1', 'R2'].includes(req.params.part)){

            const data = await SecondLevel(resultGroupDoc,req.params.part);

            res.render("results/detailedResults", {
                title: resultGroupDoc.category.CategoryDispName + " -- " + data.title,
                resultGroup: resultGroupDoc,
                pointDetailsLevel: 2,
                results: data.results.sort((a, b) => b.TotalScore - a.TotalScore),
                rolePermissons: req.user?.role?.permissions,
                failMessage: req.session.failMessage,
                successMessage: req.session.successMessage,
                user: req.user
            });

        } else if(req.params.part === 'total'){
            const data = await TotalLevel(resultGroupDoc);
            
            res.render("results/detailedResults", {
                title: resultGroupDoc.category.CategoryDispName + " -- Total Results",
                resultGroup: resultGroupDoc,
                pointDetailsLevel: 3,
                results: data.results.sort((a, b) => b.TotalScore - a.TotalScore),
                rolePermissons: req.user?.role?.permissions,
                failMessage: req.session.failMessage,
                successMessage: req.session.successMessage,
                user: req.user
            });
        }
         else {
            req.session.failMessage = "Invalid timetable part specified.";
            return res.redirect("/result");
        }
        req.session.failMessage = null;
        req.session.successMessage = null;
    } catch (err) {
        logger.error(err + " User: "+ req.user.username);
      
          const errorMessage = err.errors
            ? Object.values(err.errors).map(e => e.message).join(' ')
            : 'Server error';
      


          res.session.failMessage = errorMessage;
          return res.redirect('/result/groups/dashboard')

    }
});





export default resultRouter;


