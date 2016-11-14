/* */ 
'use strict';
Object.defineProperty(exports, "__esModule", {value: true});
var _noop = require('lodash/noop');
var _noop2 = _interopRequireDefault(_noop);
var _baseRest = require('lodash/_baseRest');
var _baseRest2 = _interopRequireDefault(_baseRest);
var _reduce = require('./reduce');
var _reduce2 = _interopRequireDefault(_reduce);
function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {default: obj};
}
exports.default = (0, _baseRest2.default)(function seq(functions) {
  return (0, _baseRest2.default)(function(args) {
    var that = this;
    var cb = args[args.length - 1];
    if (typeof cb == 'function') {
      args.pop();
    } else {
      cb = _noop2.default;
    }
    (0, _reduce2.default)(functions, args, function(newargs, fn, cb) {
      fn.apply(that, newargs.concat([(0, _baseRest2.default)(function(err, nextargs) {
        cb(err, nextargs);
      })]));
    }, function(err, results) {
      cb.apply(that, [err].concat(results));
    });
  });
});
module.exports = exports['default'];
