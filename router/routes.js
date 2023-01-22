const route = require('express').Router();
const authMiddleware = require('../middlewares/authMiddleware')
const refreshTokenMiddleware = require("../middlewares/refreshTokenVerification")
const { Register, Login, Logout, RefreshUserWithNewToken } = require('../controls/auth')
const { createRole, fetchRecords, singleAuthorityInfo, updateAuthority, deleteAuthority } = require('../controls/authority')
const { degreeCreation, createCourse, allCourses, singleDegree, singleCourseInfo, updateSingleCourse, deleteCourse } = require('../controls/studyprograms')
const { formCreate, programforUser, specificUser, PopulatedUserForms } = require('../controls/FormControls')
const { AllGs10Forms, approveOrReject, updateGs10Form } = require("../controls/FormControlsAuthority")


// auth
route.post('/register', Register)
route.post('/login', Login) 
route.get('/refresh', refreshTokenMiddleware, RefreshUserWithNewToken)
route.post('/logout', authMiddleware, Logout) 


// auth roles
route.post('/createRole', authMiddleware, createRole)
route.get('/getAuthoritesInfo', authMiddleware, fetchRecords)
route.get('/singleAuthorityInfo/:id', authMiddleware, singleAuthorityInfo)
route.post('/updateSingleAuthority/update', authMiddleware, updateAuthority)
route.post('/delete/authority/:id', authMiddleware, deleteAuthority)


// Program routes
route.post('/createDegree', authMiddleware, degreeCreation)
route.post('/createCourse', authMiddleware, createCourse)
route.get('/allCourses', authMiddleware, allCourses)
route.get('/program', authMiddleware, singleDegree) //1
route.get('/courseinfo/:id', authMiddleware, singleCourseInfo)
route.post('/course/update', authMiddleware, updateSingleCourse)
route.post('/course/delete/:id', authMiddleware, deleteCourse)


// Form Routes
route.post('/Form/Create', authMiddleware, formCreate) //uncheck
route.post('/Form/Program/user', authMiddleware, programforUser) //1
route.post('/Form/user', authMiddleware, specificUser)
route.get('/Form/user/Forms', authMiddleware, PopulatedUserForms)


// Form Routes for Authority
route.get('/admin/Forms', authMiddleware, AllGs10Forms)
route.post('/admin/opr/Form/rqstaporrej', authMiddleware, approveOrReject)
route.post('/admin/opr/Form/update/:id/:role/:status', authMiddleware, updateGs10Form) //uncheck

module.exports = route