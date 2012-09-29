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

var net = require('net');
var util = require('util');
var events = require('events');
var Parser = require('./parser');



/**
 * Redis Client
 * @constructor
 * @extends {events.EventEmitter}
 */
function Client(opt_options) {
  events.EventEmitter.call(this);

  opt_options = opt_options || {};

  Object.defineProperties(this, {
    _tx: {value: 0, writable: true},
    _rx: {value: 0, writable: true},
    _mode: {value: 0, writable: true},
    _callbacks: {value: {}, configurable: true},
    _reconnect: {value: typeof opt_options.reconnect === 'boolean' ?
        opt_options.reconnect : true, writable: true},
    _reconnectCount: {value: 0, writable: true},
    _maxReconnectCount: {value: opt_options.maxReconnectCount || 10},
    _reconnectInterval: {value: opt_options.reconnectInterval || 5000},
    _reconnectIntervalId: {value: null, writable: true},
    _special: {value: ['message', 'subscribe', 'unsubscribe']},
    mode: {get: function() {return this._mode;}, enumerable: true}
  });

  this.parser = null;
  this.connection = null;
  this.modes =
      ['OFFLINE', 'CONNECT', 'CLOSE', 'NORMAL', 'TRANSACTION', 'SUBSCRIPTION'];

  this.port = opt_options.port || 6379;
  this.host = opt_options.host || null;
}
util.inherits(Client, events.EventEmitter);
module.exports = Client;


/**
 *
 */
Client.prototype.connect = function(opt_callback) {
  var self = this;
  var connection, parser;

  if (this._mode !== 0) { // !OFFLINE
    if (opt_callback) {
      opt_callback(new Error('Already connecting'));
    }
    return;
  }
  this._mode = 1; // OFFLINE -> CONNECT

  parser = this.parser = new Parser();
  parser.on('reply', this._onReply.bind(this));

  parser.on('parser_error', function(err) {
    self.emit('parser_error', err);
  });

  function connected(err) {
    if (err) {
      self._mode = 0; // CONNECT -> OFFLINE
      connection.removeListener('connect', connected);
      if (opt_callback) {
        opt_callback(err);
      } else {
        self.emit('error', err);
      }
    } else {
      self._mode = 3; // CONNECT -> NORMAL
      connection.on('error', self.emit.bind(self, 'error'));
      connection.removeListener('error', connected);
      connection.pipe(parser);
      // Emitted when the socket is fully closed.
      connection.on('close', function() {
        if (self._mode > 2) {
          self._mode = 0; // NORMAL -> OFFLINE
          self.reconnect();
          // reconnect may have changed the mode
          if (self._mode === 0) { // OFFLINE
            self.emit('close');
          }
        } else {
          self._mode = 0; // NORMAL -> OFFLINE
          self.emit('close');
        }
      });

      if (opt_callback) {
        opt_callback(null);
      }
      self.emit('connect');
    }
  }

  connection = this.connection = net.connect(
      {port: this.port, host: this.host}, connected);
  connection.once('error', connected);
};


/**
 * @return {boolean} true if reconnect is active, otherwise false.
 */
Client.prototype.reconnect = function() {
  var self = this;

  function reconnectInterval() {
    if (self._reconnect && self._reconnectCount < self._maxReconnectCount) {
      ++self._reconnectCount;
      self.connect(function(err) {
        if (!err) {
          clearInterval(self._reconnectIntervalId);
          self._reconnectIntervalId = null;
          if (self._reconnectCount === self._maxReconnectCount) {
            self.emit('close');
          }
        }
        self.emit('reconnect', err);
      });
    }

    // clear interval (right after the last reconnect)
    if (!self._reconnect || self._reconnectCount === self._maxReconnectCount) {
      clearInterval(self._reconnectIntervalId);
      self._reconnectIntervalId = null;
    }
  }

  if (this._mode === 0 && this._reconnect &&
      self._reconnectCount < self._maxReconnectCount) {
    if (!this._reconnectIntervalId) {
      this._reconnectIntervalId =
          setInterval(reconnectInterval, this._reconnectInterval);
      reconnectInterval();
    }
    return true;
  }
  return false;
};


/**
 *
 */
Client.prototype.call = function(/* var_args, */opt_callback) {
  var args = Array.prototype.slice.call(arguments);
  var crlf = '\r\n';
  var cmd = '*';
  var length, i = 0;
  var self = this;

  if (typeof args[args.length - 1] === 'function') {
    opt_callback = args.pop();
  } else {
    opt_callback = false;
  }

  if (this._mode < 3) { // OFFLINE, CONNECT or CLOSE
    if (opt_callback) {
      return opt_callback(new Error('Not available in current mode'), null);
    }
    return this.emit('error', new Error('Not available in current mode'));
  }

  if (Array.isArray(args[0])) {
    args = args[0];
  }

  length = args.length;
  cmd += length + crlf;

  do {
    if (typeof args[i] !== 'string') {
      args[i] = args[i].toString();
    }
    cmd += '$' + args[i].length + crlf + args[i] + crlf;
  } while (++i < length);

  if (opt_callback) {
    this._callbacks[++this._tx] = opt_callback;
  } else {
    ++this._tx;
  }

  this.connection.write(cmd);
  return this;
};


/**
 *
 */
Client.prototype._onReply = function(type, value) {
  var cb = false;

  if (type === 42 && this._special.indexOf(value[0]) > -1) {
    this.emit(value[0], value[1], value[2]);
    if (value[0] === 'message') {
      return;
    }
  }
  if (typeof this._callbacks[++this._rx] === 'function') {
    cb = this._callbacks[this._rx];
    delete this._callbacks[this._rx];

    if (type === 45) {
      return cb(new Error(value), null);
    }
    return cb(null, value);
  } else if (type === 45) { // '-' error
    return this.emit('error', new Error(value));
  }
  // unhandled replies are ignored.
};


/**
 *
 */
Client.prototype.close = function(opt_callback) {
  if (this._mode < 3) { // OFFLINE, CONNECT or CLOSE
    if (opt_callback) {
      return opt_callback();
    }
    return;
  }

  this._mode = 2; // CLOSE

  if (opt_callback) {
    this.once('close', opt_callback);
  }
  this.connection.end();
};
