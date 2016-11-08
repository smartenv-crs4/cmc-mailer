const nodemailer = require('nodemailer');
const mailerConfig = require('propertiesmanager').conf;

const poolConfig = {
    pool: true,
    host: mailerConfig.smtp.host,
    port: 465,
    secure: Boolean(mailerConfig.smtp.ssl), // use SSL
    auth: {
        user:  mailerConfig.smtp.user,
        pass:  mailerConfig.smtp.passwd
    }
};


    
function sendMail (email, cb) {

    let mailOptions = {
        from: email.from || mailerConfig.smtp.user, // sender address
        to: email.to || [], // list of receivers
        subject: email.subject || '' // Subject line
    };

    if (email.htmlBody && email.htmlBody !== '') {
        mailOptions.html = email.htmlBody;
    }
    else {
        mailOptions.text = email.textBody || '';
    }

    if (email.template !== undefined && email.template !== '') {
        var template = mailerConfig.templates[email.template];
        if (template !== undefined) {
            let transporter = nodemailer.createTransport(poolConfig);
            let send = transporter.templateSender(template);
            send(mailOptions, {body: email.textBody},
                function (err, info) {
                    if (err) {
                        console.log(err);
                        return cb(err, null);
                    }
                    cb(null, info.response)
                }
            )
        }
        else return cb('template not found');
    }
    else {
        // send mail with defined transport object
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
                return cb(error, null);
            }
            console.log('Message sent: ' + info.response);
            cb(null, info.response);
        });
    }
}


module.exports.sendMail = sendMail;
