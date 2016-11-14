/* */ 
(function(process) {
  var fs = require('graceful-fs');
  var path = require('path');
  var invalidWin32Path = require('./win32').invalidWin32Path;
  var o777 = parseInt('0777', 8);
  function mkdirs(p, opts, callback, made) {
    if (typeof opts === 'function') {
      callback = opts;
      opts = {};
    } else if (!opts || typeof opts !== 'object') {
      opts = {mode: opts};
    }
    if (process.platform === 'win32' && invalidWin32Path(p)) {
      var errInval = new Error(p + ' contains invalid WIN32 path characters.');
      errInval.code = 'EINVAL';
      return callback(errInval);
    }
    var mode = opts.mode;
    var xfs = opts.fs || fs;
    if (mode === undefined) {
      mode = o777 & (~process.umask());
    }
    if (!made)
      made = null;
    callback = callback || function() {};
    p = path.resolve(p);
    xfs.mkdir(p, mode, function(er) {
      if (!er) {
        made = made || p;
        return callback(null, made);
      }
      switch (er.code) {
        case 'ENOENT':
          if (path.dirname(p) === p)
            return callback(er);
          mkdirs(path.dirname(p), opts, function(er, made) {
            if (er)
              callback(er, made);
            else
              mkdirs(p, opts, callback, made);
          });
          break;
        default:
          xfs.stat(p, function(er2, stat) {
            if (er2 || !stat.isDirectory())
              callback(er, made);
            else
              callback(null, made);
          });
          break;
      }
    });
  }
  module.exports = mkdirs;
})(require('process'));
