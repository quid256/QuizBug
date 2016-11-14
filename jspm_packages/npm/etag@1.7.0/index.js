/* */ 
(function(Buffer) {
  'use strict';
  module.exports = etag;
  var crypto = require('crypto');
  var Stats = require('fs').Stats;
  var base64PadCharRegExp = /=+$/;
  var toString = Object.prototype.toString;
  function entitytag(entity) {
    if (entity.length === 0) {
      return '"0-1B2M2Y8AsgTpgAmY7PhCfg"';
    }
    var hash = crypto.createHash('md5').update(entity, 'utf8').digest('base64').replace(base64PadCharRegExp, '');
    var len = typeof entity === 'string' ? Buffer.byteLength(entity, 'utf8') : entity.length;
    return '"' + len.toString(16) + '-' + hash + '"';
  }
  function etag(entity, options) {
    if (entity == null) {
      throw new TypeError('argument entity is required');
    }
    var isStats = isstats(entity);
    var weak = options && typeof options.weak === 'boolean' ? options.weak : isStats;
    if (!isStats && typeof entity !== 'string' && !Buffer.isBuffer(entity)) {
      throw new TypeError('argument entity must be string, Buffer, or fs.Stats');
    }
    var tag = isStats ? stattag(entity) : entitytag(entity);
    return weak ? 'W/' + tag : tag;
  }
  function isstats(obj) {
    if (typeof Stats === 'function' && obj instanceof Stats) {
      return true;
    }
    return obj && typeof obj === 'object' && 'ctime' in obj && toString.call(obj.ctime) === '[object Date]' && 'mtime' in obj && toString.call(obj.mtime) === '[object Date]' && 'ino' in obj && typeof obj.ino === 'number' && 'size' in obj && typeof obj.size === 'number';
  }
  function stattag(stat) {
    var mtime = stat.mtime.getTime().toString(16);
    var size = stat.size.toString(16);
    return '"' + size + '-' + mtime + '"';
  }
})(require('buffer').Buffer);
