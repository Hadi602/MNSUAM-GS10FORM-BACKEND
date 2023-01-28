const catchAsyncError = require('../middlewares/catchAsyncError')
const admins = require("../src/models/admin_model");
const ErrorHandler = require('../utils/errorHandler');


// create roles
const createRole = catchAsyncError(
    async (req, res, next) => {
        const { role, NewEmail, NewPassword, MyEmail, MyPassword, username,cnic } = req.body;

        if (!username || !NewEmail || !NewPassword || !role || !cnic) {
            return next(new ErrorHandler('Incomplete Information', 406))
        }
        const findAuthority = await admins.findOne({ username, email: NewEmail, password: NewPassword })
        if (findAuthority) {
            return next(new ErrorHandler('already exist!', 202))
        }

        const findSuperAdmin = await admins.findOne({ $and: [{ email: MyEmail }, { isRole: 'ADMIN' }, { password: MyPassword }] });
        if (!findSuperAdmin) {
            return next(new ErrorHandler('Bad Request', 400))
        }
console.log('ok');
        const createNewRole = await admins({
            username,
            email: NewEmail, password: NewPassword,
            isRole: role,
            status: false,
            UserImage: "",
            CNIC:cnic,
            authorization:true
        }).save();
        res.status(201).json({ newAuthority: createNewRole })
    }
);



// get all records of authority
const fetchRecords = catchAsyncError(
    async (req, res, next) => {
        const admin = req.Admin;
        if (admin) {
            const fetchRecords = await admins.find({}).select("+password")
            if (fetchRecords.length === 0) {
                return next(new ErrorHandler('No Record found!', 202))
            }
            return res.status(200).json({ Authorities: fetchRecords })
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
        const { currenRole, updatedEmail, updatedPassword, updatedRole, MyEmail, MyPassword, userId, userName } = req.body;
        console.log(currenRole, updatedEmail, updatedPassword, updatedRole, MyEmail, MyPassword, userId);

        if (!currenRole || !updatedEmail || !updatedPassword || !updatedRole || !userId || !MyEmail || !MyPassword) {
            return next(new ErrorHandler('Incomplete Information', 406))
        }
        const findSuperAdmin = await admins.findOne({ $and: [{ email: MyEmail }, { isRole: 'ADMIN' }, { password: MyPassword }] });
        if (!findSuperAdmin) {
            return next(new ErrorHandler('Bad Request', 400))
        }
        // // prevent self updation
        // if (findSuperAdmin._id.toString() === userId) {
        //     return next(new ErrorHandler('Bad Request', 400))
        // }
        const updateAuthorityRole = await admins.findByIdAndUpdate({ _id: userId }, {
            username: userName,
            email: updatedEmail,
            password: updatedPassword,
            isRole: updatedRole,
            WhoChangeThisRecord: findSuperAdmin._id
        },
            { new: true })
        return res.status(200).json({ Authority: updateAuthorityRole })
    }
)



// deleting record of admin
const deleteAuthority = catchAsyncError(
    async (req, res, next) => {
        let params = req.params.id;
        const admin = req.Admin;
        
        if (admin.isRole === "ADMIN") {
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