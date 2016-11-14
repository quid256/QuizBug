/* */ 
'use strict';
Object.defineProperty(exports, "__esModule", {value: true});
exports.default = during;
var _noop = require('lodash/noop');
var _noop2 = _interopRequireDefault(_noop);
var _onlyOnce = require('./internal/onlyOnce');
var _onlyOnce2 = _interopRequireDefault(_onlyOnce);
function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {default: obj};
}
function during(test, fn, callback) {
  callback = (0, _onlyOnce2.default)(callback || _noop2.default);
  function next(err) {
    if (err)
      return callback(err);
    test(check);
  }
  function check(err, truth) {
    if (err)
      return callback(err);
    if (!truth)
      return callback(null);
    fn(next);
  }
  test(check);
}
module.exports = exports['default'];
