/*!
 * redjs
 * @author skenqbx@gmail.com <Malte-Thorben Bruns>
 */
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

  if (opt_callback) {
    this.once('connect', opt_callback);
  }

  var parser = this.parser = new Parser();
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

  var connection = this.connection = net.connect({port: 6379}, function() {
    self.emit('connect');
    connection.pipe(parser);
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
