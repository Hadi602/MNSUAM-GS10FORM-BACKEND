


const generateCookie = (name, token, expTime, res) => {

    res.cookie(name, token, {
        httpOnly: true,
        secure: true,
        expires: expTime,
        sameSite: 'None'
        // maxAge: expTime
    })
    return res
}
module.exports = generateCookie;