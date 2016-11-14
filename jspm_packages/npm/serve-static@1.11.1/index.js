/* */ 
(function(Buffer) {
  'use strict';
  var encodeUrl = require('encodeurl');
  var escapeHtml = require('escape-html');
  var parseUrl = require('parseurl');
  var resolve = require('path').resolve;
  var send = require('send');
  var url = require('url');
  module.exports = serveStatic;
  module.exports.mime = send.mime;
  function serveStatic(root, options) {
    if (!root) {
      throw new TypeError('root path required');
    }
    if (typeof root !== 'string') {
      throw new TypeError('root path must be a string');
    }
    var opts = Object.create(options || null);
    var fallthrough = opts.fallthrough !== false;
    var redirect = opts.redirect !== false;
    var setHeaders = opts.setHeaders;
    if (setHeaders && typeof setHeaders !== 'function') {
      throw new TypeError('option setHeaders must be function');
    }
    opts.maxage = opts.maxage || opts.maxAge || 0;
    opts.root = resolve(root);
    var onDirectory = redirect ? createRedirectDirectoryListener() : createNotFoundDirectoryListener();
    return function serveStatic(req, res, next) {
      if (req.method !== 'GET' && req.method !== 'HEAD') {
        if (fallthrough) {
          return next();
        }
        res.statusCode = 405;
        res.setHeader('Allow', 'GET, HEAD');
        res.setHeader('Content-Length', '0');
        res.end();
        return;
      }
      var forwardError = !fallthrough;
      var originalUrl = parseUrl.original(req);
      var path = parseUrl(req).pathname;
      if (path === '/' && originalUrl.pathname.substr(-1) !== '/') {
        path = '';
      }
      var stream = send(req, path, opts);
      stream.on('directory', onDirectory);
      if (setHeaders) {
        stream.on('headers', setHeaders);
      }
      if (fallthrough) {
        stream.on('file', function onFile() {
          forwardError = true;
        });
      }
      stream.on('error', function error(err) {
        if (forwardError || !(err.statusCode < 500)) {
          next(err);
          return;
        }
        next();
      });
      stream.pipe(res);
    };
  }
  function collapseLeadingSlashes(str) {
    for (var i = 0; i < str.length; i++) {
      if (str[i] !== '/') {
        break;
      }
    }
    return i > 1 ? '/' + str.substr(i) : str;
  }
  function createNotFoundDirectoryListener() {
    return function notFound() {
      this.error(404);
    };
  }
  function createRedirectDirectoryListener() {
    return function redirect() {
      if (this.hasTrailingSlash()) {
        this.error(404);
        return;
      }
      var originalUrl = parseUrl.original(this.req);
      originalUrl.path = null;
      originalUrl.pathname = collapseLeadingSlashes(originalUrl.pathname + '/');
      var loc = encodeUrl(url.format(originalUrl));
      var msg = 'Redirecting to <a href="' + escapeHtml(loc) + '">' + escapeHtml(loc) + '</a>\n';
      var res = this.res;
      res.statusCode = 301;
      res.setHeader('Content-Type', 'text/html; charset=UTF-8');
      res.setHeader('Content-Length', Buffer.byteLength(msg));
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Location', loc);
      res.end(msg);
    };
  }
})(require('buffer').Buffer);
