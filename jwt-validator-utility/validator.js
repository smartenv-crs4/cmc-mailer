const Hapi = require('hapi');
const jwt = require('jsonwebtoken');
const Boom = require('boom');

console.log("--------- JWT VALIDATOR MICROSERVICE ------------");

const port = process.env.PORT;
const host = 'localhost';
const privateKey = 'BbZJjyoXAdr8BUZuiKKARWimKfrSmQ6fv8kZ7OFfc';

if (port === undefined){
    console.log('ERROR: HTTP port not specified');
    console.log('Usage:');
    console.log('PORT=<PORT for Web API> node validator.js');

    process.exit();
}

const apiServer = new Hapi.Server();

apiServer.connection({
    host: host,
    port: port
});


// Start the server
apiServer.start((err) => {
    if (err) {
        throw err;
    }
    console.log('Server running at:', apiServer.info.uri);
});


apiServer.route({
    method: 'POST',
    path:'/validate',
    handler: (request, reply) => {
        console.log("Received: " + request.payload.access_token);
        try {
            var decoded = jwt.verify(request.payload.access_token, privateKey);
            reply({valid:true, token:decoded});
        }
        catch(ex) {
            reply(Boom.unauthorized('invalid token'));
        }
    }
});


apiServer.route({
   method:'GET',
   path: '/token',
   handler: (request, reply) => {
       var token = jwt.sign({ accountId: "test" }, privateKey, { algorithm: 'HS256'} );
       console.log("New token: " + token);
       reply(token);
   }
});