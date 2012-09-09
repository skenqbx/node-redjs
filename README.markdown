# redjs
_Lighweight redis library for node.js_

```js
Stability: 1 - Experimental
```

### createDriver(opt_options)
Create a new driver object. `Driver` extends `Client`.

On load the all commands from `lib/commands.js` are populated on the drivers prototype.

```
var driver = redjs.createDriver();
driver.connect(function() {
  driver.set('testkey', 'a', function(err, reply) {
    console.log(reply);
  });
});

## api
### createClient(opt_options)
Create a new client object. `Client` extends `EventEmitter`.

`opt_options` contains optional configuration:
```js
{
  host: '127.0.0.1',
  port: 6379
}
```

#### client.connect(opt_callback)
`opt_callback` is registered as listener for the 'connect' event.

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
