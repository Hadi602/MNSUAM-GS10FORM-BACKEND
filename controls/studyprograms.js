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
            const { Degree, CoursesDetails } = req.body;
            // console.log(Degree, CoursesDetails);
            if (!Degree || CoursesDetails.length < 1) {
                return next(new ErrorHandler('Incomplete Information', 406))
            }

            // finding course that already exist in the degree
            const findCourse = await courses.findOne({ $and: [{ Degree }] }).select('Degree Program Courses -_id').populate("Courses")
            if (findCourse.Courses.length > 0) {
                const checkMatch = findCourse.Courses.some(val1 => CoursesDetails.some(val2 => val1.Course_no === val2.Course_no));
                if (checkMatch) {
                    return next(new ErrorHandler('Course already Exist in this Program!.', 409))
                }
            }
            // creating new course in the requested degree
            const findDegreeAndInsertNewCourse = await courses.findOneAndUpdate({ Degree }, {
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




// fetch single course for updation
const SingleProgramDetails = catchAsyncError(
    async (req, res, next) => {
        const admin = req.Admin;
        if (admin) {
            const { id, degree } = req.params
            const SenetizeId = id.replaceAll('-', " ").toString()
            const SenetizeDegree = degree.replaceAll('-', " ").toString()
            const findRecord = await courses.aggregate([
                {
                    $unwind: "$Courses"
                },
                {
                    $match: { "Courses.Program_name": SenetizeId }
                },
                // {
                //     $replaceRoot: { // jo jo fields add krni hen sirf whi mention krdo
                //       newRoot: {
                //         // Degree: "$Degree",
                //         Courses: "$Courses",
                //         // createdAt: "$createdAt",
                //         // updatedAt: "$updatedAt",
                //         // __v: "$__v",
                //         // Program: "$Program"
                //       }
                //     }
                //   }
                {
                    $group: {
                        _id: "$_id",
                        // Courses:{"$Courses"}
                        Degree: { $first: "$Degree" },
                        Courses: { $addToSet: "$Courses" },
                        Program: { $addToSet: "$Program" }
                        // Courses: { $push: "$Courses" },
                        //     createdAt: { $first: "$createdAt" },
                    }
                }
            ]);
            // console.log({ course: findRecord });
            if (findRecord) {
                return res.status(200).json({ course: findRecord })
            } else {
                return next(new ErrorHandler('no course found!', 404))
            }
        }
        else {
            return next(new ErrorHandler('Bad Request', 400))
        }
    }
)



// deleting single course
const DeleteSingleCourse = catchAsyncError(
    async (req, res, next) => {
        const admin = req.Admin;
        if (admin) {
            let { id } = req.params;
            const { Degree } = req.body;
            // console.log(Degree, id)
            const deleteSingleCourse = await courses.findOneAndUpdate({ Degree: { $regex: Degree.toString().replaceAll('-', ' '), $options: 'i' } }, {
                $pull: {
                    Courses: {
                        _id: id
                    }
                }
            }, {
                new: true
            })
            if (deleteSingleCourse) {
                return res.status(200).json({ message: "succes" })
            } else {
                return next(new ErrorHandler('Request Failed!', 409))
            }
        } else {
            return next(new ErrorHandler('Bad Request', 400))
        }
    }
)




// Delete single Degree
const DeleteDegree = catchAsyncError(
    async (req, res, next) => {
        const admin = req.Admin;
        const { id } = req.params;
        // console.log(id);
        if (admin) {
            const DeleteDegree = await courses.findOneAndDelete({ _id: id });
            if (DeleteDegree) {
                return res.status(200).json({ message: "successfully Deleted!" })
            } else {
                return next(new ErrorHandler('Error Occured!', 404))
            }
        } else {
            return next(new ErrorHandler('Bad Request', 400))
        }
    }
)




// Edit Single Course
const EditSingleCourseDetails = catchAsyncError(
    async (req, res, next) => {
        const admin = req.Admin;
        if (admin) {
            // const { id } = req.params;
            const { Course_name, Course_no, Course_status, Credit_hour, Program_name, id, DegreeId } = req.body
            console.log(Course_name, Course_no, Course_status, Credit_hour, Program_name, id, DegreeId);
            if (!Course_name || !Course_no || !Course_status || !Credit_hour || !Program_name || !id || !DegreeId) {
                return next(new ErrorHandler('Incomplete Information', 400))
            }

            const updatingsinglecourse = await courses.findOneAndUpdate({ _id: DegreeId, Courses: { $elemMatch: { _id: id } } }, {
                $set: {
                    "Courses.$.Course_name": Course_name,
                    "Courses.$.Course_no": Course_no,
                    "Courses.$.Credit_hour": Credit_hour,
                    "Courses.$.Course_status": Course_status,
                    "Courses.$.Program_name": Program_name,
                }
            }, { new: true });
            if (updatingsinglecourse) {
                return res.status(200).json({ message: "successfully Updated!" })
            } else {
                return next(new ErrorHandler('Error Occured!', 400))
            }
        } else {
            return next(new ErrorHandler('Bad Request', 400))
        }
    }
)




// updating individual course
const EditSingleDegAndProgDetails = catchAsyncError(
    async (req, res, next) => {
        const admin = req.Admin;
        if (admin) {
            const { Degree, Program, CurrentProgram, CurrentDegree } = req.body;
            if (!Degree || !Program) {
                return next(new ErrorHandler('Incomplete Information', 406))
            }

            // 1. updating Degree
            const updatingDegree = await courses.findOneAndUpdate({ Degree: CurrentDegree }, { $set: { Degree: Degree } }, { new: true }).select('Degree').lean().exec()

            if (updatingDegree) {
                // 2. updating Program
                const updateProgram = await courses.findOneAndUpdate({ Degree: Degree, Program: CurrentProgram }, { $set: { "Program.$": Program } }, { new: true }).select('Program').lean().exec()

                if (updateProgram) {
                    // 3. updating Course
                    const updateCoursesReleventToThisProgram = await courses.findOneAndUpdate(
                        { Degree: Degree, Courses: { $elemMatch: { Program_name: CurrentProgram } } },
                        { $set: { "Courses.$.Program_name": Program } },
                        { new: true }
                    ).select('Courses').lean().exec()
                    
                    if (updateCoursesReleventToThisProgram) {
                        return res.status(200).json({ message: "updated Successfully!" })
                    } else {
                        return next(new ErrorHandler('No Course updated!', 409))
                    }
                } else {
                    return next(new ErrorHandler('No Program updated!', 409))
                }

            } else {
                return next(new ErrorHandler('No Degree Updated!', 409))
            }

        } else {
            return next(new ErrorHandler('Bad Request', 400))
        }
    }
)


module.exports = { degreeCreation, createCourse, EditSingleCourseDetails, DeleteDegree, SingleProgramDetails, DeleteSingleCourse, allDegrees, programCreation, allPrograms, DetailedPrograms, EditSingleDegAndProgDetails }