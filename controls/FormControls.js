const catchAsyncError = require('../middlewares/catchAsyncError')
const ErrorHandler = require('../utils/errorHandler');
const courses = require('../src/models/courses_model')
const Gs10FormModel = require('../src/models/form_model')
const users = require('../src/models/user_model')
const GS10formPic = require('../utils/imageSetup')
const jwt=require('jsonwebtoken')



//  get specific program info for user 
const programforUser = catchAsyncError( 
    async (req, res, next) => {
        const validUser = req.User;
        if (validUser) {
            const { Program } = req.body;
            if (!Program) {
                return next(new ErrorHandler('Incomplete Information', 406))
            }
            const specificProgram = await courses.findOne({ Degree: Program });
            if (specificProgram) {
                res.status(200).json({ SingleProgram: specificProgram });
            }
        } else {
            return next(new ErrorHandler('Bad Request', 400))
        }
    }
)



// get specific user form
const specificUser = catchAsyncError(
    async (req, res, next) => {
        const validUser = req.User;
        const _id=req.params.id;
        // console.log(validUser._id.toString());
        if (validUser) {
            if (!_id) {
                return next(new ErrorHandler('Incomplete Information', 406))
            }

            const fetchSpecificForm = await Gs10FormModel.findOne({ _id });
            if (fetchSpecificForm) {
                return res.status(200).json({ user: fetchSpecificForm })
            }
            return next(new ErrorHandler('user not found!', 202))
        } else {
            return next(new ErrorHandler('Bad Request', 400))
        }
    }
)



// GS10Form creation
const formCreate = catchAsyncError(
    async (req, res, next) => {
        const validUser = req.User;
        if (validUser) {

            const { studentName, fatherName, registrationNumber, cnicNumber, formSubmissionDate, semester, regularStudentOrOther, degree, department, courses, chllanFeeImage, paidFee } = req.body.data;

            // validation
            if (!studentName || !fatherName || !registrationNumber || !cnicNumber || !formSubmissionDate || !semester || !regularStudentOrOther || !degree || !department || courses.length < 1 || !paidFee || !chllanFeeImage) {
                return next(new ErrorHandler('Incomplete Information', 406))
            }


            const findUser = await users.findOne({ _id: validUser._id }).populate('GS10Form')
            // finding that if form already exist or not
            const user = findUser.GS10Form.find((val, index) => {
                // not with semester cz semester change but form submit
                if (registrationNumber === val.Registry_No && studentName === val.Student_Name && regularStudentOrOther === val.RegularORExtra) {
                    return val
                }
            });

            if (user) {
                return next(new ErrorHandler('This form already exists!', 202))
            } else {
                // if UGFormSubmissionStatus is off then here it will add to user document and make it true otherwise it will not add it will true by authority with announcement
                if (findUser.GS10FormSubmissionStatus === 'false') {
                    // saving image in Storage
                    const ImageRes = await GS10formPic(chllanFeeImage, 'Gs10Form')

                    // saving form 
                    const saveGs10Form = await Gs10FormModel({
                        UserId: validUser._id,
                        Student_Name: studentName,
                        Father_Name: fatherName,
                        Registry_No: registrationNumber,
                        Date_of_First_Submission: formSubmissionDate,
                        Semester: semester,
                        FeeVoucher: `/Storage/Forms/${ImageRes}`,
                        Degree: degree,
                        Department: department,
                        Courses: courses,
                        RegularORExtra: regularStudentOrOther,
                        FeePaid: paidFee,
                    }).save();

                    // updating user record
                    await users.findOneAndUpdate({ _id: findUser._id }, {
                        $addToSet: {
                            GS10Form: saveGs10Form._id
                        },
                        GS10FormSubmissionStatus: 'true'
                    }, { new: true });
                    res.status(200).json({ message: "Successfully Created.", GS10Form: saveGs10Form })
                }
            }
        } else {
            return next(new ErrorHandler('Bad Request', 400))
        }
    }
)



// get populated GS10Form single user
const PopulatedUserForms = catchAsyncError(
    async (req, res, next) => {
        const validUser = req.User;
        if (validUser) {
            const UserPopulatedForm = await users.findOne({ _id: validUser._id }).populate('GS10Form');
            if (UserPopulatedForm) {
                res.status(200).json({ GS10Form: UserPopulatedForm?.GS10Form })
            }else{
                return next(new ErrorHandler('Resource Not Found!', 404))
            }

        } else {
            return next(new ErrorHandler('Bad Request', 400))
        }

    }
)





module.exports = { formCreate, programforUser, specificUser, PopulatedUserForms }