/* */ 
'use strict';
Object.defineProperty(exports, "__esModule", {value: true});
var _values = require('babel-runtime/core-js/object/values');
var _values2 = _interopRequireDefault(_values);
var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');
var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);
var _entries = require('babel-runtime/core-js/object/entries');
var _entries2 = _interopRequireDefault(_entries);
var _assign = require('babel-runtime/core-js/object/assign');
var _assign2 = _interopRequireDefault(_assign);
var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');
var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);
var _createClass2 = require('babel-runtime/helpers/createClass');
var _createClass3 = _interopRequireDefault(_createClass2);
var _path = require('path');
var _path2 = _interopRequireDefault(_path);
function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {default: obj};
}
var CssUrlRewriter = function() {
  function CssUrlRewriter(options) {
    (0, _classCallCheck3.default)(this, CssUrlRewriter);
    this.urlRe = /\/\*[\s\S]*?\*\/|\/\/[^\r\n]*(?:\r\n|\r|\n|$)|([\s,:])url\(\s*("[^"]+"|'[^']+'|[^)]+)\s*\)/ig;
    this.options = (0, _assign2.default)({root: '.'}, options);
    this.reset();
  }
  (0, _createClass3.default)(CssUrlRewriter, [{
    key: 'rewrite',
    value: function rewrite(filename, content) {
      var _this = this;
      if (!this.options.root && !this.options.resolver) {
        return content;
      }
      return content.replace(this.urlRe, function(match, prefix, rawUrl) {
        if (prefix === undefined) {
          return match;
        }
        var url = _this.cleanUrl(rawUrl);
        var newUrl = _this.options.resolver ? _this.options.resolver(url, filename, _this.options) : undefined;
        if (newUrl === undefined || newUrl === null) {
          newUrl = _this.defaultResolver(url, filename, _this.options);
        } else if (newUrl === false) {
          newUrl = url;
        }
        if (newUrl) {
          _this.resolutions[filename] = _this.resolutions[filename] || {};
          _this.resolutions[filename][url] = newUrl;
        }
        return prefix + 'url("' + newUrl + '")';
      });
    }
  }, {
    key: 'reset',
    value: function reset() {
      this.resolutions = {};
    }
  }, {
    key: 'getResolutions',
    value: function getResolutions() {
      var result = [];
      (0, _entries2.default)(this.resolutions).forEach(function(_ref) {
        var _ref2 = (0, _slicedToArray3.default)(_ref, 2);
        var filename = _ref2[0];
        var urls = _ref2[1];
        (0, _entries2.default)(urls).forEach(function(_ref3) {
          var _ref4 = (0, _slicedToArray3.default)(_ref3, 2);
          var fromUrl = _ref4[0];
          var toUrl = _ref4[1];
          result.push({
            filename: filename,
            fromUrl: fromUrl,
            toUrl: toUrl
          });
        });
      });
      return result;
    }
  }, {
    key: 'getLocalAssetList',
    value: function getLocalAssetList() {
      var _this2 = this;
      var uniqueMap = this.getResolutions().map(function(record) {
        var isDataUrl = record.fromUrl.startsWith('data:');
        var isAbsUrl = !isDataUrl && _this2.isAbsoluteUrl(record.fromUrl);
        if (isAbsUrl || isDataUrl) {
          return false;
        }
        var baseDir = _path2.default.dirname(record.filename);
        var assetPath = _path2.default.join(baseDir, _this2.getAssetPath(record.fromUrl));
        var fromPath = _path2.default.relative(_this2.options.root, assetPath);
        var toPath = _this2.getAssetPath(record.toUrl);
        return {
          fromPath: fromPath,
          toPath: toPath
        };
      }).filter(function(record) {
        return !!record;
      }).reduce(function(result, record) {
        result[record.fromPath] = record;
        return result;
      }, {});
      return (0, _values2.default)(uniqueMap);
    }
  }, {
    key: 'defaultResolver',
    value: function defaultResolver(url, filename, options) {
      var isDataUrl = url.startsWith('data:');
      var isAbsUrl = !isDataUrl && this.isAbsoluteUrl(url);
      if (isAbsUrl || isDataUrl) {
        return url;
      }
      var baseUrl = _path2.default.relative(options.root, _path2.default.dirname(filename));
      var relUrl = _path2.default.join(baseUrl, url);
      return options.publicPath ? options.publicPath + relUrl : relUrl;
    }
  }, {
    key: 'isAbsoluteUrl',
    value: function isAbsoluteUrl(url) {
      return (/^([a-z0-9_]+:)?\/\//i.test(url) || _path2.default.isAbsolute(url));
    }
  }, {
    key: 'cleanUrl',
    value: function cleanUrl(url) {
      var result = url;
      if (url.startsWith('"') && url.endsWith('"') || url.startsWith("'") && url.endsWith("'")) {
        result = result.substr(1, url.length - 2);
      }
      return result.trim();
    }
  }, {
    key: 'getAssetPath',
    value: function getAssetPath(url) {
      return url.replace(/[#?].*$/, '');
    }
  }]);
  return CssUrlRewriter;
}();
exports.default = CssUrlRewriter;
