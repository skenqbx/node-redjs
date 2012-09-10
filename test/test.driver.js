// Copyright (c) 2012 Malte-Thorben Bruns <skenqbx@googlemail.com>

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
