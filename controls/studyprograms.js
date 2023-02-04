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
                return next(new ErrorHandler('Program already exist!', 409))
            }
            const DegreeCreation = await courses({
                Degree
            }).save()
            if (DegreeCreation) {
                return res.status(201).json({ message: "successfuly created!" })
            } else {
                return next(new ErrorHandler('Internal server error', 500))
            }
        } else {
            return next(new ErrorHandler('Bad Request', 400))
        }
    }
)



// fetching all degrees 
const allDegrees = catchAsyncError(
    async (req, res, next) => {
        const admin = req.Admin;
        if (admin) {
            const findAllDegrees = await courses.find().select('Degree -_id').lean().exec();
            if (findAllDegrees) {
                return res.status(200).json({ message: "All Degree's", Degree: findAllDegrees })
            } else {
                return next(new ErrorHandler('Internal server error', 500))
            }
        } else {
            return next(new ErrorHandler('Bad Request', 400))
        }
    }
)



// Program creation
const programCreation = catchAsyncError(
    async (req, res, next) => {
        const { Degree, Programs } = req.body;
        const admin = req.Admin;
        if (admin) {
            if (!Degree || !Programs) {
                return next(new ErrorHandler('Bad Request', 400))
            }
            const findDegree = await courses.findOne({ Degree });
            // console.log(Programs);
            if (findDegree) {
                const ProgramCreation = await courses.findOneAndUpdate({ Degree }, {
                    $addToSet: { Program: { $each: Programs } }
                }, { new: true });
                if (ProgramCreation) {
                    return res.status(201).json({ message: "successfuly created!" })
                } else {
                    return next(new ErrorHandler('Internal server error', 500))
                }
            } else {
                return next(new ErrorHandler('Not Found!', 404))
            }
        } else {
            return next(new ErrorHandler('Bad Request', 400))
        }
    }
)



// fetching all Programs 
const allPrograms = catchAsyncError(
    async (req, res, next) => {
        const admin = req.Admin;
        const { Degree } = req.body;
        if (admin) {
            const findAllPrograms = await courses.findOne({ Degree }).select('Program -_id').lean().exec();
            if (findAllPrograms) {
                return res.status(200).json({ message: "All Programs associated with this degree.", Programs: findAllPrograms })
            } else {
                return next(new ErrorHandler('Internal server error', 500))
            }
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
            const { Degree, Program, CoursesDetails } = req.body;
            console.log(Degree, Program, CoursesDetails);
            if (!Degree || !Program || CoursesDetails.length < 1) {
                return next(new ErrorHandler('Incomplete Information', 406))
            }

            // finding course that already exist in the degree
            const findCourse = await courses.findOne({ $and: [{ Degree }, { Program }] }).select('Degree Program Courses -_id').populate("Courses")
            if (findCourse.Courses.length>0) {
                const checkMatch = findCourse.Courses.some(val1 => CoursesDetails.some(val2 => val1.Course_no === val2.Course_no ));
                if (checkMatch) {
                    return next(new ErrorHandler('Course already Exist in this Program!.', 409))
                }
            }
            // creating new course in the requested degree
            const findDegreeAndInsertNewCourse = await courses.findOneAndUpdate({ $and: [{ Degree }, { Program }] }, {
                $addToSet: {
                    Courses: {
                        $each: CoursesDetails
                    }
                },
            }
                , { new: true }
            );
            if (findDegreeAndInsertNewCourse) {
                return res.status(201).json({ message: "Successfully created!" })
            } else {
                return next(new ErrorHandler('Not Found!', 404))
            }
        } else {
            return next(new ErrorHandler('Bad Request', 400))
        }
    }
)




// fetching all Programs 
const DetailedPrograms = catchAsyncError(
    async (req, res, next) => {
        const admin = req.Admin;
        if (admin) {
            const findAllProgramDetails = await courses.find().select('Program Degree Courses createdAt -_id').lean().exec();
            if (findAllProgramDetails) {
                
                return res.status(200).json({ message: "All running Program details.", Programs: findAllProgramDetails })
            } else {
                return next(new ErrorHandler('Internal server error', 500))
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
module.exports = { degreeCreation, createCourse, allCourses, singleDegree, singleCourseInfo, updateSingleCourse, deleteCourse, allDegrees, programCreation, allPrograms,DetailedPrograms }