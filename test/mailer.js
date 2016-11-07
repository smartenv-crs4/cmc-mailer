const supertest = require('supertest');
const should = require('should');
const port = process.env.PORT || 3000;
const baseUrl = "http://localhost:" + port;
const prefix = '/api/v1/';
const request = supertest.agent(baseUrl);
const version = require('../package.json').version;

process.env.NODE_ENV='test'; //WARNING testing in test mode, no token check

const init = require('../lib/init');

describe('--- Testing Mailer ---', () => {
  before((done) => {
    init.start(() => {done()});
  });


  after((done) => {
    init.stop(() => {done()});
  });

/*
  describe('POST /email/', () => {
    it('respond with json Object containing the id of the stored resource', (done) => {
      request
        .post( prefix + 'file')
        .expect('Content-Type', /json/)
        .expect(200)
        .end((req,res) => {
          res.body.should.have.property("failed");
          res.body.failed.length.should.be.equal(0);
          done();
        });
    });
  });
*/

  describe('GET /version', () => {
    it('respond with the version present in package.json', (done) => {
      request
        .get(prefix + 'version') 
        .expect('Content-Type', /json/)
        .expect(200)
        .end((req,res) => {
          res.body.should.have.property('version');
          res.body.version.should.be.equal(version);
          done();
        });
    });
  });
});
