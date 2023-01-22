const crypto = require("crypto");


const sendOtp=(token,user)=>{
    const OTP = crypto.randomInt(1000, 9999);
    const expireTime = Date.now() + 1000 * 60 * 2; // 2min
    const data = `${token}.${OTP}.${expireTime}`
    const hash = crypto.createHmac('sha256', process.env.Otp_Secret_key).update(data).digest('hex')



    let transport =  nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'noman97301@gmail.com',
            pass: 'zxtzxwpvpbqppfjw'
        }
    })
    let mailDetails = {
        from: 'noman97301@gmail.com',
        to: user.email,
        subject: 'Test mail from Hamza Qureshi Testing account',
        html: `<h1>SteaminGo testing mail for Hamza Quershi</h1> <br/> <h3>Your one time password is: ${OTP}</h3>`
    }; 
    transport.sendMail(mailDetails, (err, info) => {
        if (err) {
            console.log(err);
        } else {
            console.log(info.messageId);
        }
    })


    return {
        OTP: OTP, 
        hash: `${hash}.${expireTime}`,
    }
}
module.exports=sendOtp