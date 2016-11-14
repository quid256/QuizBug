/* */ 
(function(Buffer, process) {
  'use strict';
  var debug = require('debug')('finalhandler');
  var escapeHtml = require('escape-html');
  var onFinished = require('on-finished');
  var statuses = require('statuses');
  var unpipe = require('unpipe');
  var defer = typeof setImmediate === 'function' ? setImmediate : function(fn) {
    process.nextTick(fn.bind.apply(fn, arguments));
  };
  var isFinished = onFinished.isFinished;
  module.exports = finalhandler;
  function finalhandler(req, res, options) {
    var opts = options || {};
    var env = opts.env || process.env.NODE_ENV || 'development';
    var onerror = opts.onerror;
    return function(err) {
      var headers = Object.create(null);
      var status;
      if (!err && res._header) {
        debug('cannot 404 after headers sent');
        return;
      }
      if (err) {
        status = getErrorStatusCode(err) || res.statusCode;
        if (typeof status !== 'number' || status < 400 || status > 599) {
          status = 500;
        }
        if (err.headers && (err.status === status || err.statusCode === status)) {
          var keys = Object.keys(err.headers);
          for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            headers[key] = err.headers[key];
          }
        }
        var msg = env === 'production' ? statuses[status] : err.stack || err.toString();
        msg = escapeHtml(msg).replace(/\n/g, '<br>').replace(/\x20{2}/g, ' &nbsp;') + '\n';
      } else {
        status = 404;
        msg = 'Cannot ' + escapeHtml(req.method) + ' ' + escapeHtml(req.originalUrl || req.url) + '\n';
      }
      debug('default %s', status);
      if (err && onerror) {
        defer(onerror, err, req, res);
      }
      if (res._header) {
        debug('cannot %d after headers sent', status);
        req.socket.destroy();
        return;
      }
      send(req, res, status, headers, msg);
    };
  }
  function getErrorStatusCode(err) {
    if (typeof err.status === 'number' && err.status >= 400 && err.status < 600) {
      return err.status;
    }
    if (typeof err.statusCode === 'number' && err.statusCode >= 400 && err.statusCode < 600) {
      return err.statusCode;
    }
    return undefined;
  }
  function send(req, res, status, headers, body) {
    function write() {
      res.statusCode = status;
      res.statusMessage = statuses[status];
      var keys = Object.keys(headers);
      for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        res.setHeader(key, headers[key]);
      }
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Content-Length', Buffer.byteLength(body, 'utf8'));
      if (req.method === 'HEAD') {
        res.end();
        return;
      }
      res.end(body, 'utf8');
    }
    if (isFinished(req)) {
      write();
      return;
    }
    unpipe(req);
    onFinished(req, write);
    req.resume();
  }
})(require('buffer').Buffer, require('process'));
