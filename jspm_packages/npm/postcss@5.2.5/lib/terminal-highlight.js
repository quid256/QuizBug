/* */ 
'use strict';
exports.__esModule = true;
var _chalk = require('chalk');
var _chalk2 = _interopRequireDefault(_chalk);
var _tokenize = require('./tokenize');
var _tokenize2 = _interopRequireDefault(_tokenize);
var _input = require('./input');
var _input2 = _interopRequireDefault(_input);
function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {default: obj};
}
var colors = new _chalk2.default.constructor({enabled: true});
var HIGHLIGHT_THEME = {
  'brackets': colors.cyan,
  'at-word': colors.cyan,
  'call': colors.cyan,
  'comment': colors.gray,
  'string': colors.green,
  'class': colors.yellow,
  'hash': colors.magenta,
  '(': colors.cyan,
  ')': colors.cyan,
  '{': colors.yellow,
  '}': colors.yellow,
  '[': colors.yellow,
  ']': colors.yellow,
  ':': colors.yellow,
  ';': colors.yellow
};
function getTokenType(_ref, index, tokens) {
  var type = _ref[0];
  var value = _ref[1];
  if (type === 'word') {
    if (value[0] === '.') {
      return 'class';
    }
    if (value[0] === '#') {
      return 'hash';
    }
  }
  var nextToken = tokens[index + 1];
  if (nextToken && (nextToken[0] === 'brackets' || nextToken[0] === '(')) {
    return 'call';
  }
  return type;
}
function terminalHighlight(css) {
  var tokens = (0, _tokenize2.default)(new _input2.default(css), {ignoreErrors: true});
  return tokens.map(function(token, index) {
    var color = HIGHLIGHT_THEME[getTokenType(token, index, tokens)];
    if (color) {
      return token[1].split(/\r?\n/).map(function(i) {
        return color(i);
      }).join('\n');
    } else {
      return token[1];
    }
  }).join('');
}
exports.default = terminalHighlight;
module.exports = exports['default'];
