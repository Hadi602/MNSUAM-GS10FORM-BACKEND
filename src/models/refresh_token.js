const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const jwt = require('jsonwebtoken')

const refreshTokenSchema = new mongoose.Schema({
    refreshToken: { type: String },
    UserId: {
        type: Schema.Types.ObjectId,
        ref: 'Users',
        required: false
    },
    AdminId: {
        type: Schema.Types.ObjectId,
        ref: 'Admins',
        required: false
    }

}); 

refreshTokenSchema.methods.generateRefreshToken = function () {
    return this.refreshToken = jwt.sign({ _id: this._id }, process.env.RefreshToken_Secret, {
        expiresIn: process.env.RefreshToken_Expire
    })
}

const refreshToken = new mongoose.model("refreshToken", refreshTokenSchema);

module.exports = refreshToken
