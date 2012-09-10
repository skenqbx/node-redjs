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

var commands = module.exports = {};

commands.keys =
    ['get', 'set', 'del', 'exists', 'ttl', 'type', 'expireat', 'persist',
        'expire', 'sort'];

commands.strings =
    ['append', 'bitcount', 'bitop', 'decr', 'decrby', 'get', 'getbit',
        'getrange', 'getset', 'incr', 'incrby', 'incrbyfloat', 'mget', 'mset',
        'mgetnx', 'msetnx', 'set', 'setbit', 'setex', 'setnx', 'setrange',
        'strlen'];

commands.hashes =
    ['hdel', 'hexists', 'hget', 'hgetall', 'hincrby', 'hincrbyfloat', 'hkeys',
        'hlen', 'hmget', 'hmset', 'hset', 'hsetnx', 'hvals'];

commands.lists =
    ['lindex', 'linsert', 'llen', 'lpop', 'lpush', 'lpushx', 'lrange', 'lrem',
        'lset', 'ltrim', 'rpop', 'rpoplpush', 'rpush', 'rpushx'];

commands.sets =
    ['sadd', 'scard', 'sdiff', 'sdiffstore', 'sinter', 'sinterstore',
        'sismember', 'smembers', 'smove', 'spop', 'srandmember', 'srem',
        'sunion', 'sunionstore'];

commands.sortedsets =
    ['zadd', 'zcard', 'zcount', 'zincrby', 'zinterstore', 'zrange',
        'zrangebyscore', 'zrank', 'zrem', 'zremrangebyrank',
        'zremrangebyscore', 'zrevrange', 'zrevrangebyscore',
        'zrevrank', 'zscore', 'zunionstore'];

commands.pubsub =
    ['publish', 'subscribe', 'unsubscribe', 'psubscribe', 'punsubscribe'];

commands.transactions = ['multi', 'exec', 'discard'];
