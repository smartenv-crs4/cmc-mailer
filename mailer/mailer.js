/*
 ############################################################################
 ############################### GPL III ####################################
 ############################################################################
 *                         Copyright 2017 CRS4                                 *
 *    This file is part of CRS4 Microservice Core - Mailer (CMC-Mailer).      *
 *                                                                            *
 *     CMC-Mailer is free software: you can redistribute it and/or modify     *
 *     it under the terms of the GNU General Public License as published by   *
 *       the Free Software Foundation, either version 3 of the License, or    *
 *                    (at your option) any later version.                     *
 *                                                                            *
 *     CMC-Mailer is distributed in the hope that it will be useful,          *
 *      but WITHOUT ANY WARRANTY; without even the implied warranty of        *
 *       MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the        *
 *               GNU General Public License for more details.                 *
 *                                                                            *
 *     You should have received a copy of the GNU General Public License      *
 *    along with CMC-Mailer.  If not, see <http://www.gnu.org/licenses/>.    *
 * ############################################################################
 */

const nodemailer = require('nodemailer');
const mailerConfig = require('propertiesmanager').conf;

const poolConfig = {
    pool: true,
    host: mailerConfig.smtp.host,
    port: mailerConfig.smtp.port,
    secure: Boolean(mailerConfig.smtp.ssl), // use SSL
    auth: {
        user:  mailerConfig.smtp.user,
        pass:  mailerConfig.smtp.passwd
    }
};
console.log(poolConfig);
    
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
        console.log("#########################Send Email without template");
        let transporter = nodemailer.createTransport(poolConfig);
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
