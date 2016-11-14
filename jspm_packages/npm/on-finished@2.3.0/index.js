/* */ 
(function(process) {
  'use strict';
  module.exports = onFinished;
  module.exports.isFinished = isFinished;
  var first = require('ee-first');
  var defer = typeof setImmediate === 'function' ? setImmediate : function(fn) {
    process.nextTick(fn.bind.apply(fn, arguments));
  };
  function onFinished(msg, listener) {
    if (isFinished(msg) !== false) {
      defer(listener, null, msg);
      return msg;
    }
    attachListener(msg, listener);
    return msg;
  }
  function isFinished(msg) {
    var socket = msg.socket;
    if (typeof msg.finished === 'boolean') {
      return Boolean(msg.finished || (socket && !socket.writable));
    }
    if (typeof msg.complete === 'boolean') {
      return Boolean(msg.upgrade || !socket || !socket.readable || (msg.complete && !msg.readable));
    }
    return undefined;
  }
  function attachFinishedListener(msg, callback) {
    var eeMsg;
    var eeSocket;
    var finished = false;
    function onFinish(error) {
      eeMsg.cancel();
      eeSocket.cancel();
      finished = true;
      callback(error);
    }
    eeMsg = eeSocket = first([[msg, 'end', 'finish']], onFinish);
    function onSocket(socket) {
      msg.removeListener('socket', onSocket);
      if (finished)
        return;
      if (eeMsg !== eeSocket)
        return;
      eeSocket = first([[socket, 'error', 'close']], onFinish);
    }
    if (msg.socket) {
      onSocket(msg.socket);
      return;
    }
    msg.on('socket', onSocket);
    if (msg.socket === undefined) {
      patchAssignSocket(msg, onSocket);
    }
  }
  function attachListener(msg, listener) {
    var attached = msg.__onFinished;
    if (!attached || !attached.queue) {
      attached = msg.__onFinished = createListener(msg);
      attachFinishedListener(msg, attached);
    }
    attached.queue.push(listener);
  }
  function createListener(msg) {
    function listener(err) {
      if (msg.__onFinished === listener)
        msg.__onFinished = null;
      if (!listener.queue)
        return;
      var queue = listener.queue;
      listener.queue = null;
      for (var i = 0; i < queue.length; i++) {
        queue[i](err, msg);
      }
    }
    listener.queue = [];
    return listener;
  }
  function patchAssignSocket(res, callback) {
    var assignSocket = res.assignSocket;
    if (typeof assignSocket !== 'function')
      return;
    res.assignSocket = function _assignSocket(socket) {
      assignSocket.call(this, socket);
      callback(socket);
    };
  }
})(require('process'));
