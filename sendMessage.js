const nodemailer = require('nodemailer')

let transpoter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.SERVER_EMAIL,
        pass: process.env.SERVER_PASS
    }
})

function sendAuthCode(code = '1111', email) {

    let mailOptions = {
        from: process.env.SERVER_EMAIL,
        to: email,
        subject: 'ЛОВИ КОДИК',
        text: 'КОДИК :' + code
    }

    transpoter.sendMail(mailOptions, function (err, data) {
        if (err) {
            console.log('ERR' + err)
        } else {
            console.log('Message Send!')
        }
    })

}

module.exports = sendAuthCode