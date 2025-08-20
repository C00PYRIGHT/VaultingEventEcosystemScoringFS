import mongoose from 'mongoose';


const PermissionSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    displayName: { type: String, required: true },
    requestType: { type: String, enum: ['GET', 'POST', 'PUT', 'DELETE'], required: true },
    attachedURL: { type: [String], required: true },

},{ timestamps: true });

export default mongoose.model('permission', PermissionSchema);
