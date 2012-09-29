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

exports.generic = {};
exports.generic._slave = ['dump', 'exists', 'keys', 'object', 'pttl',
    'randomkey', 'ttl', 'type'];
exports.generic._master = ['del', 'expire', 'expireat', 'move', 'persist',
    'pexpire', 'pexpireat', 'rename', 'renamenx', 'restore', 'sort'];

exports.string = {};
exports.string._slave =
    ['bitcount', 'bitop', 'get', 'getbit', 'getrange', 'mget', 'strlen'];
exports.string._master = ['append', 'decr', 'decrby', 'getset', 'incr',
    'incrby', 'incrbyfloat', 'mset', 'msetnx', 'psetex', 'set', 'setbit',
    'setex', 'setnx', 'setrange'];

exports.list = {};
exports.list._slave = ['lindex', 'llen', 'lrange'];
exports.list._master = ['blpop', 'brpop', 'brpoplpush', 'linsert', 'lpop',
    'lpush', 'lpushx', 'lrem', 'lset', 'ltrim', 'rpop', 'rpoplpush', 'rpush',
    'rpushx'];

exports.set = {};
exports.set._slave = ['scard', 'sdiff', 'sinter', 'sismember', 'smembers',
    'srandmember', 'sunion'];
exports.set._master = ['sadd', 'sdiffstore', 'sinterstore', 'smove', 'spop',
    'srem', 'sunionstore'];

exports.sorted_set = {};
exports.sorted_set._slave = ['zcard', 'zcount', 'zrange', 'zrangebyscore',
    'zrank', 'zrevrange', 'zrevrangebyscore', 'zrevrank', 'zscore'];
exports.sorted_set._master = ['zadd', 'zincrby', 'zinterstore', 'zrem',
    'zremrangebyrank', 'zremrangebyscore', 'zunionstore'];


exports.connection = {};
exports.connection._slave = ['auth', 'echo', 'ping', 'quit', 'select'];
exports.connection._master = [];

exports.server = {};
exports.server._slave = ['bgrewriteaof', 'bgsave', 'client', 'config', 'dbsize',
    'debug', 'info', 'lastsave', 'monitor', 'save', 'shutdown', 'slaveof',
    'slowlog', 'time'];
exports.server._master = ['flushall', 'flushdb'];

exports.hash = require('./hash');
exports.transactions = require('./transactions');
exports.pubsub = require('./pubsub');
exports.scripting = require('./scripting');
