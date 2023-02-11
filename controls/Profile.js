const catchAsyncError = require('../middlewares/catchAsyncError')
const admins = require("../src/models/admin_model");
const ErrorHandler = require('../utils/errorHandler');
const AdminProfile = require('../utils/imageSetup')
const fs = require("fs")
const path = require('path')



// @Admin
// Authority Profile Update
const UpdateProfile = catchAsyncError(
    async (req, res, next) => {
        const { role, cnic, aboutme, userImage, adminId, username, existingImage } = req.body;

        if (!adminId || !role) {
            return next(new ErrorHandler('Incomplete Information', 406))
        }
        // console.log(existingImage);

        // // finding Existing image and removing
        if (existingImage) {
            fs.readFile(path.join(__dirname, "../Storage", "Admins", `${existingImage}`), 'utf-8', (err, data) => {
                // console.log('err', err, 'data');
                if(data){
                    fs.rmSync(path.join(__dirname,"../Storage", "Admins", `${existingImage}`))
                }
            })
        }

        const ImageRes = await AdminProfile(userImage, 'Admin')

        const findAdmin = await admins.findOne({ _id: adminId }).select('username UserImage CNIC AboutMe').lean().exec()
        const findAuthorityAndUpdate = await admins.findOneAndUpdate({ _id: adminId }, {
            $set: {
                AboutMe: aboutme ? aboutme : findAdmin.AboutMe,
                username: username ? username : findAdmin.username,
                CNIC: cnic ? cnic : findAdmin.CNIC,
                UserImage: ImageRes ? `/Storage/Admins/${ImageRes}` : findAdmin.UserImage
            }
        }, { new: true }).select('-AccessToken')
        if (findAuthorityAndUpdate) {
            return res.status(200).json({ admin: findAuthorityAndUpdate })
        } else {
            return next(new ErrorHandler('Error Occured', 400))
        }
    }
);


module.exports = { UpdateProfile }