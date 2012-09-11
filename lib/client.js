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
 * Redis Client (no binary support)
 * @constructor
 * @extends {events.EventEmitter}
 */
function Client(opt_options) {
  events.EventEmitter.call(this);

  opt_options = opt_options || {};

  Object.defineProperties(this, {
    _tx: {value: 0, writable: true},
    _rx: {value: 0, writable: true}
  });

  this.parser = null;
  this.connection = null;
  this.mode = 0;
  this.modes = ['OFFLINE', 'CONNECT', 'CLOSE', 'COMMAND'];

  this.port = opt_options.port || 6379;
  this.host = opt_options.host || null;

  this._reconnect = typeof opt_options.reconnect === 'boolean' ?
      opt_options.reconnect : true;
  this._reconnectCount = 0;
  this._maxReconnectCount = opt_options.maxReconnectCount || 10;
  this._reconnectInterval = opt_options.reconnectInterval || 5000;
  this._reconnectIntervalId = null;
}
util.inherits(Client, events.EventEmitter);
module.exports = Client;


/**
 *
 */
Client.prototype.connect = function(opt_callback) {
  var self = this;
  var connection, parser;

  if (this.mode !== 0) { // !OFFLINE
    if (opt_callback) {
      opt_callback(new Error('Already connecting'));
    }
    return;
  }
  this.mode = 1; // OFFLINE -> CONNECT

  parser = this.parser = new Parser();
  parser.on('reply', function(type, value) {
    if (type === 'error') {
      return self.emit('cmd' + (++self._rx), new Error(value), null);
    } else if (type === 'multi' && value[0] === 'message') {
      self.emit('message', value[1], value[2]);
    } else {
      self.emit('cmd' + (++self._rx), null, value);
    }
  });

  parser.on('error', function(err) {
    self.emit('error', err);
    parser.reset();
  });

  function connected(err) {
    if (err) {
      self.mode = 0 // CONNECT -> OFFLINE
      connection.removeListener('connect', connected);
      if (opt_callback) {
        opt_callback(err);
      } else {
        self.emit('error', err);
      }
    } else {
      self.mode = 3; // CONNECT -> COMMAND
      connection.on('error', self.emit.bind(self, 'error'));
      connection.removeListener('error', connected);
      connection.pipe(parser);
      // Emitted when the socket is fully closed.
      connection.on('close', function() {
        if (self.mode > 2) {
          self.mode = 0; // COMMAND -> OFFLINE
          self.reconnect();
        } else {
          self.mode = 0; // COMMAND -> OFFLINE
        }

        if (self.mode === 0) { // OFFLINE
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

  if (this.mode !== 0) { // !OFFLINE
    return false;
  }

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

  if (this._reconnect && self._reconnectCount < self._maxReconnectCount) {
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
Client.prototype.send = function(/* var_args, */opt_callback) {
  var args = Array.prototype.slice.call(arguments);
  var crlf = '\r\n';

  if (this.mode < 3) { // OFFLINE, CONNECT or CLOSE
    if (opt_callback) {
      opt_callback(new Error('Not available in current mode'), null);
    } else {
      this.emit('error', new Error('Not available in current mode'));
    }
    return;
  }

  if (typeof args[0] === 'object') {
    opt_callback = args[1];
    args = args[0];
  } else if (typeof args[args.length - 1] === 'function') {
    opt_callback = args.pop();
  } else {
    opt_callback = false;
  }

  var i, length = args.length;
  var cmd = ['*' + length];

  for (i = 0; i < length; ++i) {
    if (typeof args[i] === 'number') {
      cmd.push(':' + args[i].toString());
    } else {
      cmd.push('$' + args[i].length);
      cmd.push(args[i]);
    }
  }
  cmd[2] = cmd[2].toUpperCase();

  if (opt_callback) {
    this.once('cmd' + (++this._tx), opt_callback);
  } else {
    ++this._tx;
  }

  this.connection.write(cmd.join(crlf) + crlf);
  return this._tx;
};


/**
 *
 */
Client.prototype.close = function(opt_callback) {
  if (this.mode < 3) { // OFFLINE, CONNECT or CLOSE
    if (opt_callback) {
      return opt_callback();
    }
    return;
  }

  this.mode = 2; // CLOSE

  if (opt_callback) {
    this.once('close', opt_callback);
  }
  this.connection.end();
};
