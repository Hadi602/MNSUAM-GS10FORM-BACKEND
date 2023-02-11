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
            const FormType = req.params.formType;

            const Gs10Form = await Gs10FormModel.find({ RegularORExtra: { $regex: FormType, $options: 'i' } }).lean().exec();

            res.status(200).json({ Gs10Form })
        } else {
            return next(new ErrorHandler('Bad Request', 400))
        }
    }
)



// form for authority to approve or reject
const approveOrReject = catchAsyncError(
    async (req, res, next) => {
        const Admin = req.Admin;
        let { userId } = req.params;
        const { isRole, formStatus, formId, Reason, Queuecheckbox } = req.body;
        // console.log(Admin);
        if (Admin) {
            const updateFormStatusWithAuthSignature = {
                Authority: isRole,
                Status: formStatus,
                Reason: Reason ? Reason : "",
                Date: new Date(Date.now())
            };

            if (formStatus === 'Pending' && Queuecheckbox !== true) {
                return next(new ErrorHandler('Bad Request Not Maintaining Queue!', 400))
            }

            if (!userId || !isRole || !formStatus || !formId) {
                return next(new ErrorHandler('Bad Request', 400))
            }


            const updateGs10Form = await Gs10FormModel.findOneAndUpdate({ _id: formId }, {
                $addToSet: {
                    AuthoritiesApproval: updateFormStatusWithAuthSignature
                },
            }, { new: true })


            // if length is greater than 5 it means now i have to make form status COMPLETED
            const checkingFormAuthLength = updateGs10Form.AuthoritiesApproval;
            if (formStatus!='Pending' && checkingFormAuthLength.length >= 5 && !checkingFormAuthLength.map((val) => { return val.Status }).includes("Rejected")) {

                const updateFormStatus = await Gs10FormModel.findOneAndUpdate({ _id: formId }, {
                    FormStatus: "Complete"
                }, { new: true }).lean().exec()

                if (updateFormStatus) {
                    return res.status(200).json({ Gs10Form: 'Approved and Completed!',admin:Admin })
                }
            }


            // if it status is pending and check is true then update admin doc to add this form in queue
            // console.log(isRole, formStatus, formId, Reason, Queuecheckbox);
            if (formStatus === 'Pending' && Queuecheckbox === true) {
                const updatingAdminQueue = await admins.findOneAndUpdate({ isRole }, {
                    $addToSet: { PendingFormQueue: updateGs10Form._id }
                }, { new: true }).select('-AccessToken')
                // console.log(updatingAdminQueue);
                return res.status(200).json({ Gs10Form: 'Updated Successfully!', message: "Added in Queue",admin:updatingAdminQueue })
            }


            if (updateGs10Form) {
                return res.status(200).json({ Gs10Form: 'Updated Successfully!' })
            } else {
                return next(new ErrorHandler('form not found!', 400))
            }
        } else {
            return next(new ErrorHandler('Bad Request', 400))
        }

    }
)



// @Admin
// Pending Form Operation Approve || Decline
const PendingFormsAction = catchAsyncError(
    async (req, res, next) => {
        const Admin = req.Admin;
        if (Admin) {
            const { formId, adminId, status, isRole } = req.body;

            if (!formId || !adminId || !status || !isRole) {
                return next(new ErrorHandler('Incomplete Information', 406))
            }


            const updatingStatusOfForm = await Gs10FormModel.findOneAndUpdate({ _id: formId, AuthoritiesApproval: { $elemMatch: { Authority: isRole } } }, {
                $set: {
                    "AuthoritiesApproval.$.Authority": isRole,
                    "AuthoritiesApproval.$.Status": status,
                    "AuthoritiesApproval.$.Reason": '',
                    "AuthoritiesApproval.$.Date": new Date(Date.now())
                }
            },
                { new: true })

            if (updatingStatusOfForm) {
                const removeFormFromAdminQueue = await admins.findOneAndUpdate({ _id: adminId }, { $pull: { PendingFormQueue: formId } }, { new: true })
                return res.status(200).json({ admin:removeFormFromAdminQueue })

            } else {
                return next(new ErrorHandler('No Record Updated!', 409))
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
            }
        } else {
            return next(new ErrorHandler('Bad Request', 400))
        }



    }
)



// 


module.exports = { AllGs10Forms, approveOrReject, updateGs10Form, PendingFormsAction }