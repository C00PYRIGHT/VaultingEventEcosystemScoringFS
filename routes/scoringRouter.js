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
import { log } from 'console';
import { watch } from 'fs/promises';
import ScoreSheetTemp from '../models/ScoreSheetTemp.js';
import TableMapping from '../models/TableMapping.js';
import ScoreSheet from '../models/ScoreSheet.js';
import Score from '../models/Score.js';
import { calculateScore } from '../services/scoreCalculations.js';



const scoringRouter = express.Router();

scoringRouter.get('/', Verify, VerifyRole(), async (req, res) => {
  try {
    const now = new Date();
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
    const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0, 0));
    const day = await DailyTimeTable.findOne({ Date: { $gte: start, $lt: end } })
    if (!day) {
      req.session.failMessage = 'No timetable for today';
      return  res.redirect('/dashboard');
    }else {
    
    const timetableParts = await TimetablePart.find({dailytimetable : day._id}).populate('Category').exec();

    res.render('scoringJudge/dashboard', {
      timetableParts: timetableParts,
      day: day,
      rolePermissons: req.user?.role?.permissions,
      failMessage: req.session.failMessage,
      successMessage: req.session.successMessage,
      user: req.user
    });
    req.session.failMessage = null;
    req.session.successMessage = null;}

  } catch (err) {
    logger.error(err + ' User: ' + req.user.username);
    req.session.failMessage = 'Server error';
    return res.redirect('/admin/dashboard');
  }
});

scoringRouter.get('/program/:id', Verify, VerifyRole(), async (req, res) => {
  try {
    const timetablePart = await TimetablePart.findById(req.params.id)
      .populate('Category')
      .populate({
        path: 'StartingOrder.Entry',
        populate: [
          { path: 'vaulter' },
          { path: 'category' },
          { path: 'lunger' },
          { path: 'horse' }
        ]
      })
      .exec();
    if(timetablePart.drawingDone === false){
      req.session.failMessage = 'Drawing not done yet for this timetable part';
      return res.redirect('/scoring');
    }
    if(timetablePart.conflictsChecked === false){
      req.session.failMessage = 'Conflicts not checked yet for this timetable part';
      return res.redirect('/scoring');
    }
    if (!timetablePart) {
      req.session.failMessage = 'Timetable part not found';
      return res.redirect('/scoring');
    }
    let JudgeName = "";
    let tablebyJudge = "";
    timetablePart.JudgesList = timetablePart.JudgesList.filter(j => j.JudgeUserID.toString() === req.user._id.toString());
    if (timetablePart.JudgesList.length === 0) {
       JudgeName = "Not authorized judge"; 
    }
    else {
      const JudgeUser = await User.findById(timetablePart.JudgesList[0].JudgeUserID).exec();
       JudgeName = JudgeUser.fullname;
      tablebyJudge = timetablePart.JudgesList[0].Table;

    }

    const ScoreSheetsSubmitted = await ScoreSheet.find({
      TimetablePartId: req.params.id,
      EventId: res.locals.selectedEvent._id,
      'Judge.userId': req.user._id}).select('EntryId');



    const entries = await Entries.find({ event : res.locals.selectedEvent._id })
    .populate('vaulter')
    .populate('category')
    .populate('lunger')
    .populate('horse').exec();

    res.render('scoringJudge/perprogram', {
      ScoreSheetsSubmitted: ScoreSheetsSubmitted,
      tablebyJudge: tablebyJudge,
      judgeName: JudgeName,
      timetablePart: timetablePart,
      entries: entries,
      rolePermissons: req.user?.role?.permissions,
      failMessage: req.session.failMessage,
      successMessage: req.session.successMessage,
      user: req.user
    });
    req.session.failMessage = null;
    req.session.successMessage = null;

  } catch (err) {
    logger.error(err + ' User: ' + req.user.username);
    req.session.failMessage = 'Server error';
    return res.redirect('/scoring');
  }
});

