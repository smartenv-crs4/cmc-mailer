'use strict';

const Hapi = require('hapi');
const version = require('../package.json').version;
const rp = require('request-promise');
const Boom = require('boom');
const mailer = require('../mailer/mailer');
const validator = require('validator');

function createServer(){
    const apiServer = new Hapi.Server();

    apiServer.connection({
        port: mailerConfig.port
    });
    

    // Add the route
    apiServer.route({
        method: 'GET',
        path:'/version',
        handler: (request, reply) => reply({"version:":version})
    });

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
    *
    */
    apiServer.route({
        method: 'POST',
        path:'/email',
        handler: function(request, reply) {
            var jwt_token = request.headers.authorization;

            if(jwt_token == undefined || jwt_token.length == 0) {
                reply(Boom.forbidden('Token not found'));
            }

            jwt_token = jwt_token.replace(/bearer\s+/gi,'');
            
            var opt = {
                method:"POST",
                uri:mailerConfig.validator,
                json:true,
                body: {
                    access_token:mailerConfig.access_token, //token microservizio, si puo' passare con header
                    decode_token:jwt_token
                }
            }
            console.log("Validating token through " + mailerConfig.validator);
            rp(opt)
            .then(valid => {
                if(!valid) {
                    return reply(Boom.unauthorized('Invalid Token'));
                }
                var mail = request.payload;
                //TODO validazione bcc
                for(var rec in mail.to) {
                  if(!validator.isEmail(mail.to[rec]))
                    throw new Error('invalid recipient mail address');
                }
                if(!validator.isEmail(mail.from.address)) {
                    throw new Error('invalid sender mail address');
                }
 
                return mailer.sendMail(mail, reply);
            })
            .catch(err => {
              console.log(err.message);
              reply(err);
            })
        }
    });

    return apiServer;
}
// Create a server with a host and port


module.exports.createServer = createServer;
