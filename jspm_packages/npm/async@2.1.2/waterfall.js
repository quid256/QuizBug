/* */ 
'use strict';
Object.defineProperty(exports, "__esModule", {value: true});
exports.default = function(tasks, callback) {
  callback = (0, _once2.default)(callback || _noop2.default);
  if (!(0, _isArray2.default)(tasks))
    return callback(new Error('First argument to waterfall must be an array of functions'));
  if (!tasks.length)
    return callback();
  var taskIndex = 0;
  function nextTask(args) {
    if (taskIndex === tasks.length) {
      return callback.apply(null, [null].concat(args));
    }
    var taskCallback = (0, _onlyOnce2.default)((0, _baseRest2.default)(function(err, args) {
      if (err) {
        return callback.apply(null, [err].concat(args));
      }
      nextTask(args);
    }));
    args.push(taskCallback);
    var task = tasks[taskIndex++];
    task.apply(null, args);
  }
  nextTask([]);
};
var _isArray = require('lodash/isArray');
var _isArray2 = _interopRequireDefault(_isArray);
var _noop = require('lodash/noop');
var _noop2 = _interopRequireDefault(_noop);
var _once = require('./internal/once');
var _once2 = _interopRequireDefault(_once);
var _baseRest = require('lodash/_baseRest');
var _baseRest2 = _interopRequireDefault(_baseRest);
var _onlyOnce = require('./internal/onlyOnce');
var _onlyOnce2 = _interopRequireDefault(_onlyOnce);
function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {default: obj};
}
module.exports = exports['default'];
