/* */ 
'use strict';
Object.defineProperty(exports, "__esModule", {value: true});
exports.default = race;
var _isArray = require('lodash/isArray');
var _isArray2 = _interopRequireDefault(_isArray);
var _noop = require('lodash/noop');
var _noop2 = _interopRequireDefault(_noop);
var _once = require('./internal/once');
var _once2 = _interopRequireDefault(_once);
function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {default: obj};
}
function race(tasks, callback) {
  callback = (0, _once2.default)(callback || _noop2.default);
  if (!(0, _isArray2.default)(tasks))
    return callback(new TypeError('First argument to race must be an array of functions'));
  if (!tasks.length)
    return callback();
  for (var i = 0,
      l = tasks.length; i < l; i++) {
    tasks[i](callback);
  }
}
module.exports = exports['default'];
