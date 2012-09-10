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
