const config = require("config");
global.mailerConfig = config.get('service');

console.log("--------- MAILER MICROSERVICE ------------");

mailerConfig.port    = process.env.PORT;
mailerConfig.smtp    = process.env.SMTP;
mailerConfig.secure  = process.env.SSL;
mailerConfig.user    = process.env.USER;
mailerConfig.passwd  = process.env.PASSWD;

const  api = require('./api/api');


  /**
    * @api {post} /email Sends an email
    * @apiGroup Microservice
    * @apiVersion 0.0.1
    * @apiDescription Starts a microservice that sends email using SMTP protocol<br>
    * Parameters must be provided at start time using environment variables, using the sintax:<br>
    * <pre>
    *   PORT=1234 SMTP=smtp.gmail.com SSL=true USER=smtpusername PASSWD=smtppasswd node index.js
    * </pre>
    * Parameters are:
    * @apiParam {Number}  PORT    The system port where the service will listen
    * @apiParam {String}  SMTP    The url of the smtp server to be used
    * @apiParam {Boolean} SSL     Whether the communication with the server must be protected or not (true/false)
    * @apiParam {String}  USER    Username to authenticate on the smtp server
    * @apiParam {String}  PASSWD  The password to authenticate on the smtp server
    *
    */
if (mailerConfig.port === undefined || mailerConfig.smtp === undefined || 
    mailerConfig.secure === undefined || mailerConfig.user === undefined || 
    mailerConfig.passwd === undefined){
    console.log('ERROR: HTTP port not specified');
    console.log('Usage:');
    console.log('PORT=<PORT for Web API> SMTP=<SMTP server address> SSL=<true|false> USER=<email username for auth> PASSWD=<USER password for auth> node index.js');
    process.exit();
}

const server = api.createServer();

// Start the server
server.start((err) => {
    if (err) {
        throw err;
    }
    console.log('Server running at:', server.info.uri);
    console.log('SMTP server:', mailerConfig.smtp);
});
