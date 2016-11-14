/* */ 
(function(process) {
  'use strict';
  Object.defineProperty(exports, "__esModule", {value: true});
  exports.default = transform;
  var _isArray = require('lodash/isArray');
  var _isArray2 = _interopRequireDefault(_isArray);
  var _noop = require('lodash/noop');
  var _noop2 = _interopRequireDefault(_noop);
  var _eachOf = require('./eachOf');
  var _eachOf2 = _interopRequireDefault(_eachOf);
  var _once = require('./internal/once');
  var _once2 = _interopRequireDefault(_once);
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {default: obj};
  }
  function transform(coll, accumulator, iteratee, callback) {
    if (arguments.length === 3) {
      callback = iteratee;
      iteratee = accumulator;
      accumulator = (0, _isArray2.default)(coll) ? [] : {};
    }
    callback = (0, _once2.default)(callback || _noop2.default);
    (0, _eachOf2.default)(coll, function(v, k, cb) {
      iteratee(accumulator, v, k, cb);
    }, function(err) {
      callback(err, accumulator);
    });
  }
  module.exports = exports['default'];
})(require('process'));
