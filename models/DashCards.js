import mongoose from 'mongoose';


const DashboardCardSchema = new mongoose.Schema({
  dashtype: {
    type: String,
    required: [true, 'Dashboard type is required'],
    enum: ['user', 'admin']
  },
  priority: {
    type: Number,
    required: [true, 'Priority is required'],
    default: 99
  },
  style: {
    type: String,
    required: [true, 'Style is required']
  },
  perm: {
    type: String,
    required: [true, 'Permission is required']
  },
  title: {
    type: String,
    required: [true, 'Title is required']
  },
  text: {
    type: String,
    default: ''
  },
  label: {
    type: [String],
    default: ''
  },
    href: {
    type: [String],
    default: ''
  },

}, { timestamps: true });

export default mongoose.model('dashboarcards', DashboardCardSchema);
