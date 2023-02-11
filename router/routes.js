const route = require('express').Router();
const authMiddleware = require('../middlewares/authMiddleware')
const refreshTokenMiddleware = require("../middlewares/refreshTokenVerification")
const { Register, Login, Logout, RefreshUserWithNewToken } = require('../controls/auth')
const { createRole, fetchRecords, singleAuthorityInfo, updateAuthority, deleteAuthority } = require('../controls/authority')
const { degreeCreation, createCourse, EditSingleCourseDetails, DeleteDegree, SingleProgramDetails, EditSingleDegAndProgDetails, DeleteSingleCourse, allDegrees, programCreation, allPrograms, DetailedPrograms } = require('../controls/studyprograms')
const { formCreate, programforUser, specificUser, PopulatedUserForms ,DegreesAndRelatedDetailsForUser} = require('../controls/FormControls')
const { AllGs10Forms, approveOrReject, PendingFormsAction, updateGs10Form } = require("../controls/FormControlsAuthority")
const { CreateAnnouncement, GetAllAnnouncementes, DeleteAnnouncement, GetAllAnnouncementesForUsers } = require("../controls/announcement")
const { UpdateProfile } = require('../controls/Profile')
const { HomePageData } = require('../controls/AuthHomePage');



// auth
route.post('/register', Register)
route.post('/login', Login)
route.get('/refresh', refreshTokenMiddleware, RefreshUserWithNewToken)
route.post('/logout', authMiddleware, Logout)



// Homepage Auth
route.post('/admin/HomePage', authMiddleware, HomePageData)



// auth roles
route.post('/admin/createRole', authMiddleware, createRole)
route.get('/admin/getallroles', authMiddleware, fetchRecords)
route.get('/admin/singleAuthorityInfo/:id', authMiddleware, singleAuthorityInfo)
route.post('/admin/Role/update', authMiddleware, updateAuthority)
route.post('/admin/role/delete/:id', authMiddleware, deleteAuthority)


// Program routes
route.post('/admin/createDegree', authMiddleware, degreeCreation)
route.get('/admin/Fetch/Degrees', authMiddleware, allDegrees)
route.post('/admin/createProgram', authMiddleware, programCreation)
route.post('/admin/Fetch/Program', authMiddleware, allPrograms)
route.post('/admin/createCourse', authMiddleware, createCourse)
route.get('/admin/Programs', authMiddleware, DetailedPrograms)
route.post('/admin/Course/:degree/:id', authMiddleware, SingleProgramDetails)
route.post('/admin/Course/:id', authMiddleware, DeleteSingleCourse)
route.post('/admin/Degree/Delete/:id', authMiddleware, DeleteDegree)
route.post('/admin/Edit/Course', authMiddleware, EditSingleCourseDetails)
route.post('/admin/Edit/DegProg', authMiddleware, EditSingleDegAndProgDetails)




// Form Routes for user
route.get('/Fetch/Degrees', authMiddleware, DegreesAndRelatedDetailsForUser)
route.post('/Form/Create', authMiddleware, formCreate)
// route.post('/Form/Program/user', authMiddleware, programforUser) //1
route.get('/Form/user/Forms', authMiddleware, PopulatedUserForms)
route.get('/Form/user/:id', authMiddleware, specificUser)


// Form Routes for Authority
route.get('/admin/Forms/:formType', authMiddleware, AllGs10Forms)
route.post('/admin/opr/Form/:userId', authMiddleware, approveOrReject)
route.post('/admin/Forms/Pending/act', authMiddleware, PendingFormsAction)
// route.post('/admin/opr/Form/update/:id/:role/:status', authMiddleware, updateGs10Form) //uncheck


// Routes for Admin Announcements 
route.post('/admin/announcement/Create', authMiddleware, CreateAnnouncement)
route.get('/admin/announcement/Get', authMiddleware, GetAllAnnouncementes)
route.post('/admin/announcement/Delete/:id', authMiddleware, DeleteAnnouncement)


// Routes for Admin Profile
route.post('/admin/Profile/update', authMiddleware, UpdateProfile)


// Routes for User Announcements 
route.get('/announcement/Get', authMiddleware, GetAllAnnouncementesForUsers)




module.exports = route