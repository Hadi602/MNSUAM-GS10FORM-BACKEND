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
route.post('/admin/createRole', authMiddleware, createRole)
route.get('/admin/getallroles', authMiddleware, fetchRecords)
route.get('/admin/singleAuthorityInfo/:id', authMiddleware, singleAuthorityInfo)
route.post('/admin/Role/update', authMiddleware, updateAuthority)
route.post('/admin/role/delete/:id', authMiddleware, deleteAuthority)


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
route.get('/Form/user/Forms', authMiddleware, PopulatedUserForms)
route.get('/Form/user/:id', authMiddleware, specificUser)


// Form Routes for Authority
route.get('/admin/Forms/:formType', authMiddleware, AllGs10Forms)
route.post('/admin/opr/Form/:userId', authMiddleware, approveOrReject)
route.post('/admin/opr/Form/update/:id/:role/:status', authMiddleware, updateGs10Form) //uncheck

module.exports = route