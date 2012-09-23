# redjs
_A redis library for node.js_

```js
Stability: 1 - Experimental
```

#### Features
 - redis unified request protocol
 - dead simple api
 - lazy-loading components

#### TODO
 - cluster & failover
 - consistent hashing

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

  client.send(['SET', 'keyA', 'listA']);
  client.send(['GET', 'keyA'], function(err, reply) {
    if (err) {
      return console.log(err.message);
    }

    // null is redis way to say: it does not exist.
    if (reply !== null) {
      client.send(['RPUSH', reply, 'some', 'list', 'elements']);
      client.send(['LRANGE', reply, '0', '-1'], function(err, reply) {
        console.log(err, reply);
      });
    }
  });
});

```

## api

### createClient(opt_options)
Create a new client object. `Client` extends `events.EventEmitter`.

The Client is a bare metal network client for redis. It provides only a basic interface for issuing commands, nothing fancy.

`opt_options` contains optional configuration:

```js
{
  host: '127.0.0.1',
  port: 6379,
  reconnect: true,
  maxReconnectCount: 10,
  reconnectInterval: 5000
}
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

`err` contains an `Error` if the reconnect failed.

#### Event: 'close'
Emitted when the underlying socket is fully closed.

`function()`

#### Event: 'parser_error'
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
`opt_callback` is a `function(err)`.

#### client.reconnect()
Initiate reconnect manually.
The client only tries to reconnect when at least one successful connection could be made.

The only real use is when a client can't establish the initial connection:

```js
client.connect(function(err) {
  if (err) {
    client.reconnect();
  }
});
```


#### client.send(var_args, opt_callback)
```js
client.send('SET', 'keyA', '1');
client.send('KEYS', '*', function(err, reply) {
  console.log(err, reply);
});
```
Or use an `Array` as 1st argument

```js
client.send(['REM', 'keyA', 'keyB', 'keyC'], function(err, replies) {
  console.log(replies);
});
```
#### client.close(opt_callback)
`opt_callback` is registered as 'close' event listener.

### createParser()
Create a new parser object. `Parser` extends `Stream`.

#### Event: 'reply'
`function(type, value)`

`type` is one of `status`, `error`, `number`, `bulk` or `multi`.

`value` depends on type.

#### Event: 'error'
`funtion(err)`

An example parser error object:

```
{ message: 'Unexpected character',
  state: 1,
  reply: 0, // reply type
  type: 0,
  c: 107 }
```

#### parser.states
`['NONE', 'INIT', 'BULK_COUNT', 'MULTI_COUNT', 'TYPE', 'LINE', 'DATA']`

#### parser.types
`['NONE', 'STATUS', 'ERROR', 'NUMBER', 'BULK', 'MULTI']`

#### parser.write(buffer)

## tests
```
make jshint
make test
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
