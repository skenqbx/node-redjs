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
    var parser = new Parser();

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

    var tx = 0;
    var rx = 0;

    it('match', function(done) {
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
  });
});
