const refreshModel = require("../src/models/refresh_token")

const generateRefreshToken = async (User, type, route) => {

    if (User) {
        if (type === "Admin") {
            const findRefreshToken = await refreshModel.findOne({ AdminId: User._id })
            if (findRefreshToken) {
                const updaterefreshToken = await refreshModel.findByIdAndUpdate(
                    { _id: findRefreshToken._id },
                    {
                        refreshToken: findRefreshToken.generateRefreshToken()
                    },
                    { new: true }
                )
                // console.log(updaterefreshToken.refreshToken);
                return updaterefreshToken.refreshToken
            } else {
                const refreshToken = await refreshModel({
                    AdminId: User._id
                }).save()
                const refToken = refreshToken.generateRefreshToken()
                const updaterefreshToken = await refreshModel.findByIdAndUpdate(
                    { _id: refreshToken._id },
                    {
                        refreshToken: refToken
                    },
                    { new: true }
                )
                // console.log("new",updaterefreshToken.refreshToken);
                return updaterefreshToken.refreshToken
            }
        } else if (type === "User") {
            const findRefreshToken = await refreshModel.findOne({ UserId: User._id })
            if (findRefreshToken) {
                console.log("yes");
                const updaterefreshToken = await refreshModel.findByIdAndUpdate(
                    { _id: findRefreshToken._id },
                    {
                        refreshToken: findRefreshToken.generateRefreshToken()
                    },
                    { new: true }
                )
                console.log(updaterefreshToken.refreshToken);
                return updaterefreshToken.refreshToken
            } else {
                const refreshToken = await refreshModel({
                    UserId: User._id
                }).save()
                const refToken = refreshToken.generateRefreshToken()
                const updaterefreshToken=await refreshModel.findByIdAndUpdate(
                    { _id: refreshToken._id },
                    {
                        refreshToken: refToken
                    },
                    { new: true }
                )
                // console.log("new",updaterefreshToken.refreshToken);
                return updaterefreshToken.refreshToken
            }

        } else { return null }


    } else {
        return null;
    }
}
module.exports = generateRefreshToken;