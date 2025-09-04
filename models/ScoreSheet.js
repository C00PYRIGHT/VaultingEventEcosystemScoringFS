import mongoose from "mongoose";

const ScoreSheetSchema = new mongoose.Schema(
    {
            EventId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "events",
            required: [true, "Event ID required!"],
        },
        TestType: {
            type: String,
            enum: ['compulsory', 'freestyle','technical'],
            required: [true, "Test type required!"],
        },
        EntryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "entries",
            required: [true, "Entry ID required!"],
        },
        Round: {
            type: String,
            required: [true, "Round required!"],
        },
        CategoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "categorys",
            required: [true, "Category ID required!"],
        },
        JudgeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            required: [true, "Judge ID required!"],
        },
        TableId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "tables",
            required: [true, "Table ID required!"],
        },
        AddedByJudge: {
            type: Boolean,
            required: [true, "Added by judge required!"],
            default: true,
        },
        type: { type: String, enum: ['Horse', 'Comp', 'Exercises', 'Artistic', 'Tech'], required: true },
        scores: [
        {
        criterion: { type: String, required: true }, 
        value: { type: Number, required: true }
      }
    ]
  }, { timestamps: true }
);

ScoreSheetSchema.index(
  { EventId: 1, EntryId: 1, Round: 1 , TestType: 1, CategoryId: 1, type: 1 },
  { unique: true }
);
export default mongoose.model("scoresheets", ScoreSheetSchema);