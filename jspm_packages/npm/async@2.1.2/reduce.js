/* */ 
(function(process) {
  'use strict';
  Object.defineProperty(exports, "__esModule", {value: true});
  exports.default = reduce;
  var _eachOfSeries = require('./eachOfSeries');
  var _eachOfSeries2 = _interopRequireDefault(_eachOfSeries);
  var _noop = require('lodash/noop');
  var _noop2 = _interopRequireDefault(_noop);
  var _once = require('./internal/once');
  var _once2 = _interopRequireDefault(_once);
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {default: obj};
  }
  function reduce(coll, memo, iteratee, callback) {
    callback = (0, _once2.default)(callback || _noop2.default);
    (0, _eachOfSeries2.default)(coll, function(x, i, callback) {
      iteratee(memo, x, function(err, v) {
        memo = v;
        callback(err);
      });
    }, function(err) {
      callback(err, memo);
    });
  }
  module.exports = exports['default'];
})(require('process'));
