const catchAsyncError = require('../middlewares/catchAsyncError')
const adminsModel = require("../src/models/admin_model");
const announcementModel = require("../src/models/announcement");
const programModel = require("../src/models/courses_model");
const Gs10FormModel = require("../src/models/form_model");
const ErrorHandler = require('../utils/errorHandler');


const HomePageData = catchAsyncError(
    async (req, res, next) => {
        const { Id } = req.body;

        if (!Id) {
            return next(new ErrorHandler('Missing Information', 406))
        }
        console.log('admin id', Id);

        // finding roles programs forms announcements
        const findAuthorities = await adminsModel.find({}).select('-_id username').lean().exec();
        const findAnnouncements = await announcementModel.find({}).select('Title StartingDate _id').lean().exec();
        const findPrograms = await programModel.find({}).select('Degree -_id').lean().exec();
        const findGs10Form = await Gs10FormModel.find({}).select('AuthoritiesApproval FormStatus UserId createdAt _id').lean().exec();




        return res.status(200).json({ admins: findAuthorities, announcements: findAnnouncements, programs: findPrograms, gs10Form: findGs10Form })

    }
);

module.exports = { HomePageData }