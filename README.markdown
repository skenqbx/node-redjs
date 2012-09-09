# redjs
_Lighweight redis library for node.js_

```js
Stability: 1 - Experimental
```

**TODO**
 - deeply nested multi bulk replies (slowlog command)
 - binary data
 - re-connect

## api
### createDriver(opt_options)
Create a new driver object. `Driver` extends `events.EventEmitter`.

On load the all commands from `lib/commands.js` are populated on the drivers prototype.

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
  port: 6379
}
```

#### client.connect(opt_callback)

#### client.send(var_args, opt_callback)
```js
var client = redjs.createClient();
client.connect(function() {
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

#### Event: 'connect'
#### Event: 'message'
`function(channel, message)`

#### Event: 'error'
`function(err)`

### createParser()
Create a new parser object. `Parser` is a `Stream`.

#### parser.write(buffer)

#### Event: 'reply'
`funtion(type, value)`

`type` is one of `status`, `error`, `number`, `bulk`, `multi`.

`value` depends on type.

#### Event: 'error'
`funtion(err)`

## tests
```
make jshint
make test
```
