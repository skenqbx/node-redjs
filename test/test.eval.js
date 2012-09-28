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
/*global describe it*/

var fs = require('fs');
var crypto = require('crypto');
var assert = require('assert');
var redjs = require('../');
var scripts = {
  lunionstore: fs.readFileSync(__dirname + '/lua/lunionstore.lua').toString(),
  ldiffstore: fs.readFileSync(__dirname + '/lua/ldiffstore.lua').toString(),
  linterstore: fs.readFileSync(__dirname + '/lua/linterstore.lua').toString(),
  luniquestore: fs.readFileSync(__dirname + '/lua/luniquestore.lua').toString()
};

var scriptHashes = {
  lunionstore:
      crypto.createHash('sha1').update(scripts.lunionstore).digest('hex'),
  ldiffstore:
      crypto.createHash('sha1').update(scripts.ldiffstore).digest('hex'),
  linterstore:
      crypto.createHash('sha1').update(scripts.linterstore).digest('hex'),
  luniquestore:
      crypto.createHash('sha1').update(scripts.luniquestore).digest('hex')
};

describe('eval', function() {
  var client = redjs.createClient();

  it('connect()', function(done) {
    client.connect(done);
  });

  it('return {ARGV[1], ARGV[2]}', function(done) {
    client.call(['EVAL', 'return {ARGV[1], ARGV[2]}', '0', 'first', 'second'],
        function(err, reply) {
          assert.strictEqual(err, null);
          assert.deepEqual(reply, ['first', 'second']);
          done();
        });
  });

  it('LUNIONSTORE', function(done) {
    var listA = ['RPUSH', 'listA', 'A', 'B', 'C', 'D', 'E'];
    var listB = ['RPUSH', 'listB', 'F', 'G', 'H', 'I', 'J'];

    client.call('DEL', 'listA', 'listB', 'listC');
    client.call(listA);
    client.call(listB);
    client.call(['EVAL', scripts.lunionstore, '3', 'listA', 'listB', 'listC'],
        function(err, reply) {
          assert.strictEqual(err, null);
          assert.equal(reply, '10');

          client.call('LRANGE', 'listC', '0', '-1', function(err, reply) {
            assert.strictEqual(err, null);
            assert.deepEqual(reply,
                ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']);
            done();
          });
        });
  });

  it('LUNIONSTORE SHA', function(done) {
    var listA = ['RPUSH', 'listA', 'A', 'B', 'C', 'D', 'E'];
    var listB = ['RPUSH', 'listB', 'F', 'G', 'H', 'I', 'J'];

    client.call('DEL', 'listA', 'listB', 'listC');
    client.call(listA);
    client.call(listB);
    client.call(
        ['EVALSHA', scriptHashes.lunionstore, '3', 'listA', 'listB', 'listC'],
        function(err, reply) {
          assert.strictEqual(err, null);
          assert.equal(reply, '10');

          client.call('LRANGE', 'listC', '0', '-1', function(err, reply) {
            assert.strictEqual(err, null);
            assert.deepEqual(reply,
                ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']);
            done();
          });
        });
  });

  it('LDIFFSTORE', function(done) {
    var listA = ['RPUSH', 'listA', 'A', 'B', 'C', 'D', 'E'];
    var listB = ['RPUSH', 'listB', 'A', 'B', 'Z', 'D', 'E'];

    client.call('DEL', 'listA', 'listB', 'listC');
    client.call(listA);
    client.call(listB);
    client.call(['EVAL', scripts.ldiffstore, '3', 'listA', 'listB', 'listC'],
        function(err, reply) {
          assert.strictEqual(err, null);
          assert.equal(reply, '2');

          client.call('LRANGE', 'listC', '0', '-1', function(err, reply) {
            assert.strictEqual(err, null);
            assert.deepEqual(reply, ['C', 'Z']);
            done();
          });
        });
  });

  it('LDIFFSTORE SHA', function(done) {
    var listA = ['RPUSH', 'listA', 'A', 'B', 'C', 'D', 'E'];
    var listB = ['RPUSH', 'listB', 'A', 'B', 'Z', 'D', 'E'];

    client.call('DEL', 'listA', 'listB', 'listC');
    client.call(listA);
    client.call(listB);
    client.call(
        ['EVALSHA', scriptHashes.ldiffstore, '3', 'listA', 'listB', 'listC'],
        function(err, reply) {
          assert.strictEqual(err, null);
          assert.equal(reply, '2');

          client.call('LRANGE', 'listC', '0', '-1', function(err, reply) {
            assert.strictEqual(err, null);
            assert.deepEqual(reply, ['C', 'Z']);
            done();
          });
        });
  });

  it('LINTERSTORE', function(done) {
    var listA = ['RPUSH', 'listA', 'A', 'B', 'C', 'D', 'E'];
    var listB = ['RPUSH', 'listB', 'A', 'B', 'Z', 'D', 'E'];

    client.call('DEL', 'listA', 'listB', 'listC');
    client.call(listA);
    client.call(listB);
    client.call(['EVAL', scripts.linterstore, '3', 'listA', 'listB', 'listC'],
        function(err, reply) {
          assert.strictEqual(err, null);
          assert.equal(reply, '4');

          client.call('LRANGE', 'listC', '0', '-1', function(err, reply) {
            assert.strictEqual(err, null);
            assert.deepEqual(reply, ['A', 'B', 'D', 'E']);
            done();
          });
        });
  });

  it('LINTERSTORE SHA', function(done) {
    var listA = ['RPUSH', 'listA', 'A', 'B', 'C', 'D', 'E'];
    var listB = ['RPUSH', 'listB', 'A', 'B', 'Z', 'D', 'E'];

    client.call('DEL', 'listA', 'listB', 'listC');
    client.call(listA);
    client.call(listB);
    client.call(
        ['EVALSHA', scriptHashes.linterstore, '3', 'listA', 'listB', 'listC'],
        function(err, reply) {
          assert.strictEqual(err, null);
          assert.equal(reply, '4');

          client.call('LRANGE', 'listC', '0', '-1', function(err, reply) {
            assert.strictEqual(err, null);
            assert.deepEqual(reply, ['A', 'B', 'D', 'E']);
            done();
          });
        });
  });

  it('LUNIQUESTORE', function(done) {
    var listA = ['RPUSH', 'listA', 'A', 'B', 'C', 'D', 'E'];
    var listB = ['RPUSH', 'listB', 'A', 'B', 'Z', 'D', 'E'];

    client.call('DEL', 'listA', 'listB', 'listC');
    client.call(listA);
    client.call(listB);
    client.call(['EVAL', scripts.luniquestore, '3', 'listA', 'listB', 'listC'],
        function(err, reply) {
          assert.strictEqual(err, null);
          assert.equal(reply, '6');

          client.call('LRANGE', 'listC', '0', '-1', function(err, reply) {
            assert.strictEqual(err, null);
            assert.deepEqual(reply, ['A', 'B', 'C', 'D', 'E', 'Z']);
            done();
          });
        });
  });

  it('LUNIQUESTORE SHA', function(done) {
    var listA = ['RPUSH', 'listA', 'A', 'B', 'C', 'D', 'E'];
    var listB = ['RPUSH', 'listB', 'A', 'B', 'Z', 'D', 'E'];

    client.call('DEL', 'listA', 'listB', 'listC');
    client.call(listA);
    client.call(listB);
    client.call(
        ['EVALSHA', scriptHashes.luniquestore, '3', 'listA', 'listB', 'listC'],
        function(err, reply) {
          assert.strictEqual(err, null);
          assert.equal(reply, '6');

          client.call('LRANGE', 'listC', '0', '-1', function(err, reply) {
            assert.strictEqual(err, null);
            assert.deepEqual(reply, ['A', 'B', 'C', 'D', 'E', 'Z']);
            done();
          });
        });
  });
});
