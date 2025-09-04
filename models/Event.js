import mongoose from "mongoose";

const EventSchema = new mongoose.Schema({
    EventName: {
        type: String,
        required: [true, 'Event name required!'],
        unique: true,
    },
    EventLocation: {
        type: String,
        required: [true, 'Event location required!'],
    },
    EventDirectorName: {
        type: String,
        required: [true, 'Event director name required!'],
    },
    EventDirectorContact: {
        type: String,
        required: [true, 'Event director contact required!'],
    },
    map: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'maps',
    },
    StablingMap: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'maps',
    },  
    DailyTimeTables: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'daily_timetables',
        default: [],
    },
    AssignedOfficials: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'users',
        default: [],
    }
},{ timestamps: true });
export default mongoose.model('events', EventSchema);
    