scoringRouter.get('/newscoresheet/:entryid/:tpid', Verify, VerifyRole(), async (req, res) => {
  try {

    const  judgeID = req.user._id;
    

    
    const timetablePart = await TimetablePart.findById(req.params.tpid).populate('dailytimetable').exec();

    let JudgeName = "";
    let tablebyJudge = "";
    timetablePart.JudgesList = timetablePart.JudgesList.filter(j => j.JudgeUserID.toString() === judgeID.toString());
    
    const ScoreSheetsSubmitted = await ScoreSheet.find({
      TimetablePartId: req.params.tpid,
      EntryId: req.params.entryid,
      EventId: res.locals.selectedEvent._id,
      'Judge.userId': judgeID}).exec();
    if(ScoreSheetsSubmitted.length > 0){
      req.session.failMessage = 'You have already submitted a score sheet for this entry in this timetable part';
      return res.redirect('/scoring/program/' + req.params.tpid );}
    
    if (timetablePart.JudgesList.length === 0) {
       JudgeName = "Not authorized judge"; 
       req.session.failMessage = 'You are not assigned as a judge for this timetable part';
       return res.redirect('/scoring');
    }
    else {
      const JudgeUser = await User.findById(timetablePart.JudgesList[0].JudgeUserID).exec();
       JudgeName = JudgeUser.fullname;
      tablebyJudge = timetablePart.JudgesList[0].Table;

    }

    const RoleOfTable = await TableMapping.findOne({ Table: tablebyJudge,TestType: timetablePart.TestType.toLocaleLowerCase() }).exec();
    if (!RoleOfTable) {
      logger.warn(`No RoleOfTable found for Table: ${tablebyJudge}, TestType: ${timetablePart.TestType.toLocaleLowerCase()}. User: ${req.user.username}`);
      req.session.failMessage = 'No role mapping found for your judge table in this timetable part';
      return res.redirect('/scoring');
    }


    const entry = await Entries.findById(req.params.entryid)
    .populate('vaulter')
    .populate('category')
    .populate('lunger')
    .populate('horse').exec();
    if (!entry) {
      req.session.failMessage = 'Entry not found';
      return res.redirect('/scoring');
    }
    if (!timetablePart) {
      req.session.failMessage = 'Timetable part not found';
      return res.redirect('/scoring');
    }



    const scoresheetTemp = await ScoreSheetTemp.findOne({
      TestType: { $regex: new RegExp(`^${timetablePart.TestType}$`, 'i') },
      CategoryId: entry.category._id,
      numberOfJudges: timetablePart.NumberOfJudges,
      typeOfScores: RoleOfTable.Role,


    }).exec();



    
    if (!scoresheetTemp) {
      req.session.failMessage = 'No score sheet template found for this configuration';
      logger.warn(`No ScoreSheetTemp found for TestType: ${timetablePart.TestType}, CategoryId: ${entry.category.CategoryDispName}, numberOfJudges: ${timetablePart.NumberOfJudges}, typeOfScores: ${RoleOfTable.Role}. User: ${req.user.username}`);
      return res.redirect('/scoring/program/' + req.params.tpid );
    }
    const event = await Event.findById(res.locals.selectedEvent._id).exec();

    res.render('scoringJudge/newscoresheetjudge', {
      judgeName: JudgeName,
      judgesTable: tablebyJudge,
      event : event,
      scoresheetTemp: scoresheetTemp,
      formData: { parent: req.params.tpid },
      timetablePart: timetablePart,
      entry: entry,
      rolePermissons: req.user?.role?.permissions,
      failMessage: req.session.failMessage,
      successMessage: req.session.successMessage,
      user: req.user
    });
    req.session.failMessage = null;
    req.session.successMessage = null;

  } catch (err) {
    logger.error(err + ' User: ' + req.user.username);
    req.session.failMessage = 'Server error';
    return res.redirect('/scoring');
  }
});


