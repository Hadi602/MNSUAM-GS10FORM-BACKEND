const mongoose = require("mongoose")

const CoursesSchema = new mongoose.Schema({
    Degree: {
        type: String,
        required: true,
        unique: true
    },
    Program: {
        type: [],
        required: false,
        unique: true
    },
    Courses: {
        type: [
            {
                Program_name: { type: String },
                Course_no: { type: String, unique: true, index: true },
                Course_name: { type: String, unique: true },
                Credit_hour: { type: Number },
                Course_status: { type: String, enum: ["MAJOR", "MINOR", "COMPULSORY", "AUDIT"] },
            }
        ]
    }

}, { timestamps: true })

const Courses = new mongoose.model("Courses", CoursesSchema);

module.exports = Courses