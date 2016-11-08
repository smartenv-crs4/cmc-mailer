const supertest = require('supertest');
const should = require('should');
const port = process.env.PORT || 3000;
const baseUrl = "http://localhost:" + port;
const prefix = '/api/v1/';
const request = supertest.agent(baseUrl);
const version = require('../package.json').version;
const validator = require('validator');

process.env.NODE_ENV='test'; //WARNING testing in test mode, no token check

const init = require('../lib/init');

function usage() {  
  console.log("ERROR: Please, insert a valid receiver email address for this test");
  console.log("       use: npm test -- --sendto=your@email.com");
  console.log("       You'll receive a test email from the service to this address");
  process.exit();
}

describe('--- Testing Mailer ---', () => {
  var email = {
    from:{"name":"cagliari port 2020", "address":"cport2020@gmail.com"},
    to:[],
    subject:"[CAPORT2002] Mailer Microservice test",
    textBody:"Hello Dear, this is a simple newsletter test.",
    template:"template1"
  }

  before((done) => {
    let dest = undefined;
    for(arg in process.argv) {
      if(process.argv[arg].startsWith('--sendto')) {
        dest = process.argv[arg].split('=')[1];
        if(!validator.isEmail(dest)) usage();
        break;
      }
    }
    if(dest) email.to.push(dest);
    else usage();
    init.start(() => {done()});
  });


  after((done) => {
    init.stop(() => {done()});
  });


  describe('POST /email/', () => {

    it('respond with 200 status code', (done) => {
      request
        .post( prefix + 'email')
        .send(email)
        .expect(200)
        .end((err, res) => {
          if(err) done(err);
          else done();
        });
    });
    
    it('respond with a badRequest error (invalid email address)', (done) => {
      email.to[0] = "aaa";
      request
        .post( prefix + 'email')
        .send(email)
        .expect(400)
        .end((err,res) => {
          if(err) done(err);
          else done();
        });
    });
  });


  describe('GET /version', () => {
    it('respond with the version present in package.json', (done) => {
      request
        .get(prefix + 'version') 
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err,res) => {
          if(err) done(err);
          else {
            res.body.should.have.property('version');
            res.body.version.should.be.equal(version);
            done();
          }
        });
    });
  });
});
