const mongoose = require("mongoose");


const UG_Form_Schema = new mongoose.Schema({
    UserId: { type: String, required: true },
    Student_Name: { type: String, required: true },
    Father_Name: { type: String, required: true },
    Registry_No: { type: String, required: false },
    Date_of_First_Submission: { type: Date, default: Date }, 
    Semester: { type: String, required: true },
    FeeVoucher: { type: String, required: false }, 
    Degree: {
        type: String, 
        required: true,
    },
    Department: {
        type: String,
        required: true,
    },
    Courses: {
        type: []
    },
    RegularORExtra: { type: String, required: false },
    FeePaid: { type: Number, required: true },
    AuthoritiesApproval: {
        type: []
    },
    FormStatus:{type:String,required:true,default:'incomplete'},
}, { timestamps: true });

const Gs10 = new mongoose.model('Gs10', UG_Form_Schema);
module.exports = Gs10;