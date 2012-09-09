/*!
 * redjs
 * @author skenqbx@gmail.com <Malte-Thorben Bruns>
 */
'use strict';
/*global describe it*/

var assert = require('assert');
var Driver = require('../lib/driver');

describe('Driver', function() {
  var driver = new Driver();

  describe('#connect()', function() {
    it('event', function(done) {
      driver.connect(done);
    });
  });

  describe('api', function() {
    it('#set(testkey, a)', function(done) {
      driver.set('testkey', 'a', function(err, value) {
        assert.strictEqual(value, 'OK');
        done();
      });
    });

    it('#get(testkey)', function(done) {
      driver.get('testkey', function(err, value) {
        assert.strictEqual(value, 'a');
        done();
      });
    });
  });
});