scoringRouter.post('/newscoresheet', Verify, VerifyRole(), Validate, async (req, res) => {


  try {
  const inputDatasArray = Object.entries(req.body.ScoreSheetInput).map(
    ([key, value]) => ({
      id: key,
      value: String(value),
    })
  );
  req.body.inputDatas = inputDatasArray;
  delete req.body.ScoreSheetInput;
  const entry = await Entries.findById(req.body.EntryId)
    .populate('category')
    .exec();
  req.body.totalScoreBE = calculateScore(req, entry.category);




  const newScoreSheet = new ScoreSheet(req.body);
  await newScoreSheet.save();

  const timetablePart = await TimetablePart.findById(req.body.TimetablePartId)
  timetablePart.StartingOrder.forEach( participant => {
    if(participant.Entry.toString() === req.body.EntryId.toString()){
      participant.submittedtables.push({ JudgeID: req.body.Judge.userId, Table: req.body.Judge.table });

    }
  });
  await timetablePart.save();

  await syncScoreTable(req.body.TimetablePartId, req.body.EntryId, res.locals.selectedEvent._id);

  req.session.successMessage = 'Score sheet saved successfully!';
  return res.redirect('/scoring/program/' + req.body.TimetablePartId);
} catch (err) {
  logger.error(err + ' User: ' + req.user.username);
  const errorMessage = err.errors
    ? Object.values(err.errors).map(e => e.message).join(' ')
    : 'Server error';
  req.session.failMessage = 'Server error: ' + errorMessage;
  return res.redirect('/scoring/program/' + req.body.TimetablePartId);
}

});



//OFFICE ROUTES


scoringRouter.get('/office/dashboard', Verify, VerifyRole(), async (req, res) => {

  const scoreSheets = await ScoreSheet.find({EventId: res.locals.selectedEvent._id})
    .populate({
      path: 'EntryId',
      populate: [
        { path: 'vaulter' },
        { path: 'category' }
      ]
    })
    .populate('TimetablePartId')
    .populate({
      path: 'Judge.userId',
      model: 'users'
    })
    .exec();
  

  res.render('scoringOffice/dashboard', {
    scoreSheets: scoreSheets,
    rolePermissons: req.user?.role?.permissions,
    failMessage: req.session.failMessage,
    successMessage: req.session.successMessage,
    user: req.user
  });
  req.session.failMessage = null;
  req.session.successMessage = null;

});

scoringRouter.get('/office/scoresheet/edit/:id', Verify, VerifyRole(), async (req, res) => {
  try {
    const scoresheet = await ScoreSheet.findById(req.params.id)
      .populate('EventId')
      .populate('TemplateId')
      .populate({
      path: 'TimetablePartId',
      populate: [
        { path: 'dailytimetable' },
      ]
    })
      .populate({
      path: 'Judge.userId',
      model: 'users'
    }).populate({
      path: 'EntryId',
      populate: [
        { path: 'vaulter' },
        { path: 'lunger' },
        { path: 'horse' },
        { path: 'category' }
      ]
    }).exec();





      res.render('scoringJudge/editscoresheetjudge', {
      scoresheet: scoresheet,
      judgeName: scoresheet.Judge.userId.fullname,
      judgesTable: scoresheet.Judge.table,
      event : scoresheet.EventId,
      scoresheetTemp: scoresheet.TemplateId,
      timetablePart: scoresheet.TimetablePartId,
      entry: scoresheet.EntryId,
      rolePermissons: req.user?.role?.permissions,
      failMessage: req.session.failMessage,
      successMessage: req.session.successMessage,
      user: req.user
    });



  } catch (err) {
    logger.error(err + ' User: ' + req.user.username);
    req.session.failMessage = 'Server error';
    return res.redirect('/scoring/office/dashboard');
  }
});


scoringRouter.post('/office/scoresheet/edit/:id', Verify, VerifyRole(), Validate, async (req, res) => {
  editScoreSheet(req, res);
});

scoringRouter.post('/office/scoresheet/edit1/:id', Verify, VerifyRole(), Validate, async (req, res) => {
  editScoreSheet(req, res);
});



scoringRouter.get('/office/scoresheet/new', Verify, VerifyRole(), async (req, res) => {
  try {

    const dailytables = await DailyTimeTable.find({ event: res.locals.selectedEvent._id }).exec();
    const timetableParts = await TimetablePart.find({ dailytimetable: { $in: dailytables.map(dt => dt._id) } }).populate('dailytimetable')
    .populate({
      path: 'StartingOrder',
      populate: [
        { 
          path: 'Entry',
          populate: [
            { path: 'vaulter' }
          ]
        },

      ]
    }).exec();




    res.render('scoringOffice/createscoresheet', {
      timetableParts: timetableParts,
      rolePermissons: req.user?.role?.permissions,
      failMessage: req.session.failMessage,
      successMessage: req.session.successMessage,
      user: req.user
    });
    req.session.failMessage = null;
    req.session.successMessage = null;
  } catch (err) {
    logger.error(err + ' User: ' + req.user.username);
    req.session.failMessage = 'Server error ' + err.message;
    return res.redirect('/scoring/office/dashboard');
  }

});



