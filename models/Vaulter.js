import mongoose from 'mongoose';
import Horse from './Horse';
import { type } from 'os';


const VaulterSchema = new mongoose.Schema({
        Vaultername:{
            type: String,
            required: [true, 'Vaulter name required!'],
        },
        feiid:{
            type: String,
            required: [true, 'FEI-ID required!'],
            unique: true,
        },
        gender:{
            type: String,
            enum:['Male','Female', 'Other']
        },
        Bdate:{
            type: Date,
            required: [true, 'Birthdate required!'],
        },
        Nationality:{
            type: String,
            required: [true,  'Nationality required!'],
        },
        VaulterStatus:{
            type: String,
            enum: ['active', 'inactive'],
            default: 'active',
        },  
        ArmNr:{
            type: String,
            required: [true, 'Arm number required!'],
        },  
        VaulterIncident:{
            type: [{
                incidentType: { type: String, required: true, enum :['Injury', 'Withdraw ', 'Yellow card','Warning', 'Elimination', 'Disqualification', 'Other'] },
                description: { type: String, required: true },
                User: { type: mongoose.Schema.Types.ObjectId, ref:'users' ,required: true }, // User who reported the incident
                date: { type: Date, default: Date.now },
            }],
            
        },
        

        
},{ timestamps: true });

export default mongoose.model('vaulters', HorseSchema);
