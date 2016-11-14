/* */ 
'use strict';
Object.defineProperty(exports, "__esModule", {value: true});
exports.default = function(coll, iteratee, callback) {
  var eachOfImplementation = (0, _isArrayLike2.default)(coll) ? eachOfArrayLike : eachOfGeneric;
  eachOfImplementation(coll, iteratee, callback);
};
var _isArrayLike = require('lodash/isArrayLike');
var _isArrayLike2 = _interopRequireDefault(_isArrayLike);
var _eachOfLimit = require('./eachOfLimit');
var _eachOfLimit2 = _interopRequireDefault(_eachOfLimit);
var _doLimit = require('./internal/doLimit');
var _doLimit2 = _interopRequireDefault(_doLimit);
var _noop = require('lodash/noop');
var _noop2 = _interopRequireDefault(_noop);
var _once = require('./internal/once');
var _once2 = _interopRequireDefault(_once);
var _onlyOnce = require('./internal/onlyOnce');
var _onlyOnce2 = _interopRequireDefault(_onlyOnce);
function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {default: obj};
}
function eachOfArrayLike(coll, iteratee, callback) {
  callback = (0, _once2.default)(callback || _noop2.default);
  var index = 0,
      completed = 0,
      length = coll.length;
  if (length === 0) {
    callback(null);
  }
  function iteratorCallback(err) {
    if (err) {
      callback(err);
    } else if (++completed === length) {
      callback(null);
    }
  }
  for (; index < length; index++) {
    iteratee(coll[index], index, (0, _onlyOnce2.default)(iteratorCallback));
  }
}
var eachOfGeneric = (0, _doLimit2.default)(_eachOfLimit2.default, Infinity);
module.exports = exports['default'];
