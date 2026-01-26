import mongoose from 'mongoose';

const ScoreSchema = new mongoose.Schema({
    event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'events',
        required: [true, 'Event required!'],
    },
    entry: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'entries',
        required: [true, 'Entry required!'],
    },
    timetablepart: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'timetableparts',
        required: [true, 'Timetable part required!'],
    },
    scoresheets: [{
        scoreId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'scoresheets',
            required: [true, 'Score required!'],
        },
        table: {
            type: String,
            required: [true, 'Table required!'],
        }
    }],
    TotalScore: {
        type: Number,
        required: [true, 'Score required!'],
    },
},{ timestamps: true });

export default mongoose.model('scores', ScoreSchema);
