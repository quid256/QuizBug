/* */ 
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var CssUrlRewriter = function () {
  /* eslint-enable */

  /**
   * Constructor.
   *
   * @param {Object}    options
   * @prop  {String}    root
   * @prop  {Function}  function resolver(url, filename, options)
   *                    - return false to skip resolving
   *                    - return undefined or null to use default resolver
   *                    - return resolved url to use it
   */
  function CssUrlRewriter(options) {
    _classCallCheck(this, CssUrlRewriter);

    this.urlRe = /\/\*[\s\S]*?\*\/|\/\/[^\r\n]*(?:\r\n|\r|\n|$)|([\s,:])url\(\s*("[^"]+"|'[^']+'|[^)]+)\s*\)/ig;

    this.options = Object.assign({ root: '.' }, options);
    this.reset();
  }

  /**
   * Rewrite all URLs in source file.
   *
   * @param   {String}  filename
   * @param   {String}  originalContent
   *
   * @returns {String}  fixedContent
   */

  /* eslint-disable */


  _createClass(CssUrlRewriter, [{
    key: 'rewrite',
    value: function rewrite(filename, content) {
      var _this = this;

      if (!this.options.root && !this.options.resolver) {
        return content;
      }

      return content.replace(this.urlRe, function (match, prefix, rawUrl) {
        if (prefix === undefined) {
          // looks like block/line comment is found, so bypass it
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

    /**
     * Clear internal state.
     */

  }, {
    key: 'reset',
    value: function reset() {
      this.resolutions = {};
    }

    /**
     * Get list of all resolved URLs for all files.
     *
     * @returns {Array[{ filename, fromUrl, toUrl }]}
     */

  }, {
    key: 'getResolutions',
    value: function getResolutions() {
      var result = [];

      Object.entries(this.resolutions).forEach(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 2);

        var filename = _ref2[0];
        var urls = _ref2[1];

        Object.entries(urls).forEach(function (_ref3) {
          var _ref4 = _slicedToArray(_ref3, 2);

          var fromUrl = _ref4[0];
          var toUrl = _ref4[1];

          result.push({ filename: filename, fromUrl: fromUrl, toUrl: toUrl });
        });
      });

      return result;
    }

    /**
     * Get list of unique assets used in during resolving.
     *
     * @returns {Array[{ fromPath, toPath }]}
     */

  }, {
    key: 'getLocalAssetList',
    value: function getLocalAssetList() {
      var _this2 = this;

      var uniqueMap = this.getResolutions().map(function (record) {
        var isDataUrl = record.fromUrl.startsWith('data:');
        var isAbsUrl = !isDataUrl && _this2.isAbsoluteUrl(record.fromUrl);

        if (isAbsUrl || isDataUrl) {
          return false;
        }

        var baseDir = _path2.default.dirname(record.filename);
        var assetPath = _path2.default.join(baseDir, _this2.getAssetPath(record.fromUrl));

        var fromPath = _path2.default.relative(_this2.options.root, assetPath);
        var toPath = _this2.getAssetPath(record.toUrl);

        return { fromPath: fromPath, toPath: toPath };
      }).filter(function (record) {
        return !!record;
      }).reduce(function (result, record) {
        result[record.fromPath] = record; // eslint-disable-line no-param-reassign
        return result;
      }, {});

      return Object.values(uniqueMap);
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

      return _path2.default.join(baseUrl, url);
    }
  }, {
    key: 'isAbsoluteUrl',
    value: function isAbsoluteUrl(url) {
      return (/^([a-z0-9_]+:)?\/\//i.test(url) || _path2.default.isAbsolute(url)
      );
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
//# sourceMappingURL=CssUrlRewriter.js.map