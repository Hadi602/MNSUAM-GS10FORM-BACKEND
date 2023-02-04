const announcementModel = require("../src/models/announcement")
const formModel = require("../src/models/form_model")
const userModel = require("../src/models/user_model")
const catchAsyncError = require('../middlewares/catchAsyncError');
const ErrorHandler = require("../utils/errorHandler");




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
                const findAllForms = await formModel.find({ Semester: semester }).select('_id UserId Semester username').lean().exec();
                // console.log('forms', findAllForms.length, findAllForms);

                if (findAllForms.length >= 1) {
                    findAllForms?.map(async (val, index) => {

                        const records = await userModel.findOneAndUpdate({ $and: [{ _id: val.UserId }, { GS10FormSubmissionStatus: 'true' }] }, {
                            $set: {
                                GS10FormSubmissionStatus: 'false'
                            }
                        }, { new: true })
                        if (records) {
                            // saving in DB
                            await announcementModel({
                                Title: title,
                                Semester: semester,
                                Only_For: only_for,
                                Description: AnnouncementDescription,
                                WhoCreated: role,
                                StartingDate: new Date(Date.now()),
                                ClosingDate: closingdate
                            }).save();
                            // console.log('actual record1', records);
                            return res.status(200).json({ message: "successfully created", })
                        } else {
                            // console.log('actual record2', records);
                            return next(new ErrorHandler('No Form updated!', 404))
                        }
                    })
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
                    return res.status(200).json({ message: "successfully created", })
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


module.exports = { CreateAnnouncement, GetAllAnnouncementes }