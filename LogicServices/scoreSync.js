import Score from '../models/Score.js';
import TimetablePart from '../models/Timetablepart.js';
import ScoreSheet from '../models/ScoreSheet.js';
import { logger } from '../logger.js';



export async function syncScoreTable(timetablePartId, EntryID, EventId){
  const score = await Score.find({
    timetablepart: timetablePartId,
    entry: EntryID,
    event: EventId
  }).exec();
  
  const timetablePart = await TimetablePart.findById(timetablePartId).exec();
  
  const ScoreSheets = await ScoreSheet.find({
    TimetablePartId: timetablePartId,
    EntryId: EntryID,
    EventId: EventId
  }).exec();

  if(score.length == 0 && ScoreSheets.length == timetablePart.NumberOfJudges){
    const newScore = new Score({
      timetablepart: timetablePartId,
      entry: EntryID,
      event: EventId,
      scoresheets:  ScoreSheets.map(ss => ({ scoreId: ss._id, table: ss.Judge.table })),
      TotalScore: ScoreSheets.reduce((acc, curr) => acc + curr.totalScoreBE, 0) / ScoreSheets.length
    });
    await newScore.save();
    logger.db(`New score created for timetablePartId: ${timetablePartId}, EntryId: ${EntryID}, EventId: ${EventId}`);
    return newScore;
  } else if(score.length == 1){
    const existingScore = score[0];
    existingScore.scoresheets = ScoreSheets.map(ss => ({ scoreId: ss._id, table: ss.Judge.table }));

    existingScore.TotalScore = ScoreSheets.reduce((acc, curr) => acc + curr.totalScoreBE, 0) / ScoreSheets.length;
    await existingScore.save();
    logger.db(`Score updated for timetablePartId: ${timetablePartId}, EntryId: ${EntryID}, EventId: ${EventId}`);
    return existingScore;
  } else {
    logger.error(`Multiple scores found for timetablePartId: ${timetablePartId}, EntryId: ${EntryID}, EventId: ${EventId}`);
    return null;
  }
}