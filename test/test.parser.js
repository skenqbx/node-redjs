/*!
 * redjs
 * @author skenqbx@gmail.com <Malte-Thorben Bruns>
 */
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

    it('split', function(done) {
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

      var msg = '$4\r\nTest\r\n$-1\r\n';

      parser.write(new Buffer(msg.substr(0, 11)));
      parser.write(new Buffer(msg.substr(11)));
    });

    it('split 4', function(done) {
      var parser = new Parser();
      rx = tx = 0;

      parser.on('reply', function(type, value) {
        if (++rx === 2) {
          done();
        }
      });

      var msg = '*-1\r\n$1\r\na\r\n';

      parser.write(new Buffer(msg.substr(0, 1)));
      parser.write(new Buffer(msg.substr(1)));
    });
  });
});