scoringRouter.post('/office/scoresheet/new', Verify, VerifyRole(), async (req, res) => {
  try {

    req.session.judgeID = req.body.Table;
    res.redirect('/scoring/office/newscoresheet/' + req.body.entry + '/' + req.body.TTprogram );




    req.session.failMessage = null;
    req.session.successMessage = null;
  } catch (err) {
    logger.error(err + ' User: ' + req.user.username);
    req.session.failMessage = 'Server error ' + err.message;
    return res.redirect('/scoring/office/dashboard');
  }

});


scoringRouter.get('/office/newscoresheet/:entryid/:tpid', Verify, VerifyRole(), async (req, res) => {
  try {

    const judgeID = req.session.judgeID;

    
    const timetablePart = await TimetablePart.findById(req.params.tpid).populate('dailytimetable').exec();

    let JudgeName = "";
    let tablebyJudge = "";
    timetablePart.JudgesList = timetablePart.JudgesList.filter(j => j.JudgeUserID.toString() === judgeID.toString());
    
    const ScoreSheetsSubmitted = await ScoreSheet.find({
      TimetablePartId: req.params.tpid,
      EntryId: req.params.entryid,
      EventId: res.locals.selectedEvent._id,
      'Judge.userId': judgeID}).exec();

    console.log(ScoreSheetsSubmitted);
    if(ScoreSheetsSubmitted.length > 0){
      req.session.failMessage = 'You have already submitted a score sheet for this entry in this timetable part';
      return res.redirect('/scoring/office/dashboard' );
    }
    
    if (timetablePart.JudgesList.length === 0) {
       JudgeName = "Not authorized judge"; 
       req.session.failMessage = 'You are not assigned as a judge for this timetable part';
       return res.redirect('/scoring/office/dashboard');
    }
    else {
      const JudgeUser = await User.findById(timetablePart.JudgesList[0].JudgeUserID).exec();
       JudgeName = JudgeUser.fullname;
      tablebyJudge = timetablePart.JudgesList[0].Table;

    }

    const RoleOfTable = await TableMapping.findOne({ Table: tablebyJudge,TestType: timetablePart.TestType.toLocaleLowerCase() }).exec();
    if (!RoleOfTable) {
      logger.warn(`No RoleOfTable found for Table: ${tablebyJudge}, TestType: ${timetablePart.TestType.toLocaleLowerCase()}. User: ${req.user.username}`);
      req.session.failMessage = 'No role mapping found for your judge table in this timetable part';
      return res.redirect('/scoring/office/dashboard');
    }


    const entry = await Entries.findById(req.params.entryid)
    .populate('vaulter')
    .populate('category')
    .populate('lunger')
    .populate('horse').exec();
    if (!entry) {
      req.session.failMessage = 'Entry not found';
      return res.redirect('/scoring/office/dashboard');
    }
    if (!timetablePart) {
      req.session.failMessage = 'Timetable part not found';
      return res.redirect('/scoring/office/dashboard');
    }



    const scoresheetTemp = await ScoreSheetTemp.findOne({
      TestType: { $regex: new RegExp(`^${timetablePart.TestType}$`, 'i') },
      CategoryId: entry.category._id,
      numberOfJudges: timetablePart.NumberOfJudges,
      typeOfScores: RoleOfTable.Role,


    }).exec();



    
    if (!scoresheetTemp) {
      req.session.failMessage = 'No score sheet template found for this configuration';
      logger.warn(`No ScoreSheetTemp found for TestType: ${timetablePart.TestType}, CategoryId: ${entry.category.CategoryDispName}, numberOfJudges: ${timetablePart.NumberOfJudges}, typeOfScores: ${RoleOfTable.Role}. User: ${req.user.username}`);
      return res.redirect('/scoring/office/dashboard' );
    }
    const event = await Event.findById(res.locals.selectedEvent._id).exec();

    res.render('scoringJudge/officenewscoresheetjudge', {
      judgeID: judgeID,
      judgeName: JudgeName,
      judgesTable: tablebyJudge,
      event : event,
      scoresheetTemp: scoresheetTemp,
      formData: { parent: req.params.tpid },
      timetablePart: timetablePart,
      entry: entry,
      rolePermissons: req.user?.role?.permissions,
      failMessage: req.session.failMessage,
      successMessage: req.session.successMessage,
      user: req.user
    });
    req.session.failMessage = null;
    req.session.successMessage = null;

  } catch (err) {
    logger.error(err + ' User: ' + req.user.username);
    req.session.failMessage = 'Server error';
    return res.redirect('/scoring/office/dashboard');
  }
});


