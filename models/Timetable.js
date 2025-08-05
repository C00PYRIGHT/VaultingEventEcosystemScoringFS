import mongoose from 'mongoose';


const TimeTableSchema = new mongoose.Schema({
    timetablepart: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'timetableparts',
        required: [true, 'Timetable part required!'],
    },
    EventDisplayName: {
        type: String,
        required: [true, 'Event display name required!'],
    },
    EventDate: {
        type: Date,
        required: [true, 'Event date required!'],
    },
    Location: {
        type: String,
        required: [true, 'Location required!'],
    },
    StartTime: {
        type: Date,
        required: [true, 'Start time required!'],
    },
    EndTime: {
        type: Date,
        required: [true, 'End time required!'],
    },

}, { timestamps: true });       

export default mongoose.model('timetables', TimeTableSchema);