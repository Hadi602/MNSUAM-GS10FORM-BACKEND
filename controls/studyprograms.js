const catchAsyncError = require('../middlewares/catchAsyncError')
const ErrorHandler = require('../utils/errorHandler');
const courses = require('../src/models/courses_model')


// degree creation
const degreeCreation = catchAsyncError(
    async (req, res, next) => {
        const { Degree } = req.body;
        const admin = req.Admin;
        if (admin) {
            const findRecord = await courses.findOne({ Degree });
            if (findRecord) {
                return next(new ErrorHandler('Program already exist!', 202))
            }
            await courses.create({
                Degree: Degree,
            })
            return res.status(200).json({ message: "successfuly created!" })
        } else {
            return next(new ErrorHandler('Bad Request', 400))
        }
    }
)



// course creation
const createCourse = catchAsyncError(
    async (req, res, next) => {
        const admin = req.Admin;
        if (admin) {
            const { Degree, Course_no, Course_name, Credit_hour, Course_status } = req.body;
            if (!Degree || !Course_no || !Course_name || !Credit_hour || !Course_status) {
                return next(new ErrorHandler('Incomplete Information', 406))
            }


            // finding course that already exist in the degree
            const findCourse = await courses.findOne({ $and: [{ Degree }, { "Courses.Course_no": Course_no }] }).populate("Courses")
            // console.log(findCourse);
            if (findCourse) {
                return next(new ErrorHandler('Course already Exist in this Program!.', 202))
            }

            // creating new course in the requested degree
            const findDegreeAndInsertNewCourse = await courses.findOneAndUpdate({ Degree }, {
                $addToSet: {
                    Courses: {
                        Course_no,
                        Course_name,
                        Credit_hour,
                        Course_status
                    }
                },
            }
                , { new: true }
            );
            if (findDegreeAndInsertNewCourse) {
                return res.status(200).json({ message: "Successfully created!" })
            } else {
                return next(new ErrorHandler('Not Found!', 202))
            }
        } else {
            return next(new ErrorHandler('Bad Request', 400))
        }
    }
)



// fetch all courses
const allCourses = catchAsyncError(
    async (req, res, next) => {
        const admin = req.Admin;
        if (admin) {
            const findCourse = await courses.find({});
            if (findCourse.length === 0) {
                return next(new ErrorHandler('No Program Created yet!', 202))
            }
            // const setCourse = {
            //     id: findCourse._id
            // }
            return res.status(200).json({ course: findCourse })
        } else {
            return next(new ErrorHandler('Bad Request', 400))
        }
    }
)



// fetch single Degree
const singleDegree = catchAsyncError(
    async (req, res, next) => {
        const admin = req.Admin;
        // const { id } = req.body
        const { _id } = req.query;
        // console.log('query',_id);
        if (admin) {
            const findCourse = await courses.findOne({ _id });
            if (findCourse) {
                return res.status(200).json({ course: findCourse })
            } else {
                return next(new ErrorHandler('No Course Found!', 202))
            }
        } else {
            return next(new ErrorHandler('Bad Request', 400))
        }
    }
)



// fetch single course for updation
const singleCourseInfo = catchAsyncError(
    async (req, res, next) => {
        const admin = req.Admin;
        if (admin) {
            const params = req.params.id
            // query to get only one  match element from an array very impotant
            const findCourse = await courses.findOne({ "Courses._id": params }, { Courses: { $elemMatch: { _id: params } }, _id: 0 });
            // console.log(findCourse);
            if (!findCourse) {
                return next(new ErrorHandler('no course found!', 400))
            }
            return res.status(200).json({ course: findCourse })
        } else {
            return next(new ErrorHandler('Bad Request', 400))
        }
    }
)



// updating individual course
const updateSingleCourse = catchAsyncError(
    async (req, res, next) => {
        const admin = req.Admin;
        if (admin) {
            const { Course_no, Course_name, Course_status, Credit_hour, _id } = req.body;
            if (!Course_no || !Course_name || !Credit_hour || !Course_status) {
                return next(new ErrorHandler('Incomplete Information', 406))
            }

            const updateCourse = await courses.findOneAndUpdate({ "Courses._id": _id }, {

                "Courses.$.Course_no": Course_no,
                "Courses.$.Course_name": Course_name,
                "Courses.$.Course_status": Course_status,
                "Courses.$.Credit_hour": Credit_hour,

            },
                { new: true })
            if (updateCourse) {
                return res.status(200).json({ course: updateCourse })
            } else {
                return next(new ErrorHandler('No Course Found!', 202))
            }

        } else {
            return next(new ErrorHandler('Bad Request', 400))
        }
    }
)



// deleting single course
const deleteCourse = catchAsyncError(
    async (req, res, next) => {
        const admin = req.Admin;
        if (admin) {
            let params = req.params.id;
            const deleteCourse = await courses.findOneAndUpdate({ "Courses._id": params }, {
                $pull: {
                    Courses: {
                        _id: params
                    }
                }
            }, { new: true })
            if (deleteCourse) {
                return res.status(200).json({ message: "succes" })
            } else {
                return next(new ErrorHandler('No Course Found!', 202))
            }
        } else {
            return next(new ErrorHandler('Bad Request', 400))
        }
    }
)
module.exports = { degreeCreation, createCourse, allCourses, singleDegree, singleCourseInfo, updateSingleCourse, deleteCourse }