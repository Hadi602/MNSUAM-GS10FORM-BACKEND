const catchAsyncError = require('../middlewares/catchAsyncError')
const admins = require("../src/models/admin_model");
const ErrorHandler = require('../utils/errorHandler');


// create roles
const createRole = catchAsyncError(
    async (req, res, next) => {
        const { username, email, password, isRole } = req.body;
        if (!username || !email || !password || !isRole) {
            return next(new ErrorHandler('Incomplete Information', 406))
        }
        const admin = req.Admin;
        if (admin.isRole === "Admin") {
            // finding existing adminRole and otherwise creating new one
            const findAdmin = await admins.findOne({ username, email, password })
            if (findAdmin) {
                return next(new ErrorHandler('already exist!', 202))
            }
            const createNewRole = await admins({
                username,
                email,
                password,
                isRole,
                status: false,
                UserImage: ""
            }).save();
            res.status(200).json({ newUser: createNewRole })
        } else {
            return next(new ErrorHandler('Bad Request', 400))
        }
    }
);



// get all records of authority
const fetchRecords = catchAsyncError(
    async (req, res, next) => {
        const admin = req.Admin;
        if (admin) {
            const fetchRecords = await admins.find({})
            if (fetchRecords.length === 0) {
                return next(new ErrorHandler('No Record found!', 202))
            }
            return res.status(200).json({ record: fetchRecords })
        } else {
            return next(new ErrorHandler('Bad Request', 400))
        }
    }
)



// get single authority info for updation
const singleAuthorityInfo = catchAsyncError(
    async (req, res, next) => {
        const params = req.params.id;
        const admin = req.Admin;
        if (admin) {
            // query to get only one match emelent 
            const findAuthority = await admins.findOne({ _id: params });
            if (!findAuthority) {
                return next(new ErrorHandler('user not found!', 202))
            }
            const specifiedData = {
                id: findAuthority._id,
                username: findAuthority.username,
                email: findAuthority.email,
                password: findAuthority.password,
                isRole: findAuthority.isRole
            }
            return res.status(200).json({ user: specifiedData })
        } else {
            return next(new ErrorHandler('Bad Request', 400))
        }


    }
)



// update role of authority
const updateAuthority = catchAsyncError(
    async (req, res, next) => {
        const { username, email, password, isRole, _id } = req.body;
        if (!username || !email || !password || !isRole || !_id) {
            return next(new ErrorHandler('Incomplete Information', 406))
        }
        const admin = req.Admin;
        if (admin.isRole === "Admin") {
            // prevent self updation
            if (admin._id.toString() === _id) {
                return next(new ErrorHandler('Bad Request', 400))
            }
            const updateAuthorityRole = await admins.findByIdAndUpdate({ _id }, {
                username,
                email,
                password,
                isRole
            },
                { new: true })
            return res.status(200).json({ updateAuthority: updateAuthorityRole })
        } else {
            return next(new ErrorHandler('Bad Request', 400))
        }
    }
)



// deleting record of admin
const deleteAuthority = catchAsyncError(
    async (req, res, next) => {
        let params = req.params.id;
        const admin = req.Admin;
        if (admin.isRole === "Admin") {
            // prevent self deletion
            if (admin._id.toString() === params) {
                return next(new ErrorHandler('Bad Request', 400))
            }
            const deleteAuthority = await admins.findByIdAndDelete({ _id: params });
            if (deleteAuthority) {
                return res.status(200).json({ message: "Deleted Successfully!" })
            } else {
                return next(new ErrorHandler('Not found!', 400))
            }
        } else {
            return next(new ErrorHandler('Bad Request', 400))
        }

    }
)

module.exports = { createRole, fetchRecords, singleAuthorityInfo, updateAuthority, deleteAuthority }