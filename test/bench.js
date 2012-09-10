/*global describe it*/
'use strict';

var redjs = require('../lib');

describe('Benchmark', function() {
  describe('PING', function() {
    var client = redjs.createClient();

    it('20001', function(done) {
      client.connect(function(err) {
        var tx = 0;
        var d;

        function pong(type, value) {
          done();
        }

        d = process.hrtime();
        do {
          client.send('PING');
          client.send('PING');
          client.send('PING');
          client.send('PING');
          client.send('PING');
          client.send('PING');
          client.send('PING');
          client.send('PING');
          client.send('PING');
          client.send('PING');
        } while ((tx += 10) < 20000);
        client.send('PING', pong);
      });

    });
  });

  describe('SET', function() {
    var client = redjs.createClient();

    it('20001', function(done) {
      client.connect(function(err) {
        var tx = 0;
        var d;

        function pong(type, value) {
          done();
        }

        d = process.hrtime();
        do {
          client.send('SET', 'a', '1');
          client.send('SET', 'a', '1');
          client.send('SET', 'a', '1');
          client.send('SET', 'a', '1');
          client.send('SET', 'a', '1');
          client.send('SET', 'a', '1');
          client.send('SET', 'a', '1');
          client.send('SET', 'a', '1');
          client.send('SET', 'a', '1');
          client.send('SET', 'a', '1');
        } while ((tx += 10) < 20000);
        client.send('SET', 'a', '1', pong);
      });
    });
  });

  describe('GET', function() {
    var client = redjs.createClient();

    it('20001', function(done) {
      client.connect(function(err) {
        var tx = 0;
        var d;

        function pong(type, value) {
          done();
        }

        d = process.hrtime();
        do {
          client.send('GET', 'a');
          client.send('GET', 'a');
          client.send('GET', 'a');
          client.send('GET', 'a');
          client.send('GET', 'a');
          client.send('GET', 'a');
          client.send('GET', 'a');
          client.send('GET', 'a');
          client.send('GET', 'a');
          client.send('GET', 'a');
        } while ((tx += 10) < 20000);
        client.send('GET', 'a', pong);
      });
    });
  });

  describe('KEYS *', function() {
    var client = redjs.createClient();

    it('20001', function(done) {
      client.connect(function(err) {
        var tx = 0;
        var d;

        function pong(type, value) {
          done();
        }

        d = process.hrtime();
        do {
          client.send('KEYS', '*');
          client.send('KEYS', '*');
          client.send('KEYS', '*');
          client.send('KEYS', '*');
          client.send('KEYS', '*');
          client.send('KEYS', '*');
          client.send('KEYS', '*');
          client.send('KEYS', '*');
          client.send('KEYS', '*');
          client.send('KEYS', '*');
        } while ((tx += 10) < 20000);
        client.send('KEYS', '*', pong);
      });
    });
  });
});



