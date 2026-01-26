import mongoose from 'mongoose';

const ResultGSchema = new mongoose.Schema({
    event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'events',
        required: [true, 'Event required!'],
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'categorys',
        required: [true, 'Category required!'],
    },
    calcTemplate: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'calculationtemplates',
        required: [true, 'Calculation template required!'],
    },
    round1First: {

            type: mongoose.Schema.Types.ObjectId,
            ref: 'timetableparts',

    },
    round1Second: {

            type: mongoose.Schema.Types.ObjectId,
            ref: 'timetableparts',
        
    },
    round2First: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'timetableparts',

    }
    

},{ timestamps: true });

export default mongoose.model('resultgroup', ResultGSchema);
