import mongoose from "mongoose";

const TableSchema = new mongoose.Schema(
    {
        JudgeTableID: {
            type: String,
            required: [true, 'Judge Table ID required!'],
        },
       
    },
    { timestamps: true }
);

export default mongoose.model('tables', TableSchema);
