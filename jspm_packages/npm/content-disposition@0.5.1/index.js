/* */ 
(function(Buffer) {
  'use strict';
  module.exports = contentDisposition;
  module.exports.parse = parse;
  var basename = require('path').basename;
  var encodeUriAttrCharRegExp = /[\x00-\x20"'\(\)*,\/:;<=>?@\[\\\]\{\}\x7f]/g;
  var hexEscapeRegExp = /%[0-9A-Fa-f]{2}/;
  var hexEscapeReplaceRegExp = /%([0-9A-Fa-f]{2})/g;
  var nonLatin1RegExp = /[^\x20-\x7e\xa0-\xff]/g;
  var qescRegExp = /\\([\u0000-\u007f])/g;
  var quoteRegExp = /([\\"])/g;
  var paramRegExp = /; *([!#$%&'\*\+\-\.0-9A-Z\^_`a-z\|~]+) *= *("(?:[ !\x23-\x5b\x5d-\x7e\x80-\xff]|\\[\x20-\x7e])*"|[!#$%&'\*\+\-\.0-9A-Z\^_`a-z\|~]+) */g;
  var textRegExp = /^[\x20-\x7e\x80-\xff]+$/;
  var tokenRegExp = /^[!#$%&'\*\+\-\.0-9A-Z\^_`a-z\|~]+$/;
  var extValueRegExp = /^([A-Za-z0-9!#$%&+\-^_`{}~]+)'(?:[A-Za-z]{2,3}(?:-[A-Za-z]{3}){0,3}|[A-Za-z]{4,8}|)'((?:%[0-9A-Fa-f]{2}|[A-Za-z0-9!#$&+\-\.^_`|~])+)$/;
  var dispositionTypeRegExp = /^([!#$%&'\*\+\-\.0-9A-Z\^_`a-z\|~]+) *(?:$|;)/;
  function contentDisposition(filename, options) {
    var opts = options || {};
    var type = opts.type || 'attachment';
    var params = createparams(filename, opts.fallback);
    return format(new ContentDisposition(type, params));
  }
  function createparams(filename, fallback) {
    if (filename === undefined) {
      return;
    }
    var params = {};
    if (typeof filename !== 'string') {
      throw new TypeError('filename must be a string');
    }
    if (fallback === undefined) {
      fallback = true;
    }
    if (typeof fallback !== 'string' && typeof fallback !== 'boolean') {
      throw new TypeError('fallback must be a string or boolean');
    }
    if (typeof fallback === 'string' && nonLatin1RegExp.test(fallback)) {
      throw new TypeError('fallback must be ISO-8859-1 string');
    }
    var name = basename(filename);
    var isQuotedString = textRegExp.test(name);
    var fallbackName = typeof fallback !== 'string' ? fallback && getlatin1(name) : basename(fallback);
    var hasFallback = typeof fallbackName === 'string' && fallbackName !== name;
    if (hasFallback || !isQuotedString || hexEscapeRegExp.test(name)) {
      params['filename*'] = name;
    }
    if (isQuotedString || hasFallback) {
      params.filename = hasFallback ? fallbackName : name;
    }
    return params;
  }
  function format(obj) {
    var parameters = obj.parameters;
    var type = obj.type;
    if (!type || typeof type !== 'string' || !tokenRegExp.test(type)) {
      throw new TypeError('invalid type');
    }
    var string = String(type).toLowerCase();
    if (parameters && typeof parameters === 'object') {
      var param;
      var params = Object.keys(parameters).sort();
      for (var i = 0; i < params.length; i++) {
        param = params[i];
        var val = param.substr(-1) === '*' ? ustring(parameters[param]) : qstring(parameters[param]);
        string += '; ' + param + '=' + val;
      }
    }
    return string;
  }
  function decodefield(str) {
    var match = extValueRegExp.exec(str);
    if (!match) {
      throw new TypeError('invalid extended field value');
    }
    var charset = match[1].toLowerCase();
    var encoded = match[2];
    var value;
    var binary = encoded.replace(hexEscapeReplaceRegExp, pdecode);
    switch (charset) {
      case 'iso-8859-1':
        value = getlatin1(binary);
        break;
      case 'utf-8':
        value = new Buffer(binary, 'binary').toString('utf8');
        break;
      default:
        throw new TypeError('unsupported charset in extended field');
    }
    return value;
  }
  function getlatin1(val) {
    return String(val).replace(nonLatin1RegExp, '?');
  }
  function parse(string) {
    if (!string || typeof string !== 'string') {
      throw new TypeError('argument string is required');
    }
    var match = dispositionTypeRegExp.exec(string);
    if (!match) {
      throw new TypeError('invalid type format');
    }
    var index = match[0].length;
    var type = match[1].toLowerCase();
    var key;
    var names = [];
    var params = {};
    var value;
    index = paramRegExp.lastIndex = match[0].substr(-1) === ';' ? index - 1 : index;
    while (match = paramRegExp.exec(string)) {
      if (match.index !== index) {
        throw new TypeError('invalid parameter format');
      }
      index += match[0].length;
      key = match[1].toLowerCase();
      value = match[2];
      if (names.indexOf(key) !== -1) {
        throw new TypeError('invalid duplicate parameter');
      }
      names.push(key);
      if (key.indexOf('*') + 1 === key.length) {
        key = key.slice(0, -1);
        value = decodefield(value);
        params[key] = value;
        continue;
      }
      if (typeof params[key] === 'string') {
        continue;
      }
      if (value[0] === '"') {
        value = value.substr(1, value.length - 2).replace(qescRegExp, '$1');
      }
      params[key] = value;
    }
    if (index !== -1 && index !== string.length) {
      throw new TypeError('invalid parameter format');
    }
    return new ContentDisposition(type, params);
  }
  function pdecode(str, hex) {
    return String.fromCharCode(parseInt(hex, 16));
  }
  function pencode(char) {
    var hex = String(char).charCodeAt(0).toString(16).toUpperCase();
    return hex.length === 1 ? '%0' + hex : '%' + hex;
  }
  function qstring(val) {
    var str = String(val);
    return '"' + str.replace(quoteRegExp, '\\$1') + '"';
  }
  function ustring(val) {
    var str = String(val);
    var encoded = encodeURIComponent(str).replace(encodeUriAttrCharRegExp, pencode);
    return 'UTF-8\'\'' + encoded;
  }
  function ContentDisposition(type, parameters) {
    this.type = type;
    this.parameters = parameters;
  }
})(require('buffer').Buffer);
