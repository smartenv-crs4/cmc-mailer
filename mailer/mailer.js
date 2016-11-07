const nodemailer = require('nodemailer');
const mailerConfig = require('propertiesmanager').conf;

const poolConfig = {
    pool: true,
    host: mailerConfig.smtp,
    port: 465,
    secure: Boolean(mailerConfig.secure), // use SSL
    auth: {
        user:  mailerConfig.user,
        pass:  mailerConfig.passwd
    }
};


let transporter = nodemailer.createTransport(poolConfig);
    
function sendMail (email, cb) {
    let mailOptions = {
        from: email.from || mailerConfig.user, // sender address
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
            var send = transporter.templateSender(template);
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
