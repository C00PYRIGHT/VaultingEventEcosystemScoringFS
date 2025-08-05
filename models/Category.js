import mongoose from 'mongoose';


const CategorySchema = new mongoose.Schema({
        CategoryDispName:{
            type: String,
            required: [true, 'Category name required!'],
            unique: true,
        },
        Type:{
            type: String,
            enum: ['Individual', 'Squad','PDD'],
            required: [true, 'Category type required!'],
        },
        Stars:{
            type: Number,
            required: [true, 'Stars required!'],
            default: 0, // Default stars for the category
        },
        Gender:{
            type: String,
            enum: ['Male', 'Female'],
        },
        ReqTestTypes: {
            type: {
                Comp: { type: Boolean, required: true, default: false }, // Competition test
                FreeTest: { type: Boolean, required: true, default: false }, // Free test
                TechnicalTest: { type: Boolean, required: true, default: false }, // Technical test
            },
            required: [true, 'Required test types must be specified!'],
        },
        Agegroup: {
            type: String,
            enum: ['Children', 'Junior', 'Senior', 'Young Vaulter'],
            required: [true, 'Age group required!'],
        },
        Star: {
            type: Number,
            required: [true, 'Star level required!'],
            default: 0, // Default star level for the category
            max: 4, // Assuming a maximum of 4 stars
            min: 1, // Assuming a minimum of 1 star

        },
        ScoreType: {
            type: {
                Type: { type: String, required: true, enum: ['Compulsory','FreeTest','TechTest'] },
                Horse: { type: Number, required: true, default: 0.0 }, // Horse score
                Artistic: { type: Number, required: true, default: 0.0 }, // Acrobatics score
                Technical: { type: Number, required: true, default: 0.0 }, // Technical score
            },
        },
        
        
},{ timestamps: true });

export default mongoose.model('categorys', CategorySchema);
