const jwt = require("jsonwebtoken");
const user = require("../src/models/user_model");
const admin = require("../src/models/admin_model");
const catchAsyncError = require('./catchAsyncError')
const ErrorHandler = require('../utils/errorHandler') 

const authMiddleware = catchAsyncError(
    async (req, res, next) => {
        const { AcsT } = req.cookies;
        const AccessToken = AcsT?.split("._HHQ")[1]
        if (!AccessToken) {
            return next(new ErrorHandler('unauthorized user', 401))
        }
        const userData = jwt.verify(AccessToken, process.env.AccessToken_Secret)
        if (!userData) {
            return next(new ErrorHandler('User not Found! ExpT', 404))
        }
        const validateUser = await user.findOne({ _id: userData._id })
        const validateAdmin = await admin.findOne({ _id: userData._id })
        if (validateUser) {
            req.User = validateUser
            return next();
        } else if (validateAdmin) {
            req.Admin = validateAdmin
            return next();
        } else {
            return next(new ErrorHandler('User not Found!', 404))
        }
    }
)

module.exports = authMiddleware;