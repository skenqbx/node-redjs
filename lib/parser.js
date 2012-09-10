/*!
 * redjs
 * @author skenqbx@gmail.com <Malte-Thorben Bruns>
 */
'use strict';

var util = require('util');
var Stream = require('stream');



/**
 * Redis String Reply Parser (no binary support)
 * @constructor
 * @extends {Stream}
 */
function Parser() {
  Stream.call(this);

  this.writable = true;

  this.state = null;
  this.reply = null;
  this.type = null;
  this.pos = null;
  this.value = null;
  this.multi = null;
  this.bulkLength = null;
  this.multiLength = null;

  // error & debugging info
  this.states =
      ['NONE', 'INIT', 'BULK_COUNT', 'MULTI_COUNT', 'TYPE', 'LINE', 'DATA'];
  this.types = ['NONE', 'STATUS', 'ERROR', 'NUMBER', 'BULK', 'MULTI'];

  // init parser
  this.reset();
}
util.inherits(Parser, Stream);
module.exports = Parser;


/**
 * @param {Buffer} data
 */
Parser.prototype.write = function(data) {
  // import parser context
  var state = this.state;
  var reply = this.reply;
  var type = this.type;
  var pos = this.pos;
  var value = this.value;
  var multi = this.multi;
  var bulkLength = this.bulkLength;
  var multiLength = this.multiLength;

  // define states
  var STATE_INIT = 1;
  var STATE_BULK_COUNT = 2;
  var STATE_MULTI_COUNT = 3;
  var STATE_TYPE = 4;
  var STATE_LINE = 5;
  var STATE_DATA = 6;

  // define types
  var TYPE_STATUS = 1;
  var TYPE_ERROR = 2;
  var TYPE_NUMBER = 3;
  var TYPE_BULK = 4;
  var TYPE_MULTI = 5;

  var len = data.length;
  var c;

  // console.log('string:', data.toString().replace(/\r/g, '\\r').replace(/\n/g, '\\n'));

  do {
    switch (state) {
      case STATE_INIT:
        c = data[pos++];
        reply = 0;
        type = 0;
        value = '';
        multi = [];
        bulkLength = 0;
        multiLength = 0;

        switch (c) {
          case 43: // '+' ok
            type = reply = TYPE_STATUS;
            state = STATE_LINE;
            break;
          case 45: // '-' error
            type = reply = TYPE_ERROR;
            state = STATE_LINE;
            break;
          case 58: // ':' integer
            type = reply = TYPE_NUMBER;
            state = STATE_LINE;
            break;
          case 36: // '$' bulk
            if (data[pos] === 45) { // '-' nil value
              pos += 4; // '-1\r\n'
              this.emit('reply', 'bulk', null);
            } else {
              reply = TYPE_BULK;
              state = STATE_BULK_COUNT;
            }
            break;
          case 42: // '*' multi-bulk
            if (data[pos] === 45) { // '-' nil value
              pos += 4; // '-1\r\n'
              this.emit('reply', 'multi', null);
            } else {
              reply = TYPE_MULTI;
              state = STATE_MULTI_COUNT;
            }
            break;
        }
        break;
      case STATE_TYPE:
        c = data[pos++];
        type = 0;
        bulkLength = 0;
        value = '';

        switch (c) {
          case 58: // ':' integer
            type = TYPE_NUMBER;
            state = STATE_LINE;
            break;
          case 36: // '$' bulk
            if (data[pos] === 45) { // '-' nil value
              pos += 4; // '-1\r\n'
              switch (reply) {
                case TYPE_BULK:
                  state = STATE_INIT;
                  this.emit('reply', 'bulk', null);
                  break;
                case TYPE_MULTI:
                  if (multiLength === multi.push(null)) {
                    this.emit('reply', 'multi', multi);
                    state = STATE_INIT;
                  }
                  break;
                default:
                  return this.emit('error', new Error(
                      'Unexpected reply type (' + this.types[reply] + ')'));
              }
            } else {
              type = TYPE_BULK;
              state = STATE_BULK_COUNT;
            }
            break;
          default:
            return this.emit('error', new Error(
                'Unexpected type indicator "' + c + '"'));
        }
        break;
      case STATE_BULK_COUNT:
        if (data[pos] === 13) { // '\r'
          pos += 2; // '\r\n'
          bulkLength = parseInt(value, 10);
          if (bulkLength < 0) {
            switch (reply) {
              case TYPE_BULK:
                state = STATE_INIT;
                this.emit('reply', 'bulk', null);
                break;
              case TYPE_MULTI:
                if (multiLength === multi.push(null)) {
                  state = STATE_INIT;
                  this.emit('reply', 'multi', multi);
                } else {
                  state = STATE_TYPE;
                }
                break;
            }
          } else {
            state = STATE_DATA;
            value = '';
          }
        } else {
          value += String.fromCharCode(data[pos++]);
        }
        break;
      case STATE_MULTI_COUNT:
        if (data[pos] === 13) { // '\r'
          pos += 2; // '\r\n'
          multiLength = parseInt(value, 10);
          if (multiLength < 0) {
            state = STATE_INIT;
            this.emit('reply', 'multi', null);
          } else {
            state = STATE_TYPE;
          }
        } else {
          value += String.fromCharCode(data[pos++]);
        }
        break;
      case STATE_DATA:
        value += String.fromCharCode(data[pos++]);
        if (value.length === bulkLength) {
          if (data[pos] === 13) { // '\r'
            pos += 2; // '\r\n'
            switch (reply) {
              case TYPE_BULK:
                state = STATE_INIT;
                this.emit('reply', 'bulk', value);
                break;
              case TYPE_MULTI:
                if (multiLength === multi.push(value)) {
                  state = STATE_INIT;
                  this.emit('reply', 'multi', multi);
                } else {
                  state = STATE_TYPE;
                }
                break;
              default:
                return this.emit('error', new Error(
                    'Unexpected reply type(' + this.types[reply] + ')'));
            }
          } else {
            return this.emit('error', new Error(
                'Expected CR instead of ' + data[pos]));
          }
        }
        break;
      case STATE_LINE:
        value += String.fromCharCode(data[pos++]);
        if (data[pos] === 13) {
          pos += 2;
          if (type === TYPE_NUMBER) {
            if (value.indexOf('.') > -1) {
              value = parseFloat(value, 10);
            } else {
              value = parseInt(value, 10);
            }
          }

          switch (reply) {
            case TYPE_STATUS:
              state = STATE_INIT;
              this.emit('reply', 'status', value);
              break;
            case TYPE_ERROR:
              state = STATE_INIT;
              this.emit('reply', 'error', value);
              break;
            case TYPE_NUMBER:
              state = STATE_INIT;
              this.emit('reply', 'number', value);
              break;
            case TYPE_MULTI:
              if (multiLength === multi.push(value)) {
                state = STATE_INIT;
                this.emit('reply', 'multi', multi);
              } else {
                state = STATE_TYPE;
              }
              break;
            default:
              return this.emit('error', new Error(
                  'Unexpected reply type(' + this.types[reply] + ')'));
          }
        }
        break;
      default:
        return this.emit('error', new Error(
            'Unexpected parser state (' + this.states[state] + ')'));
    }
    // console.log('pos:', pos + '/' + len, data[pos], 'REPLY_TYPE_' + this.types[reply], 'TYPE_' + this.types[type], 'STATE_' + this.states[state], 'value: "' + value + '"', value.length + '/' + bulkLength, 'multi:', multi.length + '/' + multiLength);
  } while (pos < len);

  this.state = state;
  this.reply = reply;
  this.type = type;
  this.pos = pos - len;
  this.value = value;
  this.multi = multi;
  this.bulkLength = bulkLength;
  this.multiLength = multiLength;
};


/**
 *
 */
Parser.prototype.reset = function() {
  this.state = 1;
  this.reply = 0;
  this.type = 0;
  this.pos = 0;
  this.value = '';
  this.multi = [];
  this.bulkLength = 0;
  this.multiLength = 0;
};
Parser.prototype.end = Parser.prototype.reset;
