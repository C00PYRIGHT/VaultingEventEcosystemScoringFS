import mongoose from 'mongoose';
import Vaulter from './Vaulter.js';


const EntriesSchema = new mongoose.Schema({
    Vaulter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'vaulters',
        required: [true, 'Vaulter required!'],
    },
    Category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'categorys',
        required: [true, 'Category required!'], 
    },
    Horse: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'horses',
        required: [true, 'Horse required!'],
    },
    Lunger: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'lungers',
        required: [true, 'Lunger required!'],
    },
    EntryDate: {
        type: Date,
        default: Date.now,
    },
    Status: {
        type: String,
        enum: ['registered', 'withdrawn', 'confirmed', 'cancelled'],
        default: 'registered',
    }
}, { timestamps: true });

export default mongoose.model('entries', EntriesSchema);