const crypto = require("crypto")

const hashToken = (tokenVal) => {
    const hashedToken = crypto.createHmac("sha256", process.env.Hash_Secret).update(tokenVal).digest('hex')
    return hashedToken
}

module.exports = hashToken