import mongoose from 'mongoose';
import Horse from './Horse';


const LungerSchema = new mongoose.Schema({
        Lungername:{
            type: String,
            required: [true, 'Lunger name required!'],
        },
        feiid:{
            type: String,
            required: [true, 'FEI-ID required!'],
            unique: true,
        },  
        Gender:{
            type: String,
        },
        Nationality:{
            type: String,
            required: [true,'Nationality required!'],
        },
        LungerIncident:{
                    type: [{
                        incidentType: { type: String, required: true, enum :['Injury', 'Withdraw ', 'Yellow card','Warning', 'Elimination', 'Disqualification', 'Other'] },
                        description: { type: String, required: true },
                        User: { type: mongoose.Schema.Types.ObjectId, ref:'users' ,required: true }, // User who reported the incident
                        date: { type: Date, default: Date.now },
                    }],
                    
                },
        
},{ timestamps: true });

export default mongoose.model('lungers', LungerSchema);
