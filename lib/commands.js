/*!
 * redjs
 * @author skenqbx@gmail.com <Malte-Thorben Bruns>
 */
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
