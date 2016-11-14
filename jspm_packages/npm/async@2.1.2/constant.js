/* */ 
'use strict';
Object.defineProperty(exports, "__esModule", {value: true});
var _baseRest = require('lodash/_baseRest');
var _baseRest2 = _interopRequireDefault(_baseRest);
var _initialParams = require('./internal/initialParams');
var _initialParams2 = _interopRequireDefault(_initialParams);
function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {default: obj};
}
exports.default = (0, _baseRest2.default)(function(values) {
  var args = [null].concat(values);
  return (0, _initialParams2.default)(function(ignoredArgs, callback) {
    return callback.apply(this, args);
  });
});
module.exports = exports['default'];
