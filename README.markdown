# redjs
_A redis library for node.js_

```js
Stability: 1 - Experimental
```

[![Build Status](https://secure.travis-ci.org/skenqbx/node-redjs.png)](http://travis-ci.org/skenqbx/node-redjs)

#### features
 - support for all [commands](http://redis.io/commands)
 - [fast](https://gist.github.com/3773249)
 - dead simple api
 - ... and more than 95% test coverage

## install
```
npm install redjs
```

## example
```js
var client = redjs.createClient();

client.connect(function(err) {
  if (err) {
    return console.log(err.message);
  }

  client.call(['SET', 'keyA', 'listA']);
  client.call(['GET', 'keyA'], function(err, reply) {
    if (err) {
      return console.log(err.message);
    }

    // null is redis's way to say: it does not exist.
    if (reply !== null) {
      client
          .call(['RPUSH', reply, 'some', 'list', 'elements'])
          .call(['LRANGE', reply, 0, -1], function(err, reply) {
            console.log(err, reply);
          });
    }
  });
});
```

## api
### createClient(opt_options)
Create a new `Client` object. `Client` extends `events.EventEmitter`.

The Client is a bare metal network client for redis. It provides only a basic interface for issuing commands, nothing fancy.

`opt_options` contains optional configuration with the following defaults:

```js
{ host: '127.0.0.1',
  port: 6379,
  reconnect: true,
  maxReconnectCount: 10,
  reconnectInterval: 5000 }
```

#### Event: 'connect'
`function()`

#### Event: 'message'
`function(channel, message)`

#### Event: 'subscribe'
`function(channel, numSubscriptions)`

#### Event: 'unsubscribe'
`function(channel, numSubscriptions)`

#### Event: 'reconnect'
Emitted after trying to reconnect.

`function(err)`

#### Event: 'close'
Emitted when the underlying socket is fully closed.

`function()`

#### Event: 'parser_error'
See `Parser`.

`function(err)`

#### Event: 'error'
`function(err)`

#### client.mode
The current client mode, the values correspond with the array indexes of `client.modes`.

```js
console.log('mode id = %d name = %s', client.mode, client.modes[client.mode]);
```

#### client.modes
`['OFFLINE', 'CONNECT', 'CLOSE', 'NORMAL']`

#### client.connect(opt_callback)
`opt_callback` is an optional `function(err)`.

#### client.reconnect()
Initiate reconnect
The client only tries to reconnect when at least one successful connection could be made.

The only use-case is when a client can't establish the initial connection:

```js
client.connect(function(err) {
  if (err) {
    client.reconnect();
  }
});
```

#### client.call(var_args, opt_callback)
Send a command to the redis server. Allows for chaining.

```js
client
    .call('SET', 'keyA', '1')
    .call('KEYS', '*', function(err, reply) {
      console.log(err, reply);
    });
```
Or use an `Array` as 1st argument

```js
client.call(['DEL', 'keyA', 'keyB', 'keyC'], function(err, reply) {
  console.log(reply);
});
```
#### client.close(opt_callback)
`opt_callback` is an optional `function()` that is registered as 'close' event listener.

### createParser()
Creates a new `Parser` object. `Parser` extends `Stream`.

#### Event: 'reply'
`function(type, value)`

`type` is one of `43 (status)`, `45 (error)`, `58 (integer)`, `36 (bulk)` or `42 (multi-bulk)`.

`value` depends on type.

#### Event: 'parser_error'
Emitted when the parser encounters unexpected data.

`function(err)`

Example `err` object:

```js
{ message: 'Expected +, -, :, $ or *',
  rx: '',
  offset: 12,
  bytes: 19,
  c: 13 }
```

#### parser.write(buffer)

## tests
```
make install
make jshint
make test
make test-cov
```

## license
```
(The MIT License)

Copyright (c) 2012 Malte-Thorben Bruns <skenqbx@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
```
