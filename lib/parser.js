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

var util = require('util');
var Stream = require('stream');



/**
 * Redis Reply Parser
 * @constructor
 * @extends {Stream}
 */
function Parser() {
  Stream.call(this);

  this.writable = true;

  this.reset();
}
util.inherits(Parser, Stream);
module.exports = Parser;


/**
 *
 */
Parser.prototype.write = function(data) {
  var state = this._state;
  var offset = this._offset;
  var type = this._type;
  var rx = this._rx;
  var bulk = this._bulk;
  var level = this._level;
  var nested = this._nested;
  var buffer = this._buffer;
  var ref = this._ref;
  var refs = this._refs;

  var bytes = data.length;
  var c;

  var self = this;

  function unwrap() {
    do {
      --level;
      ref = refs.pop();
      nested.pop();

      if (level === 0) {
        self.emit('reply', 42, buffer);
        ref = buffer = [];
        break;
      }
    } while (nested[level] === ref.length);
  }

  do {
    switch (state) {
      case 0: // TYPE & LINE
        if (!type) {
          type = data[offset++];
          if (type !== 43 && type !== 45 && type !== 58 &&
              type !== 36 && type !== 42) {
            this.emit('parser_error', {message: 'Expected +, -, :, $ or *',
                rx: rx, offset: offset, bytes: bytes, c: type});
            type = null;
            break;
          }
        }
        while (data[offset] !== 13 && offset < bytes) {
          rx += String.fromCharCode(data[offset++]);
        }
        if (data[offset] === 13) {
          state = 1;
          ++offset;
        } // else we wait for more data
        break;
      case 1: // LAST LF '\n'
        if (data[offset] === 10) {
          ++offset;
          switch (type) {
            case 43: // '+'
            case 45: // '-'
              this.emit('reply', type, rx);
              state = 0;
              type = null;
              break;
            case 58: // ':'
              rx = parseFloat(rx, 10);
              if (level) {
                if (ref.push(rx) === nested[level]) {
                  unwrap();
                }
              } else {
                this.emit('reply', type, rx);
              }
              state = 0;
              type = null;
              break;
            case 36: // '$'
              if (rx === '-1') {
                if (level) {
                  if (ref.push(null) === nested[level]) {
                    unwrap();
                  }
                } else {
                  this.emit('reply', type, null);
                }
                state = 0;
                type = null;
              } else {
                bulk = parseInt(rx, 10);
                state = 2; // DATA
              }
              break;
            case 42: // '*'
              if (rx === '-1') {
                if (level) {
                  if (ref.push(null) === nested[level]) {
                    unwrap();
                  }
                } else {
                  this.emit('reply', type, null);
                }
              } else {
                nested[++level] = parseInt(rx, 10);
                if (level > 1) {
                  refs.push(ref);
                  c = ref.push([]);
                  ref = ref[c - 1];
                }
              }
              state = 0;
              type = null;
              break;
          }
          rx = '';
        } else {
          this.emit('parser_error', {message: 'Expected \\n',
              rx: rx, offset: offset, bytes: bytes, c: offset[offset]});
          state = 0;
          rx = '';
          type = null;
          ++offset;
        }
        break;
      case 2: // DATA
        // bytes to read for this bulk
        c = bulk - rx.length;
        // bytes available for this bulk in current buffer
        c = c > (bytes - offset) ? bytes - offset : c;
        if (c > 32) { // tweak-able arbitrary limit
          rx += data.toString('utf8', offset, offset + c);
          offset += c;
        } else {
          while (c--) {
            rx += String.fromCharCode(data[offset++]);
          }
        }
        if (rx.length === bulk) {
          if (level) {
            if (ref.push(rx) === nested[level]) {
              unwrap();
            }
          } else {
            this.emit('reply', type, rx);
          }
          state = 0;
          offset += 2;
          rx = '';
          type = null;
        }
        break;
    }
  } while (offset < bytes);

  this._state = state;
  this._type = type;
  this._offset = offset - bytes;
  this._rx = rx;
  this._bulk = bulk;
  this._level = level;
  this._nested = nested;

  this._buffer = buffer;
  this._ref = ref;
  this._refs = refs;
};


/**
 *
 */
Parser.prototype.end = Parser.prototype.reset = function() {
  this._state = 0;
  this._type = null;
  this._offset = 0;
  this._rx = '';
  this._bulk = 0;
  this._level = 0;
  this._nested = [1];

  this._buffer = [];
  this._ref = this._buffer;
  this._refs = [];
};
