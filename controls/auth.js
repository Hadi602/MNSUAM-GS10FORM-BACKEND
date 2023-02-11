const catchAsyncError = require('../middlewares/catchAsyncError')
const users = require("../src/models/user_model");
const admins = require("../src/models/admin_model");
const refreshModel = require("../src/models/refresh_token")
const generateOTP = require('../utils/otp')
const generateRefreshToken = require("../utils/refreshToken")
const generateCookie = require("../utils/cookies")
const ErrorHandler = require('../utils/errorHandler');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken")
const hashedToken = require('../utils/hashToken')
const crypto = require("crypto")




// const usersendResponceRecord={

// }


const Register = catchAsyncError(
    async (req, res, next) => {
        const { username, email, password, CNIC } = req.body;
        if (!username || !email || !password || !CNIC) {
            return next(new ErrorHandler('Invalid credentials', 400))
        }

        // finding existing admin
        if (username === "admin" && email === "admin@gmail.com") {
            const findAdmin = await admins.findOne({ username, email });
            if (findAdmin) {
                return next(new ErrorHandler('You Cannot register with this username and email', 400))
            }

            // creating admin if not found
            const admin = await admins({
                username,
                email,
                password,
                status: false,
                isRole: "ADMIN",
                authorization: true,
                activation: false,
                UserImage: "",
                CNIC: CNIC
            }).save();
            // const token = admin.generateAccessToken()
            // generateOTP(token,admin)

            return res.status(201).json({ success: "Registered Successfully!" })
        }


        // finding existing user
        const findUser = await users.findOne({  $or:[{email},{CNIC}] }).lean().exec()
        if (findUser) {
            return next(new ErrorHandler('This User already Registered!', 400))
        }

        // creating user if not found
        const bcrypPassword = await bcrypt.hash(password, 10);
        const user = await users({
            username,
            email,
            password: bcrypPassword,
            status: false,
            isRole: "USER",
            UserImage: "",
            authorization: true,
            activation: false,
            CNIC: CNIC
        }).save();

        return res.status(201).json({ success: "Registered Successfully!", user });

    }
)



// Otp verification
const OtpVerification = catchAsyncError(async (req, res, next) => {
    const { hash, otp } = req.body;
    if (!hash || !otp) {
        return next({ statusCode: 400, message: responces.verificationFailed })
    }
    const [hashVal, expireTime] = hash.split(".")
    if (Date.now() >= expireTime) {
        return next({ statusCode: 401, message: responces.otpExpired })
    }

    const token = req.RefreshToken;
    const data = `${token}.${otp}.${expireTime}`
    const newhash = crypto.createHmac('sha256', process.env.Secret_key).update(data).digest('hex')
    if (newhash !== hashVal) {
        return next({ statusCode: 401, message: responces.verificationFailed })
    }

    const userId = req.userID
    const AccessToken = jwt.sign({ _id: userId }, process.env.Secret_key, { expiresIn: "1h" });
    const updateuserRecord = await userModel.findByIdAndUpdate({ _id: userId }, { $set: { activation: true, token: AccessToken } }, { new: true, upsert: true })

    res.cookie('AccessToken', AccessToken, {
        httpOnly: true,
        expires: new Date(Date.now() + 1000 * 60 * 60) //60 min
    })
    const { username, useremail, activation, authorization } = updateuserRecord
    return res.status(200).json({ success: true, message: 'OTP validation is done successfully!', name: username, email: useremail, activation, authorization });
})



