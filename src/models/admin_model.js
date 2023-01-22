const mongoose = require("mongoose");
const jwt=require('jsonwebtoken')
const validator=require("validator")

const AdminSchema = new mongoose.Schema({
    username: { type: String, required: ['name is required', true] },
    email: { type: String, unique: true, required: ['email is required', true], validate: [validator.isEmail, "please enter a valid email"] },
    password: { type: String, required: ['password is required', true], select: false },
    UserImage: { type: String, default: "" },
    isRole: { type: String, default: "Admin" },
    status: { type: Boolean },
    AccessToken: { type: String },
    activation: { type: Boolean },
    authorization: { type: Boolean },
    CNIC:{type:String,required:true, unique:true}
}, { timestamps: true })

AdminSchema.methods.generateAccessToken = function () {
    return this.AccessToken = jwt.sign({_id:this._id}, process.env.AccessToken_Secret, {
        subject: process.env.AdminToken_Subject,
        expiresIn: process.env.AccessToken_Expire,
        algorithm: process.env.Token_Algorithum
    })
}

const Admins = mongoose.model('Admins', AdminSchema);

module.exports = Admins