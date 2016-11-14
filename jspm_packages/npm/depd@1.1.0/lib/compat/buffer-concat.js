/* */ 
(function(Buffer) {
  'use strict';
  module.exports = bufferConcat;
  function bufferConcat(bufs) {
    var length = 0;
    for (var i = 0,
        len = bufs.length; i < len; i++) {
      length += bufs[i].length;
    }
    var buf = new Buffer(length);
    var pos = 0;
    for (var i = 0,
        len = bufs.length; i < len; i++) {
      bufs[i].copy(buf, pos);
      pos += bufs[i].length;
    }
    return buf;
  }
})(require('buffer').Buffer);