// login
const Login = catchAsyncError(
    async (req, res, next) => {
        const { email, password } = req.body;

        if (!email || !password) {
            return next(new ErrorHandler('Invalid credentials', 400))
        }

        // finding existing admin and setting token and cookies
        const findAdmin = await admins.findOne({ email, password }).select("+password")

        if (findAdmin) {
            // checking that if user already login or not
            if (findAdmin.status === true && findAdmin.activation === true) {
                return next(new ErrorHandler('User Already Login!', 400))
            }

            const refreshToken = await generateRefreshToken(findAdmin, "Admin", "Login")
            const token = findAdmin.generateAccessToken()

            const { username, email } = findAdmin
            const updateAdminStatus = await admins.findOneAndUpdate(
                { username, email },
                {
                    $set: {
                        activation: true,
                        status: true,
                        AccessToken: token
                    }
                },
                { new: true }
            ).select('-AccessToken')


            // hashing tokens for cookie
            const hashAcsToken = `${hashedToken(token)}._HHQ${token}`
            const hashRefToken = `${hashedToken(refreshToken)}._HHQ${refreshToken}`
            generateCookie("RfT", hashRefToken, new Date(Date.now() + (20 * 24 * 3600000)), res) // for refresh token cookie age set to 1 month
            generateCookie("AcsT", hashAcsToken, new Date(Date.now() + (1000 * 60 * 30)), res) // for access token cookie age set to 30 minutes


            return res.status(200).json({ admin: updateAdminStatus });
        } else {
            // finding existing user and setting token and cookies
            const findUser = await users.findOne({ email }).select("+password")
            if (findUser) {

                // checking that if user already login or not
                if (findUser.status === true && findUser.activation === true) {
                    return next(new ErrorHandler('User Already Login!', 400))
                }

                const hashPasswordCompareMatch = await bcrypt.compare(password, findUser.password)
                if (hashPasswordCompareMatch) {

                    const refreshToken = await generateRefreshToken(findUser, "User", "Login")
                    const token = findUser.generateAccessToken() //build in userschema method

                    const { username, email } = findUser
                    const updateUserStatus = await users.findOneAndUpdate(
                        { username, email },
                        {
                            $set: {
                                activation: true,
                                status: true,
                                AccessToken: token
                            }
                        },
                        { new: true }
                    )

                    // hashing tokens for cookie
                    const hashAcsToken = `${hashedToken(token)}._HHQ${token}`
                    const hashRefToken = `${hashedToken(refreshToken)}._HHQ${refreshToken}`
                    generateCookie("RfT", hashRefToken, new Date(Date.now() + (20 * 24 * 3600000)), res) // for refresh token cookie age set to 1 month
                    generateCookie("AcsT", hashAcsToken, new Date(Date.now() + (1000 * 60 * 30)), res) // for access token cookie age set to 5 minutes



                    return res.status(200).json({ user: updateUserStatus })
                } else {
                    return next(new ErrorHandler('Incorrect Password', 400))
                }
            } else {
                return next(new ErrorHandler('User not Found!', 400))
            }
        }
    }
)



// refresh token
const RefreshUserWithNewToken = catchAsyncError(async (req, res, next) => {
    const validadmin = req.Admin;
    const validuser = req.User;
    const accesstoken = req.token;
    const refreshtoken = req.refreshToken;



    if (validadmin) {
        // hashing tokens for cookie
        const hashAcsToken = `${hashedToken(accesstoken)}._HHQ${accesstoken}`
        const hashRefToken = `${hashedToken(refreshtoken)}._HHQ${refreshtoken}`
        generateCookie("RfT", hashRefToken, new Date(Date.now() + (20 * 24 * 3600000)), res) // for refresh token cookie age set to 1 month
        generateCookie("AcsT", hashAcsToken, new Date(Date.now() + (1000 * 60 * 30)), res) // for access token ookie age set to 5 minutes
        return res.status(200).json({ admin: validadmin })
    } else if (validuser) {
        // hashing tokens for cookie
        const hashAcsToken = `${hashedToken(accesstoken)}._HHQ${accesstoken}`
        const hashRefToken = `${hashedToken(refreshtoken)}._HHQ${refreshtoken}`
        generateCookie("RfT", hashRefToken, new Date(Date.now() + (20 * 24 * 3600000)), res) // for refresh token cookie age set to 1 month
        generateCookie("AcsT", hashAcsToken, new Date(Date.now() + (1000 * 60 * 30)), res) // for access token ookie age set to 5 minutes
        return res.status(200).json({ user: validuser })
    } else {
        return next(new ErrorHandler('Bad request', 400))
    }

})



// logout
const Logout = catchAsyncError(
    async (req, res, next) => {
        const user = req.User;
        const admin = req.Admin;
        if (!user && !admin) {
            return next(new ErrorHandler('No route match', 400))
        }
        if (admin) {
            await admins.findByIdAndUpdate(
                { _id: admin._id },
                {
                    activation: false,
                    status: false,
                    AccessToken: ""
                },
                { new: true }
            )
            res.clearCookie("AcsT")
            res.clearCookie("RfT")
            return res.status(200).json({ message: "User Logout Successfully!" })
        } else if (user) {
            await users.findByIdAndUpdate(
                { _id: user._id },
                {
                    activation: false,
                    status: false,
                    AccessToken: ""
                },
                { new: true }
            )
            res.clearCookie("AcsT")
            res.clearCookie("RfT")
            return res.status(200).json({ message: "User Logout Successfully!" })
        }
    }
)
module.exports = { Register, Login, Logout, RefreshUserWithNewToken }