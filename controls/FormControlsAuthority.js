const catchAsyncError = require('../middlewares/catchAsyncError')
const ErrorHandler = require('../utils/errorHandler');
const admins = require("../src/models/admin_model");
const courses = require('../src/models/courses_model')
const Gs10FormModel = require('../src/models/form_model')
const users = require('../src/models/user_model')
const GS10formPic = require('../utils/imageSetup')



// get all Gs10Forms
const AllGs10Forms = catchAsyncError(
    async (req, res, next) => {
        const Admin = req.Admin;
        if (Admin) {
            const Gs10Form = await Gs10FormModel.find({});
            res.status(200).json({ Gs10Form })
        } else {
            return next(new ErrorHandler('Bad Request', 400))
        }
    }
)



// form for authority to approve or reject
const approveOrReject = catchAsyncError(
    async (req, res, next) => {
        const { isRole } = req.body;
        const Admin = req.Admin;
        if (Admin) {
            const Gs10Forms = await Gs10FormModel.find({ AuthoritiesApproval: { $ne: isRole } })
            // console.log(Gs10Forms);
            if (Gs10Forms) {
                res.status(200).json({ Gs10Form: Gs10Forms })
            } else {
                return next(new ErrorHandler('user not found!', 202))
            }
        } else {
            return next(new ErrorHandler('Bad Request', 400))
        }

    }
)



// update Form with Authority signature
const updateGs10Form = catchAsyncError(
    async (req, res, next) => {
        const { role, id, status } = req.params
        const Admin = req.Admin;
        console.log(role, id, status);

        if (!role || !id || !status) {
            return next(new ErrorHandler('Incomplete Information', 406))
        }

        // creating a object format for saving responce of Authorities
        const uptodateAuthStatus = {
            Authority: role,
            Status: status
        };
        if (Admin) {
            const updateForm = await Gs10FormModel.findOneAndUpdate({ _id: id }, {
                $addToSet: {
                    AuthoritiesApproval: uptodateAuthStatus
                },
            }, { new: true })
            const checking = updateForm.AuthoritiesApproval
            
            if (checking.length >= 4 && !checking.map((val) => { return val.Status }).includes("Rejected")) {

                await Gs10FormModel.findOneAndUpdate({ _id: id }, {
                    FormStatus: "Complete"
                }, { new: true })

            }
            if (role && id && status && updateForm) {
                return res.status(200).json({ GS10Form: updateForm })
            } else {
                return res.status(202).json({ message: "Rejected" })
                console.log("hamza");
            }
        } else {
            return next(new ErrorHandler('Bad Request', 400))
        }



    }
)



// 


module.exports = { AllGs10Forms, approveOrReject, updateGs10Form }