scoringRouter.post('/office/newscoresheet', Verify, VerifyRole(), Validate, async (req, res) => {

  console.log(req.body);
  try {
  const inputDatasArray = Object.entries(req.body.ScoreSheetInput).map(
    ([key, value]) => ({
      id: key,
      value: String(value),
    })
  );
  req.body.inputDatas = inputDatasArray;
  delete req.body.ScoreSheetInput;
  const entry = await Entries.findById(req.body.EntryId)
    .populate('category')
    .exec();
  req.body.totalScoreBE = calculateScore(req, entry.category);




  const newScoreSheet = new ScoreSheet(req.body);
  console.log(newScoreSheet);
  await newScoreSheet.save();

  const timetablePart = await TimetablePart.findById(req.body.TimetablePartId)
  timetablePart.StartingOrder.forEach( participant => {
    if(participant.Entry.toString() === req.body.EntryId.toString()){
      participant.submittedtables.push({ JudgeID: req.body.Judge.userId, Table: req.body.Judge.table });

    }
  });
  await timetablePart.save();

  await syncScoreTable(req.body.TimetablePartId, req.body.EntryId, res.locals.selectedEvent._id);

  req.session.successMessage = 'Score sheet saved successfully!';
  return res.redirect('/scoring/office/dashboard');
} catch (err) {
  logger.error(err + ' User: ' + req.user.username);
  const errorMessage = err.errors
    ? Object.values(err.errors).map(e => e.message).join(' ')
    : 'Server error';
  req.session.failMessage = 'Server error: ' + errorMessage;
  return res.redirect('/scoring/office/dashboard');
}

});





scoringRouter.get('/office/scores' , Verify, VerifyRole(), async (req, res) => {

  try {
    const scores = await Score.find({event: res.locals.selectedEvent._id})
    .populate('timetablepart')
    .populate({
      path: 'entry',
      populate: [
        { path: 'vaulter' },
        { path: 'category' }

      ],
      
    }).exec();
    res.render('scoringOffice/scores', {
      scores: scores,
      rolePermissons: req.user?.role?.permissions,
      failMessage: req.session.failMessage,
      successMessage: req.session.successMessage,
      user: req.user
    });
    req.session.failMessage = null;
    req.session.successMessage = null;

  } catch (err) {
    logger.error(err + ' User: ' + req.user.username);
    const ErrMessage = err.errors
      ? Object.values(err.errors).map(e => e.message).join(' ')
      : 'Server error';
    req.session.failMessage = 'Server error: ' + ErrMessage;
    return res.redirect('/scoring/office/dashboard');
  }


});



scoringRouter.post('/office/scores/recalculate/:id' , Verify, VerifyRole(), async (req, res) => {
  try {
    const score = await Score.findById(req.params.id).exec();
    if(!score){
      req.session.failMessage = 'Score not found';
      return res.redirect('/scoring/office/scores');
    }
    req.session.successMessage = 'Score recalculated successfully';
    await syncScoreTable(score.timetablepart, score.entry, res.locals.selectedEvent._id);

    return res.status(200).send('Score recalculated successfully');
  } catch (err) {
    logger.error(err + ' User: ' + req.user.username);
    const ErrMessage = err.errors
      ? Object.values(err.errors).map(e => e.message).join(' ')
      : 'Server error';
    req.session.failMessage = 'Server error: ' + ErrMessage;
    return res.status(500).redirect('/scoring/office/scores');
  }
});








export default scoringRouter;
































