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
  var client = new Client();

  describe('#connect()', function() {
    it('to redis', function(done) {
      assert.strictEqual(client.mode, 0); // OFFLINE
      client.connect(done);
      assert.strictEqual(client.mode, 1); // CONNECT
    });
  });

  describe('mranney#288', function() {
    it('should work', function(done) {
      client.send('del', 'testHash1', 'testHash2', 'testHash3');
      client.send('multi');
      client.send('hset', 'testHash1', 'key1', 'value1');
      client.send('hset', 'testHash2', 'key2', 'value2');
      client.send('hset', 'testHash3', 'key3', 'value3');
      client.send('exec', function(err, results) {
        assert.deepEqual(results, [1, 1, 1]);

        client.send('multi');
        client.send('hgetall', 'testHash1');
        client.send('hgetall', 'testHash2');
        client.send('hgetall', 'testHash3');

        client.send('exec', function(err, results) {
          assert.deepEqual(
              [['key1', 'value1'], ['key2', 'value2'], ['key3', 'value3']],
              results);
          done(err);
        });
      });
    });
  });
});
