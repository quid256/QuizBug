/* */ 
'use strict';
Object.defineProperty(exports, "__esModule", {value: true});
exports.default = autoInject;
var _auto = require('./auto');
var _auto2 = _interopRequireDefault(_auto);
var _baseForOwn = require('lodash/_baseForOwn');
var _baseForOwn2 = _interopRequireDefault(_baseForOwn);
var _arrayMap = require('lodash/_arrayMap');
var _arrayMap2 = _interopRequireDefault(_arrayMap);
var _copyArray = require('lodash/_copyArray');
var _copyArray2 = _interopRequireDefault(_copyArray);
var _isArray = require('lodash/isArray');
var _isArray2 = _interopRequireDefault(_isArray);
var _trim = require('lodash/trim');
var _trim2 = _interopRequireDefault(_trim);
function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {default: obj};
}
var FN_ARGS = /^(function)?\s*[^\(]*\(\s*([^\)]*)\)/m;
var FN_ARG_SPLIT = /,/;
var FN_ARG = /(=.+)?(\s*)$/;
var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
function parseParams(func) {
  func = func.toString().replace(STRIP_COMMENTS, '');
  func = func.match(FN_ARGS)[2].replace(' ', '');
  func = func ? func.split(FN_ARG_SPLIT) : [];
  func = func.map(function(arg) {
    return (0, _trim2.default)(arg.replace(FN_ARG, ''));
  });
  return func;
}
function autoInject(tasks, callback) {
  var newTasks = {};
  (0, _baseForOwn2.default)(tasks, function(taskFn, key) {
    var params;
    if ((0, _isArray2.default)(taskFn)) {
      params = (0, _copyArray2.default)(taskFn);
      taskFn = params.pop();
      newTasks[key] = params.concat(params.length > 0 ? newTask : taskFn);
    } else if (taskFn.length === 1) {
      newTasks[key] = taskFn;
    } else {
      params = parseParams(taskFn);
      if (taskFn.length === 0 && params.length === 0) {
        throw new Error("autoInject task functions require explicit parameters.");
      }
      params.pop();
      newTasks[key] = params.concat(newTask);
    }
    function newTask(results, taskCb) {
      var newArgs = (0, _arrayMap2.default)(params, function(name) {
        return results[name];
      });
      newArgs.push(taskCb);
      taskFn.apply(null, newArgs);
    }
  });
  (0, _auto2.default)(newTasks, callback);
}
module.exports = exports['default'];
