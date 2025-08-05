import mongoose from 'mongoose';
import Category from './Category';

const TimetablePartSchema = new mongoose.Schema({
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
            type: mongoose.Schema.Types.ObjectId,
            ref: 'categorys',
            required: [true, 'Category required!'],
        },
        TestType: {
            type: String,
            enum: ['Compulsory', 'FreeTest', 'TechTest'],
            required: [true, 'Test type required!'],
        },
        Starters: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: 'Entries',
            required: [true, 'At least one starter required!'],
        },


    },{ timestamps: true });
export default mongoose.model('timetableparts', TimetablePartSchema);
