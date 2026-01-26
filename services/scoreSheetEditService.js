import Entries from '../models/Entries.js';
import TimetablePart from '../models/Timetablepart.js';
import ScoreSheet from '../models/ScoreSheet.js';
import { logger } from '../logger.js';
import { syncScoreTable } from './scoreSync.js';ß


export async function editScoreSheet(req, res){

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




  const scoreSheet = await ScoreSheet.findByIdAndUpdate(req.params.id, req.body, { runValidators: true });
  await scoreSheet.save();
  
  const timetablePart = await TimetablePart.findById(req.body.TimetablePartId)
  
  timetablePart.StartingOrder.forEach( participant => {
    
    if(participant.Entry.toString() === req.body.EntryId.toString()){
      if(!participant.submittedtables.some(st => st.JudgeID.toString() === req.body.Judge.userId.toString() && st.Table === req.body.Judge.table)){
      participant.submittedtables.push({ JudgeID: req.body.Judge.userId, Table: req.body.Judge.table });
      }
    }
  });
  await timetablePart.save();

  await syncScoreTable(req.body.TimetablePartId, req.body.EntryId, res.locals.selectedEvent._id);

  req.session.successMessage = 'Score sheet saved successfully!';
  return res.redirect('/scoring/office/dashboard' );
} catch (err) {
  logger.error(err + ' User: ' + req.user.username);
  const errorMessage = err.errors
    ? Object.values(err.errors).map(e => e.message).join(' ')
    : 'Server error';
  req.session.failMessage = 'Server error: ' + errorMessage;
  return res.redirect('/scoring/office/dashboard' );
}

}