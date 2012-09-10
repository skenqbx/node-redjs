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

  Object.defineProperties(this, {
    _tx: {value: 0, writable: true},
    _rx: {value: 0, writable: true}
  });

  this.parser = null;
  this.connection = null;

  opt_options = opt_options || {};
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

  connection = this.connection = net.connect(
      {port: this.port, host: this.host}, connected);

  function connected(err) {
    if (err) {
      connection.removeListener('connect', connected);
      if (opt_callback) {
        opt_callback(err);
      } else {
        self.emit('error', err);
      }
    } else {
      connection.removeListener('error', connected);
      connection.on('error', self.emit.bind(self, 'error'));
      connection.pipe(parser);
      if (opt_callback) {
        opt_callback(null);
      }
      self.emit('connect');
    }
  }

  connection.once('error', connected);

  connection.on('close', function() {
    self.emit('close');
  });

  connection.on('end', function() {
    self.emit('end');
  });
};


/**
 *
 */
Client.prototype.send = function(/* var_args, */opt_callback) {
  var args = Array.prototype.slice.call(arguments);
  var crlf = '\r\n';

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
    cmd.push('$' + args[i].length);
    cmd.push(args[i]);
  }

  if (opt_callback) {
    this.once('cmd' + (++this._tx), opt_callback);
  } else {
    ++this._tx;
  }

  this.connection.write(cmd.join(crlf) + crlf);
  return this._tx;
};
