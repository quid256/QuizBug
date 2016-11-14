/* */ 
(function(process) {
  'use strict';
  Object.defineProperty(exports, "__esModule", {value: true});
  var _baseRest = require('lodash/_baseRest');
  var _baseRest2 = _interopRequireDefault(_baseRest);
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {default: obj};
  }
  exports.default = (0, _baseRest2.default)(function(fn, args) {
    return (0, _baseRest2.default)(function(callArgs) {
      return fn.apply(null, args.concat(callArgs));
    });
  });
  module.exports = exports['default'];
})(require('process'));
