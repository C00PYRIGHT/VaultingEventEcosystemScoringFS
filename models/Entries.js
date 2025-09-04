import mongoose from 'mongoose';


const EntriesSchema = new mongoose.Schema({
    event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'events',
        required: [true, 'Event required!'],
    },
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
    Type: {
        type: String,
        enum: ['Individual', 'Squad','PDD'],
        required: [true, 'Entry type required!']
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

EntriesSchema.pre('validate', function(next) {
    if (this.Type === 'Squad' && Array.isArray(this.Vaulter) && this.Vaulter.length > 6) {
        return next(new Error('Squad entry cannot have more than 6 vaulters.'));
    }
    if (this.Type === 'PDD' && Array.isArray(this.Vaulter) && this.Vaulter.length > 2) {
        return next(new Error('PDD entry cannot have more than 2 vaulters.'));
    }
    if (this.Type === 'Individual' && Array.isArray(this.Vaulter) && this.Vaulter.length > 1) {
        return next(new Error('Individual entry cannot have more than 1 vaulter.'));
    }
    next();
});

export default mongoose.model('entries', EntriesSchema);