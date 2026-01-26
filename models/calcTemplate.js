import mongoose from 'mongoose';

const calcSchema = new mongoose.Schema({

    round1FirstP: {

            type: Number,
            required: [true, 'Round 1 first percentage required!'],

    },
    round1SecondP: {

            type: Number,
            required: [true, 'Round 1 second percentage required!'],
        
    },
    round2FirstP: {
            type: Number,
            required: [true, 'Round 2 first percentage required!'],

    }
    

},{ timestamps: true });

export default mongoose.model('calculationtemplates', calcSchema);
