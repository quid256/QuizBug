/* */ 
(function(process) {
  var path = require('path');
  var fs = require('fs');
  function Mime() {
    this.types = Object.create(null);
    this.extensions = Object.create(null);
  }
  Mime.prototype.define = function(map) {
    for (var type in map) {
      var exts = map[type];
      for (var i = 0; i < exts.length; i++) {
        if (process.env.DEBUG_MIME && this.types[exts]) {
          console.warn(this._loading.replace(/.*\//, ''), 'changes "' + exts[i] + '" extension type from ' + this.types[exts] + ' to ' + type);
        }
        this.types[exts[i]] = type;
      }
      if (!this.extensions[type]) {
        this.extensions[type] = exts[0];
      }
    }
  };
  Mime.prototype.load = function(file) {
    this._loading = file;
    var map = {},
        content = fs.readFileSync(file, 'ascii'),
        lines = content.split(/[\r\n]+/);
    lines.forEach(function(line) {
      var fields = line.replace(/\s*#.*|^\s*|\s*$/g, '').split(/\s+/);
      map[fields.shift()] = fields;
    });
    this.define(map);
    this._loading = null;
  };
  Mime.prototype.lookup = function(path, fallback) {
    var ext = path.replace(/.*[\.\/\\]/, '').toLowerCase();
    return this.types[ext] || fallback || this.default_type;
  };
  Mime.prototype.extension = function(mimeType) {
    var type = mimeType.match(/^\s*([^;\s]*)(?:;|\s|$)/)[1].toLowerCase();
    return this.extensions[type];
  };
  var mime = new Mime();
  mime.define(require('./types.json!systemjs-json'));
  mime.default_type = mime.lookup('bin');
  mime.Mime = Mime;
  mime.charsets = {lookup: function(mimeType, fallback) {
      return (/^text\//).test(mimeType) ? 'UTF-8' : fallback;
    }};
  module.exports = mime;
})(require('process'));
