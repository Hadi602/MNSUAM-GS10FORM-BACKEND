const announcementModel = require("../src/models/announcement")
const formModel = require("../src/models/form_model")
const userModel = require("../src/models/user_model")
const catchAsyncError = require('../middlewares/catchAsyncError');
const ErrorHandler = require("../utils/errorHandler");



// @Admin
// CREAT Announcements
const CreateAnnouncement = catchAsyncError(
    async (req, res, next) => {
        const admin = req.Admin;
        if (admin) {
            const { AnnouncementDescription, title, closingdate, role, only_for, semester } = req.body;

            if (!AnnouncementDescription || !title || !only_for) {
                return next(new ErrorHandler('Incomplete Information', 406))
            }

            if (only_for === "students" && closingdate && semester) {
                // console.log(semester);
                // 1.finding forms
                const findAllForms = await formModel.find({ Semester: semester }).select('UserId').lean().exec();
                // console.log('forms', findAllForms.length, findAllForms);

                if (findAllForms.length >= 1) {

                    const ids = findAllForms.map(record => record.UserId);
                    const records = await userModel.updateMany({ _id: { $in: ids }, GS10FormSubmissionStatus: 'true' }, {
                        $set: {
                            GS10FormSubmissionStatus: 'false'
                        }
                    })

                    
                    if (records.modifiedCount >= 1) {
                        // 2. saving in DB
                        const announcement = await announcementModel({
                            Title: title,
                            Semester: semester,
                            Only_For: only_for,
                            Description: AnnouncementDescription,
                            WhoCreated: role,
                            StartingDate: new Date(Date.now()),
                            ClosingDate: closingdate
                        }).save();
                        // console.log('actual record1', records);
                        return res.status(200).json({ message: "successfully created", id: announcement._id })
                    } else {
                        return next(new ErrorHandler('No Form updated!', 404))
                    }

                } else {
                    // no form found
                    return next(new ErrorHandler('No Form Found!', 202))
                }

            } else if (only_for === "authorities") {
                const announcement = await announcementModel({
                    Title: title,
                    Semester: semester ? semester : "",
                    Only_For: only_for,
                    Description: AnnouncementDescription,
                    WhoCreated: role,
                    StartingDate: new Date(Date.now()),
                    ClosingDate: closingdate ? closingdate : null
                }).save();
                if (announcement) {
                    return res.status(200).json({ message: "successfully created", id: announcement._id })
                } else {
                    return next(new ErrorHandler('Error Occured', 400))
                }
            }
        }
    }
);




// @Admin
// GET Announcements
const GetAllAnnouncementes = catchAsyncError(
    async (req, res, next) => {
        const admin = req.Admin;
        if (admin) {
            const fetchAnnouncements = await announcementModel.find({}).lean().exec()
            if (fetchAnnouncements.length === 0) {
                return next(new ErrorHandler('No Record found!', 202))
            }
            return res.status(200).json({ Announcements: fetchAnnouncements })
        } else {
            return next(new ErrorHandler('Bad Request', 400))
        }
    }
)



// @Admin
// DELETE Announcements
const DeleteAnnouncement = catchAsyncError(
    async (req, res, next) => {
        const admin = req.Admin;
        if (admin) {
            const { id } = req.params
            console.log(id);
            const deleteAnnouncement = await announcementModel.findByIdAndDelete({ _id: id }).lean().exec()
            if (deleteAnnouncement) {
                return res.status(200).json({ message: "Deleted Successfully" })
            }
        } else {
            return next(new ErrorHandler('Bad Request', 400))
        }
    }
)




// @User
// GET Announcements
const GetAllAnnouncementesForUsers = catchAsyncError(
    async (req, res, next) => {
        const user = req.User;
        if (user) {
            const fetchAnnouncements = await announcementModel.find({}).lean().exec()
            if (fetchAnnouncements.length === 0) {
                return next(new ErrorHandler('No Record found!', 202))
            }
            return res.status(200).json({ Announcements: fetchAnnouncements })
        } else {
            return next(new ErrorHandler('Bad Request', 400))
        }
    }
)

module.exports = { CreateAnnouncement, GetAllAnnouncementes, DeleteAnnouncement ,GetAllAnnouncementesForUsers}