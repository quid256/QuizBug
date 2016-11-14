/* */ 
'use strict';
var url = require('url');
var parse = url.parse;
var Url = url.Url;
var simplePathRegExp = /^(\/\/?(?!\/)[^\?#\s]*)(\?[^#\s]*)?$/;
module.exports = parseurl;
module.exports.original = originalurl;
function parseurl(req) {
  var url = req.url;
  if (url === undefined) {
    return undefined;
  }
  var parsed = req._parsedUrl;
  if (fresh(url, parsed)) {
    return parsed;
  }
  parsed = fastparse(url);
  parsed._raw = url;
  return req._parsedUrl = parsed;
}
;
function originalurl(req) {
  var url = req.originalUrl;
  if (typeof url !== 'string') {
    return parseurl(req);
  }
  var parsed = req._parsedOriginalUrl;
  if (fresh(url, parsed)) {
    return parsed;
  }
  parsed = fastparse(url);
  parsed._raw = url;
  return req._parsedOriginalUrl = parsed;
}
;
function fastparse(str) {
  var simplePath = typeof str === 'string' && simplePathRegExp.exec(str);
  if (simplePath) {
    var pathname = simplePath[1];
    var search = simplePath[2] || null;
    var url = Url !== undefined ? new Url() : {};
    url.path = str;
    url.href = str;
    url.pathname = pathname;
    url.search = search;
    url.query = search && search.substr(1);
    return url;
  }
  return parse(str);
}
function fresh(url, parsedUrl) {
  return typeof parsedUrl === 'object' && parsedUrl !== null && (Url === undefined || parsedUrl instanceof Url) && parsedUrl._raw === url;
}
