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
