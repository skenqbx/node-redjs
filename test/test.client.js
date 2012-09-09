/*!
 * redjs
 * @author skenqbx@gmail.com <Malte-Thorben Bruns>
 */
'use strict';
/*global describe it*/

var assert = require('assert');
var Client = require('../lib/client');

describe('Client', function() {
  var c1 = new Client();
  var c2 = new Client();

  describe('#connect()', function() {
    it('client 1', function(done) {
      c1.connect(done);
    });

    it('client 2', function(done) {
      c2.connect(done);
    });
  });

  describe('#send()', function() {
    it('set value', function(done) {
      c1.send(['SET', 'testkey', 'a'], function(err, value) {
        assert.strictEqual(value, 'OK');
        done();
      });
    });

    it('get value', function(done) {
      c1.send(['GET', 'testkey'], function(err, value) {
        assert.strictEqual(value, 'a');
        done();
      });
    });
  });
});
