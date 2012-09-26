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

describe('reconnect', function() {

  var client = redjs.createClient();
  var killer = redjs.createClient();

  it('connect to invalid port #1', function(done) {
    var client = redjs.createClient({port: 3333});
    client.connect(function(err) {
      assert(err);
      done();
    });
  });

  it('connect to invalid port #2', function(done) {
    var client = redjs.createClient({port: 3333});
    client.once('error', function(err) {
      assert(err);
      done();
    });
    client.connect();
  });

  it('connect to redis', function(done) {
    client.connect(function(err) {
      killer.connect(function(err) {
        done(err);
      });
    });
  });

  it('reconnect #1', function(done) {
    client.once('reconnect', function(err) {
      done(err);
    });
    killer.call('CLIENT', 'KILL',
        '127.0.0.1:' + client.connection.address().port);
  });

  it('reconnect #2', function(done) {
    client.once('reconnect', function(err) {
      done(err);
    });
    killer.call('CLIENT', 'KILL',
        '127.0.0.1:' + client.connection.address().port);
  });

  it('reconnect #3', function(done) {
    client.once('reconnect', function(err) {
      done(err);
    });
    killer.call('CLIENT', 'KILL',
        '127.0.0.1:' + client.connection.address().port);
  });
});
