# redjs
_A redis library for node.js_

```js
Stability: 1 - Experimental
```

#### Features
 - redis unified request protocol
 - requires no external dependencies
 - dead simple api

#### TODO
 - deeply nested multi bulk replies (e.g. slowlog command)
 - cluster & failover
 - consistent hashing
 - bulk binary data support

## install
```
npm install redjs
```

## api
### createDriver(opt_options)
Create a new driver object. `Driver` extends `events.EventEmitter`.

On load all redis commands from `lib/commands.js` are populated on the drivers prototype.

```js
var driver = redjs.createDriver();
driver.connect(function(err) {
  driver.set('testkey', 'a', function(err, reply) {
    console.log(reply);
  });
});
```

#### driver.connect(opt_callback)

### createClient(opt_options)
Create a new client object. `Client` extends `events.EventEmitter`.

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

#### client.connect(opt_callback)
#### client.reconnect()

#### client.send(var_args, opt_callback)
```js
var client = redjs.createClient();
client.connect(function(err) {
  client.send('SET', 'keyA', '1');
  client.send('KEYS', '*', function(err, reply) {
    console.log(reply);
  });
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

#### Event: 'connect'
#### Event: 'message'
`function(channel, message)`

#### Event: 'reconnect'
Emitted after trying to reconnect.

`function(err)`

`err` contains an `Error` if the reconnect failed.

#### Event: 'close'
Emitted when the underlying socket is fully closed.

`function(reconnectCount)`

#### Event: 'error'
`function(err)`

### createParser()
Create a new parser object. `Parser` extends `Stream`.

#### parser.write(buffer)

#### Event: 'reply'
`funtion(type, value)`

`type` is one of `status`, `error`, `number`, `bulk` or `multi`.

`value` depends on type.

#### Event: 'error'
`funtion(err)`

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
