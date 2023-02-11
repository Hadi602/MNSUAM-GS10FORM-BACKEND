const jwt = require("jsonwebtoken");
const refreshModel = require("../src/models/refresh_token")
const catchAsyncError = require('./catchAsyncError')
const ErrorHandler = require('../utils/errorHandler')
const generateRefreshToken = require("../utils/refreshToken")
const user = require("../src/models/user_model");
const admin = require("../src/models/admin_model");



const refreshMiddleware = catchAsyncError(
    async (req, res, next) => {
        const { RfT } = req.cookies;
        const refreshTokenFormACookie = RfT?.split("._HHQ")[1]
        if (!refreshTokenFormACookie) {
            return next(new ErrorHandler('unauthorized', 401))
        }
        const validRefreshToken = jwt.verify(refreshTokenFormACookie, process.env.RefreshToken_Secret)
        if (!validRefreshToken) {
            return next(new ErrorHandler('Token is not Valid!', 404))
        }
        const refreshTokenuserRecord = await refreshModel.findOne({ _id: validRefreshToken._id })

        if (refreshTokenuserRecord.AdminId) {
            const validateAdmin = await admin.findOne({ _id: refreshTokenuserRecord.AdminId })
            const token = validateAdmin.generateAccessToken()
            const updateUserAccessToken = await admin.findByIdAndUpdate(
                { _id: validateAdmin._id },
                {
                    activation: true,
                    status: true,
                    AccessToken: token
                }, { new: true }

            ).select('-AccessToken').populate('PendingFormQueue', 'createdAt Semester Student_Name Registry_No Department Degree FeePaid FormStatus Courses AuthoritiesApproval FeeVoucher _id RegularORExtra')
            req.Admin = updateUserAccessToken
            req.token = token //access token
            req.refreshToken = refreshTokenFormACookie //refresh token
            return next();
        } else if (refreshTokenuserRecord.UserId) {
            const validateUser = await user.findOne({ _id: refreshTokenuserRecord.UserId })
            const token = validateUser.generateAccessToken()
            const updateUserAccessToken = await user.findByIdAndUpdate(
                { _id: validateUser._id },
                {
                    $set: {
                        activation: true,
                        status: true,
                        AccessToken: token
                    }
                }, { new: true }

            ).select('-AccessToken')
            req.User = updateUserAccessToken
            req.token = token //access token
            req.refreshToken = refreshTokenFormACookie //refresh token
            return next();
        } else {
            return next(new ErrorHandler('User not Found!', 404))
        }
    }
)
module.exports = refreshMiddleware;