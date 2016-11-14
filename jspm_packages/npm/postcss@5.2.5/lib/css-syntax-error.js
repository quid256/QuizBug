/* */ 
(function(process) {
  'use strict';
  exports.__esModule = true;
  var _createClass = function() {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor)
          descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }
    return function(Constructor, protoProps, staticProps) {
      if (protoProps)
        defineProperties(Constructor.prototype, protoProps);
      if (staticProps)
        defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();
  var _supportsColor = require('supports-color');
  var _supportsColor2 = _interopRequireDefault(_supportsColor);
  var _chalk = require('chalk');
  var _chalk2 = _interopRequireDefault(_chalk);
  var _terminalHighlight = require('./terminal-highlight');
  var _terminalHighlight2 = _interopRequireDefault(_terminalHighlight);
  var _warnOnce = require('./warn-once');
  var _warnOnce2 = _interopRequireDefault(_warnOnce);
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {default: obj};
  }
  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }
  var CssSyntaxError = function() {
    function CssSyntaxError(message, line, column, source, file, plugin) {
      _classCallCheck(this, CssSyntaxError);
      this.name = 'CssSyntaxError';
      this.reason = message;
      if (file) {
        this.file = file;
      }
      if (source) {
        this.source = source;
      }
      if (plugin) {
        this.plugin = plugin;
      }
      if (typeof line !== 'undefined' && typeof column !== 'undefined') {
        this.line = line;
        this.column = column;
      }
      this.setMessage();
      if (Error.captureStackTrace) {
        Error.captureStackTrace(this, CssSyntaxError);
      }
    }
    CssSyntaxError.prototype.setMessage = function setMessage() {
      this.message = this.plugin ? this.plugin + ': ' : '';
      this.message += this.file ? this.file : '<css input>';
      if (typeof this.line !== 'undefined') {
        this.message += ':' + this.line + ':' + this.column;
      }
      this.message += ': ' + this.reason;
    };
    CssSyntaxError.prototype.showSourceCode = function showSourceCode(color) {
      var _this = this;
      if (!this.source)
        return '';
      var css = this.source;
      if (typeof color === 'undefined')
        color = _supportsColor2.default;
      if (color)
        css = (0, _terminalHighlight2.default)(css);
      var lines = css.split(/\r?\n/);
      var start = Math.max(this.line - 3, 0);
      var end = Math.min(this.line + 2, lines.length);
      var maxWidth = String(end).length;
      var colors = new _chalk2.default.constructor({enabled: true});
      function mark(text) {
        if (color) {
          return colors.red.bold(text);
        } else {
          return text;
        }
      }
      function aside(text) {
        if (color) {
          return colors.gray(text);
        } else {
          return text;
        }
      }
      return lines.slice(start, end).map(function(line, index) {
        var number = start + 1 + index;
        var gutter = ' ' + (' ' + number).slice(-maxWidth) + ' | ';
        if (number === _this.line) {
          var spacing = aside(gutter.replace(/\d/g, ' ')) + line.slice(0, _this.column - 1).replace(/[^\t]/g, ' ');
          return mark('>') + aside(gutter) + line + '\n ' + spacing + mark('^');
        } else {
          return ' ' + aside(gutter) + line;
        }
      }).join('\n');
    };
    CssSyntaxError.prototype.toString = function toString() {
      var code = this.showSourceCode();
      if (code) {
        code = '\n\n' + code + '\n';
      }
      return this.name + ': ' + this.message + code;
    };
    _createClass(CssSyntaxError, [{
      key: 'generated',
      get: function get() {
        (0, _warnOnce2.default)('CssSyntaxError#generated is depreacted. Use input instead.');
        return this.input;
      }
    }]);
    return CssSyntaxError;
  }();
  exports.default = CssSyntaxError;
  module.exports = exports['default'];
})(require('process'));
