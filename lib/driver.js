/*!
 * redjs
 * @author skenqbx@gmail.com <Malte-Thorben Bruns>
 */
'use strict';

var util = require('util');
var events = require('events');
var commands = require('./commands');
var Client = require('./client');



/**
 * Redis Driver (no binary support)
 * @constructor
 * @extends {events.EventEmitter}
 */
function Driver(opt_options) {
  opt_options = opt_options || {};
  this._options = {
    port: opt_options.port || null,
    host: opt_options.host || null
  };
  this._client = null;
}
util.inherits(Driver, events.EventEmitter);
module.exports = Driver;


/**
 *
 */
Driver.prototype.connect = function(opt_callback) {
  this._client = new Client(this._options);
  this._client.connect(opt_callback);
};


/**
 *
 */
function populate(p, name) {
  name = name.toUpperCase();
  p[name.toLowerCase()] = function() {
    var cb, args = Array.prototype.slice.call(arguments);
    args.unshift(name);
    if (typeof args[args.length - 1] === 'function') {
      cb = args.pop();
    }
    this._client.send(args, cb);
  };
}

var i, len = commands.keys.length;
for (i = 0; i < len; ++i) {
  populate(Driver.prototype, commands.keys[i]);
}
len = commands.strings.length;
for (i = 0; i < len; ++i) {
  populate(Driver.prototype, commands.strings[i]);
}
len = commands.lists.length;
for (i = 0; i < len; ++i) {
  populate(Driver.prototype, commands.lists[i]);
}
len = commands.sets.length;
for (i = 0; i < len; ++i) {
  populate(Driver.prototype, commands.sets[i]);
}
len = commands.sortedsets.length;
for (i = 0; i < len; ++i) {
  populate(Driver.prototype, commands.sortedsets[i]);
}
len = commands.hashes.length;
for (i = 0; i < len; ++i) {
  populate(Driver.prototype, commands.hashes[i]);
}
len = commands.pubsub.length;
for (i = 0; i < len; ++i) {
  populate(Driver.prototype, commands.pubsub[i]);
}
len = commands.transactions.length;
for (i = 0; i < len; ++i) {
  populate(Driver.prototype, commands.transactions[i]);
}
