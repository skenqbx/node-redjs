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

exports._slave =
    ['hexists', 'hget', 'hkeys', 'hlen', 'hmget', 'hvals', 'hgetall'];

exports._master =
    ['hdel', 'hincrby', 'hincrbyfloat', 'hset', 'hsetnx', 'hmset'];


exports.hmset = function(key, hash, opt_callback) {
  var cmd = ['hmset', key];
  var keys = Object.keys(hash);
  var l = keys.length;

  while (l--) {
    key = keys.shift();
    cmd.push(key, hash[key]);
  }
  this.call(cmd, opt_callback);
};


exports.hgetall = function(key, opt_callback) {
  if (opt_callback) {
    this.call('hgetall', key, function(err, reply) {
      var hash, l;
      if (err) {
        return opt_callback(err, null);
      } else if (reply) {
        hash = {};
        l = reply.length / 2;
        while (l--) {
          hash[reply.shift()] = reply.shift();
        }
        reply = hash;
      }
      opt_callback(null, reply);
    });
  } else {
    this.call('hgetall', key);
  }
};
