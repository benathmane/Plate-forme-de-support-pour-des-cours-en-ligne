var request = require('request');
var assert  = require('assert');

var port = process.env.PORT || 8088;

var url = 'http://127.0.0.1:8088';

suite('collectiontest', function() {
  test('this api call should create a new collection', function(done) {
    request.post({
        url: url + '/Users',
        json: {
         name: 'ahmed',
         password:'345',
        }
      }, function(err, res, body) {
        if (err) {
        assert.equal(res.statusCode, 400);
          done(err);
        }
        done();
    });
   });

  test('this api call  All Users', function(done) {
    request.get({
        url: url + '/Users',
       
      }, function(error, res, body) {
        if (error) {
        assert.equal(res.statusCode, 400);

          done(error);
        }
        done();

    });
   });
 
   test('this api call  user by name and mp', function(done) {
    request.get({
        url: url + '/user/AHMED/AHMED',
       
      }, function(error, res, body) {
        if (error) {
        assert.equal(res.statusCode, 400);

          done(error);
        }
        assert.equal(res.statusCode, 212);
        done();

    });
   });
  test('this api call  user by name test 2 name and mp', function(done) {
    request.get({
        url: url + '/user/ahmed/345',
       
      }, function(error, res, body) {
        if (error) {
        assert.equal(res.statusCode, 400);

          done(error);
        }
       assert.equal(res.statusCode, 212);
        done();

    });
   });
test('this api call  user by name test 2 name and mp', function(done) {
    request.get({
        url: url + '/Rooms/?nom=MOLKA',
       
      }, function(error, res, body) {
        if (error) {
        assert.equal(res.statusCode, 400);

          done(error);
        }
         assert.equal(res.statusCode, 200);
        done();

    });
   });
test('this api call  user by name test 2 name and mp', function(done) {
    request.get({
        url: url + '/getConnectedUser',
       
      }, function(error, res, body) {
        if (error) {

          done(error);
        }
        done();

    });
   });
});

