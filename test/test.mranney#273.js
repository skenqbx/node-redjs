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
var redjs = require('../');

describe('Client', function() {
  var client = redjs.createClient();

  describe('#connect()', function() {
    it('to redis', function(done) {
      assert.strictEqual(client.mode, 0); // OFFLINE
      client.connect(done);
      assert.strictEqual(client.mode, 1); // CONNECT
    });
  });

  describe('mranney#273', function() {
    var key = 'ss_test';
    var i, value = {'foo': 'bar'};
    for (i = 0; i < 400; i++ ){
      value.foo += 'padding';
    }

    var values = ['zadd', key];
    for (i = 0; i < 100; i++ ){
      value.num = i;
      values.push(i.toString(), JSON.stringify(value));
    }

    it('should work once', function(done) {
      client.send(values, function(err, results) {
        client.send('zrange', key, '0', '100', function(err, results) {
          var good = 0, len = results.length;

          for (i = 0; i < len; ++i) {
            if (results[i]) {
              ++good;
            }
          }
          assert.strictEqual(good, 100);
          client.send('del', key, done);
        });
      });
    });

    it('should work twice', function(done) {
      client.send(values, function(err, results) {
        client.send('zrange', key, '0', '100', function(err, results) {
          var good = 0, len = results.length;

          for (i = 0; i < len; ++i) {
            if (results[i]) {
              ++good;
            }
          }
          assert.strictEqual(good, 100);
          client.send('del', key, done);
        });
      });
    });
  });
});
