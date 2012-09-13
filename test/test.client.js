// Copyright (c) 2012 Malte-Thorben Bruns <skenqbx@gmail.com>

// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// 'Software'), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:

// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
// IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
// CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
// TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
// SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
'use strict';
/*global describe it*/

var assert = require('assert');
var Client = require('../lib/client');

describe('Client', function() {
  var c1 = new Client();
  var c2 = new Client();

  describe('#connect()', function() {
    it('to redis', function(done) {
      assert.strictEqual(c1.mode, 0); // OFFLINE
      c1.connect(done);
      assert.strictEqual(c1.mode, 1); // CONNECT
    });
  });

  describe('example', function() {
    it('should work, it\'s an example.', function(done) {
      c1.send(['SET', 'keyA', 'listA']);
      c1.send(['GET', 'keyA'], function(err, reply) {
        if (err) {
          return console.log(err.message);
        }

        // null is redis way to say: it does not exist.
        if (reply !== null) {
          c1.send(['RPUSH', reply, 'some', 'list', 'elements']);
          c1.send(['LRANGE', reply, '0', '-1'], function(err, reply) {
            if (err) {
              done(err);
            } else if (reply.indexOf('some') > -1 &&
                reply.indexOf('list') > reply.indexOf('some')) {
              done();
            } else {
              done(new Error('wrong data'));
            }
          });
        }
      });
      c1.send('DEL', 'keyA', 'listA');
    });
  });

  describe('#send()', function() {
    it('set value', function(done) {
      assert.strictEqual(c1.mode, 3); // COMMAND

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

  describe('subscribe', function() {
    it('event & callback', function(done) {
      var rx = 0;

      function ready() {
        if (++rx === 2) {
          done();
        }
      }

      c1.once('subscribe', ready);
      c1.send(['SUBSCRIBE', 'testChannel'], ready);
    });
  });

  describe('#close()', function() {
    it('on close', function(done) {
      c1.close(done);
      assert.strictEqual(c1.mode, 2); // CLOSE
    });
  });
});
