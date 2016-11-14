/* */ 
'use strict';
Object.defineProperty(exports, "__esModule", {value: true});
var _promise = require('babel-runtime/core-js/promise');
var _promise2 = _interopRequireDefault(_promise);
var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');
var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);
var _createClass2 = require('babel-runtime/helpers/createClass');
var _createClass3 = _interopRequireDefault(_createClass2);
var _path = require('path');
var _path2 = _interopRequireDefault(_path);
var _fsExtra = require('fs-extra');
var _fsExtra2 = _interopRequireDefault(_fsExtra);
function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {default: obj};
}
var CssAssetCopier = function() {
  function CssAssetCopier(target) {
    (0, _classCallCheck3.default)(this, CssAssetCopier);
    this.target = target || '.';
    this.copyPromises = {};
  }
  (0, _createClass3.default)(CssAssetCopier, [{
    key: 'copyAssets',
    value: function copyAssets(tasks) {
      var _this = this;
      var promises = tasks.map(function(_ref) {
        var fromPath = _ref.fromPath;
        var toPath = _ref.toPath;
        var targetPath = _path2.default.join(_this.target, toPath);
        if (_path2.default.resolve(fromPath) !== _path2.default.resolve(targetPath)) {
          return _this.copyAsset(fromPath, targetPath);
        }
        return undefined;
      });
      return _promise2.default.all(promises);
    }
  }, {
    key: 'copyAsset',
    value: function copyAsset(fromPath, toPath) {
      if (this.copyPromises[toPath]) {
        return this.copyPromises[toPath];
      }
      var promise = new _promise2.default(function(resolve, reject) {
        _fsExtra2.default.copy(fromPath, toPath, function(error) {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        });
      });
      this.copyPromises[toPath] = promise;
      return promise;
    }
  }]);
  return CssAssetCopier;
}();
exports.default = CssAssetCopier;
