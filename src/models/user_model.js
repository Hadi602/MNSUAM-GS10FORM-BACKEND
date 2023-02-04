const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const jwt = require('jsonwebtoken')
const validator = require("validator")

const IncrementId = mongoose.Schema({
    _id: { type: String, required: true },
    seqId: { type: Number, default: 0 }
})

var counter = mongoose.model('counter', IncrementId);


const usersSchema = new mongoose.Schema({
    username: { type: String, required: ['name is required', true] },
    email: { type: String, unique: true, required: ['email is required', true], validate: [validator.isEmail, "please enter a valid email"] },
    password: { type: String, required: ['password is required', true], select: false },
    UserId: { type: Number },
    CNIC: { type: String, required: true, unique: true },
    Type: { type: String, required: false, },
    isRole: { type: String, default: "USER" },
    UserImage: { type: String, default: "" },
    GS10Form: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Gs10',
            required: false
        }
    ],
    GS10FormSubmissionStatus: { type: String, required: true, default: 'false' },
    status: { type: Boolean },
    AccessToken: { type: String },
    activation: { type: Boolean }, // login
    authorization: { type: Boolean }, //registration
}, { timestamps: true });


usersSchema.pre('save', async function (req, res, next) {
    try {
        var doc = this;
        let data = await counter.findByIdAndUpdate({ _id: "1" }, { $inc: { seqId: 1 } }, { new: true, upsert: true });
        if (data) {
            doc.UserId = data.seqId;
            next()
        } else {
            console.log("not incrementing id ");
        }
    } catch (error) {
        console.log(error);
    }
})


usersSchema.methods.generateAccessToken = function () {
    return this.AccessToken = jwt.sign({ _id: this._id }, process.env.AccessToken_Secret, {
        subject: process.env.UserToken_Subject,
        expiresIn: process.env.AccessToken_Expire,
        algorithm: process.env.Token_Algorithum
    })
}

const Users = new mongoose.model("Users", usersSchema);

module.exports = Users

