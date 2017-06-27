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
 *    along with CMC-Maileer.  If not, see <http://www.gnu.org/licenses/>.    *
 * ############################################################################
 */

var express = require('express');
var router = express.Router();

const mailer = require('../mailer/mailer');
const validator = require('validator');
const version = require('../package.json').version;
const config = require('propertiesmanager').conf;
var _=require('underscore');

const auth = require('tokenmanager');
const authField = config.decodedTokenFieldName;

auth.configure({
  authorizationMicroserviceUrl:config.authUrl+ '/tokenactions/checkiftokenisauth',
  decodedTokenFieldName:authField,
  authorizationMicroserviceToken:config.auth_token
});

//authms middleware wrapper for dev environment (no authms required)
function authWrap(req, res, next) {
  if(!req.app.get("nocheck"))
    auth.checkAuthorization(req, res, next);
  else next();
}


router.get("/", (req, res, next) => {res.json({ms:"Crs4 Microservice Core(CMC) Mailer microservice", version:require('../package.json').version})});

/**
  * @api {post} /email Sends an email
  * @apiGroup API
  * @apiVersion 0.0.1
  * @apiDescription Send a new email using SMTP protocol<br>
  * POST body must be a JSON containing the following fields:
  * <pre>
  * {<br>
  *    "from":{"name":"Mr. Pinuccio P.", "address":"pinuccio.p@anexample.com"},<br>
  *    "to":["a@a.it","b@b.com"],<br>
  *    "bcc":["pinuccio.p@anexample.com"],<br>
  *    "subject":"We've some news for you",<br>
  *    "textBody":"Hello Dear, this is a simple newsletter test.",<br>
  *    "template":"template1"<br>
  * }
  * </pre>
  *
  *
  * @apiParam {String}  from        sender of the email, an Object with 'name' and 'address'
  * @apiParam {Array}   to          list of recipient addresses
  * @apiParam {String}  subject     email subject
  * @apiParam {String}  htmlBody    email body in HTML to send, if missing then the 'textBody' field is used and sent. At least one of 'htmlBody' or 'textBody' has to be specified
  * @apiParam {String}  textBody    email text body to send
  * @apiParam {Array}   [cc]        list of address to send email to in CC
  * @apiParam {Array}   [bcc]       list of addresses to send email to BCC
  * @apiParam {String}  [replyTo]   email address to reply to
  * @apiParam {String}  [template]  template name as defined in config/default.json
  *
  */
router.post('/email', authWrap, (req, res, next) => {
  var mail = req.body;

  for(var rec in mail.to) {
    if(!validator.isEmail(mail.to[rec])) {
      res.boom.badRequest('invalid recipient mail address');
      return;
    }
  }


  if(!validator.isEmail(mail.from.address)) {
    res.boom.badRequest('invalid sender mail address');
    return;
  }
    console.log(mail.from);

  mailer.sendMail(mail, (err, mess) => {
    console.log("Send Mail Callback");
    if(err) {
      res.boom.badImplementation(); 
      return;
    }
    res.json({success:true, message:mess});
  });
});


router.get('/version', function(req, res, next) {
  res.json({version:version});
});


/* GET environment info page. */
router.get('/env', function(req, res) {
    var env;
    if (process.env['NODE_ENV'] === 'dev')
        env='dev';
    else
        env='production';

    res.status(200).send({env:env});
});


module.exports = router;