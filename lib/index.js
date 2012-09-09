/*!
 * redjs
 * @author skenqbx@gmail.com <Malte-Thorben Bruns>
 */
'use strict';


function createParser() {
  return new (require('./parser'))();
}
exports.createParser = createParser;


function createClient(opt_options) {
  return new (require('./client'))(opt_options);
}
exports.createClient = createClient;


function createDriver(opt_options) {
  return new (require('./driver'))(opt_options);
}
exports.createDriver = createDriver;
