import mongoose from 'mongoose';
import { type } from 'os';

const ScoreSchema = new mongoose.Schema({
    vaulter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'vaulters',
        required: [true, 'Vaulter required!'],
    },
    horse: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'horses',
        required: [true, 'Horse required!'],
    },
    lunger: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'lungers',
        required: [true, 'Lunger required!'],
    },
    round: {
        type: String,
        required: [true, 'Round required!'],
    },
    type: {
        type: String,
        enum: ['compulsory', 'freestyle','technical'],
        required: [true, 'Type required!'],
    },

    schedulePart: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'scheduleparts',
        required: [true, 'Schedule part required!'],
    },
    scoresheets: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'scoressheet',
    required: [true, 'Score required!'],
    },

    score: {
        type: Number,
        required: [true, 'Score required!'],
    },
},{ timestamps: true });

export default mongoose.model('scores', ScoreSchema);
