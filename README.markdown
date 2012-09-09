# redjs
__Lighweight redis client for node.js__

```js
Stability: 1 - Experimental
```

## api
### createClient()
Create a new client object. `Client` is an `EventEmitter`.

#### client.connect(opt_callback)

#### client.send(var_args, opt_callback)
```js
client.send('SET', 'keyA', '1');
client.send('KEYS', '*', function(err, value) {
  console.log(value);
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

#### Event: 'error'
`funtion(err)`

## tests
```
make jshint
make test
```
