/* */ 
'use strict';
Object.defineProperty(exports, "__esModule", {value: true});
exports.default = doDuring;
var _noop = require('lodash/noop');
var _noop2 = _interopRequireDefault(_noop);
var _baseRest = require('lodash/_baseRest');
var _baseRest2 = _interopRequireDefault(_baseRest);
var _onlyOnce = require('./internal/onlyOnce');
var _onlyOnce2 = _interopRequireDefault(_onlyOnce);
function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {default: obj};
}
function doDuring(fn, test, callback) {
  callback = (0, _onlyOnce2.default)(callback || _noop2.default);
  var next = (0, _baseRest2.default)(function(err, args) {
    if (err)
      return callback(err);
    args.push(check);
    test.apply(this, args);
  });
  function check(err, truth) {
    if (err)
      return callback(err);
    if (!truth)
      return callback(null);
    fn(next);
  }
  check(null, true);
}
module.exports = exports['default'];
