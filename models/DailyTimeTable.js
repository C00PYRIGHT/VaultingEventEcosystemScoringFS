import mongoose from 'mongoose';


const DailyTimeTableSchema = new mongoose.Schema({
    event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'events',
        required: [true, 'Event required!'],
    },
    DayName: {
        type: String,
        required: [true, 'Day name required!'],
    },
    DisplayName: {
        type: String,
        required: [true, 'Display name required!'],
    },
    Date: {
        type: Date,
        required: [true, 'Date required!'],
        unique: [true, 'A Day for this date already exists!'],
    }

}, { timestamps: true });   



export default mongoose.model('daily_timetables', DailyTimeTableSchema);