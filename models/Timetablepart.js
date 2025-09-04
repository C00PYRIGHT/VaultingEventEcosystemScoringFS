import mongoose from 'mongoose';
import Category from './Category';

const TimetablePartSchema = new mongoose.Schema({
    event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'events',
        required: [true, 'Event required!'],
    },

        Name: {
            type: String,
            required: [true, 'Timetable part name required!'],
        },
        StartTimePlanned: {
            type: Date,
            required: [true, 'Start time required!'],
        },
        StartTimeReal: {
            type: Date, 
            default: null,
        },
        Category: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: 'categorys',
            required: [true, 'Category required!'],
        },
        TestType: {
            type: String,
            enum: ['Compulsory', 'FreeTest', 'TechTest'],
            required: [true, 'Test type required!'],
        },
        Round: {
            type: String,
            enum: ['1', '2', 'Final'],
            required: [true, 'Round required!'],
        },
        Starters: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: 'Entries',
            required: [true, 'At least one starter required!'],
        },
        StartingOrder: {
            type: [{ Entry: mongoose.Schema.Types.ObjectId, Order: Number, submittedtables: [mongoose.Schema.Types.ObjectId] }],
            ref: 'Entries',
            default: [],
        },
        JudgesList: {
            type: [{JudgeUserID:mongoose.Schema.Types.ObjectId, Table: String, Clerk1: String, Clerk2: String}],
            default: [],
        }
    },{ timestamps: true });
export default mongoose.model('timetableparts', TimetablePartSchema);
