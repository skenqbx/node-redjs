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
var Parser = require('../lib/parser');

describe('Parser', function() {
  describe('#write()', function() {

    var replies = [
      [['*1', '$4', 'Test'], ['multi', ['Test']]],
      [[':0'], ['number', 0]],
      [[':836529662'], ['number', 836529662]],
      [['$62', 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'], ['bulk', 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789']],
      [[':-42.32'], ['number', -42.32]],
      [[':-1'], ['number', -1]],
      [['*4', ':4', '$2', 'Ah', '$-1', ':-12.6467'], ['multi', [4, 'Ah', null, -12.6467]]],
      [['+OK'], ['status', 'OK']],
      [['$-1'], ['bulk', null]],
      [['-Wtf?!'], ['error', 'Wtf?!']],
      [['$1', 'X'], ['bulk', 'X']],
      [['$4', 'Test'], ['bulk', 'Test']],
      [['*2', '$-1', '$4', 'Test'], ['multi', [null, 'Test']]]
    ];

    var tx, rx;

    it('allinone', function(done) {
      var parser = new Parser();
      rx = tx = 0;

      parser.on('reply', function(type, value) {
        assert.deepEqual([type, value], replies[rx++][1]);
        if (replies.length === rx) {
          done();
        }
      });

      do {
        parser.write(new Buffer(replies[tx][0].join('\r\n') + '\r\n'));
      } while (++tx < replies.length);
    });

    it('split 1', function(done) {
      var parser = new Parser();
      rx = tx = 0;

      parser.on('reply', function(type, value) {
        assert.deepEqual([type, value], replies[rx++][1]);
        if (replies.length === rx) {
          done();
        }
      });

      var msg = '';

      do {
        msg += replies[tx][0].join('\r\n') + '\r\n';
      } while (++tx < replies.length);

      parser.write(new Buffer(msg.substr(0, 10)));
      parser.write(new Buffer(msg.substr(10, 13)));
      parser.write(new Buffer(msg.substr(23, 17)));
      parser.write(new Buffer(msg.substr(40)));
    });

    it('split 2', function(done) {
      var parser = new Parser();
      rx = tx = 0;

      parser.on('reply', function(type, value) {
        if (++rx === 2) {
          done();
        }
      });

      var msg = '$4\r\nTest\r\n$1\r\na\r\n';

      parser.write(new Buffer(msg.substr(0, 2)));
      parser.write(new Buffer(msg.substr(2)));
    });

    it('split 3', function(done) {
      var parser = new Parser();
      rx = tx = 0;

      parser.on('reply', function(type, value) {
        if (++rx === 2) {
          done();
        }
      });

      parser.write(new Buffer('$4\r\nTest\r\n$'));
      parser.write(new Buffer('-1\r\n'));
    });

    it('split 4', function(done) {
      var parser = new Parser();
      rx = tx = 0;

      parser.on('reply', function(type, value) {
        if (++rx === 2) {
          done();
        }
      });

      parser.write(new Buffer('*'));
      parser.write(new Buffer('-1'));
      parser.write(new Buffer('\r\n$1\r\na\r\n'));
    });

    it('split 5', function(done) {
      var parser = new Parser();
      rx = tx = 0;

      parser.on('reply', function(type, value) {
        if (++rx === 2) {
          done();
        }
      });

      parser.write(new Buffer('$1\r\na'));
      parser.write(new Buffer('\r\n$1\r\na\r\n'));
    });
  });
});
