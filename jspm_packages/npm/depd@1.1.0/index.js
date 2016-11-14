/* */ 
(function(process) {
  var callSiteToString = require('./lib/compat/index').callSiteToString;
  var eventListenerCount = require('./lib/compat/index').eventListenerCount;
  var relative = require('path').relative;
  module.exports = depd;
  var basePath = process.cwd();
  function containsNamespace(str, namespace) {
    var val = str.split(/[ ,]+/);
    namespace = String(namespace).toLowerCase();
    for (var i = 0; i < val.length; i++) {
      if (!(str = val[i]))
        continue;
      if (str === '*' || str.toLowerCase() === namespace) {
        return true;
      }
    }
    return false;
  }
  function convertDataDescriptorToAccessor(obj, prop, message) {
    var descriptor = Object.getOwnPropertyDescriptor(obj, prop);
    var value = descriptor.value;
    descriptor.get = function getter() {
      return value;
    };
    if (descriptor.writable) {
      descriptor.set = function setter(val) {
        return value = val;
      };
    }
    delete descriptor.value;
    delete descriptor.writable;
    Object.defineProperty(obj, prop, descriptor);
    return descriptor;
  }
  function createArgumentsString(arity) {
    var str = '';
    for (var i = 0; i < arity; i++) {
      str += ', arg' + i;
    }
    return str.substr(2);
  }
  function createStackString(stack) {
    var str = this.name + ': ' + this.namespace;
    if (this.message) {
      str += ' deprecated ' + this.message;
    }
    for (var i = 0; i < stack.length; i++) {
      str += '\n    at ' + callSiteToString(stack[i]);
    }
    return str;
  }
  function depd(namespace) {
    if (!namespace) {
      throw new TypeError('argument namespace is required');
    }
    var stack = getStack();
    var site = callSiteLocation(stack[1]);
    var file = site[0];
    function deprecate(message) {
      log.call(deprecate, message);
    }
    deprecate._file = file;
    deprecate._ignored = isignored(namespace);
    deprecate._namespace = namespace;
    deprecate._traced = istraced(namespace);
    deprecate._warned = Object.create(null);
    deprecate.function = wrapfunction;
    deprecate.property = wrapproperty;
    return deprecate;
  }
  function isignored(namespace) {
    if (process.noDeprecation) {
      return true;
    }
    var str = process.env.NO_DEPRECATION || '';
    return containsNamespace(str, namespace);
  }
  function istraced(namespace) {
    if (process.traceDeprecation) {
      return true;
    }
    var str = process.env.TRACE_DEPRECATION || '';
    return containsNamespace(str, namespace);
  }
  function log(message, site) {
    var haslisteners = eventListenerCount(process, 'deprecation') !== 0;
    if (!haslisteners && this._ignored) {
      return;
    }
    var caller;
    var callFile;
    var callSite;
    var i = 0;
    var seen = false;
    var stack = getStack();
    var file = this._file;
    if (site) {
      callSite = callSiteLocation(stack[1]);
      callSite.name = site.name;
      file = callSite[0];
    } else {
      i = 2;
      site = callSiteLocation(stack[i]);
      callSite = site;
    }
    for (; i < stack.length; i++) {
      caller = callSiteLocation(stack[i]);
      callFile = caller[0];
      if (callFile === file) {
        seen = true;
      } else if (callFile === this._file) {
        file = this._file;
      } else if (seen) {
        break;
      }
    }
    var key = caller ? site.join(':') + '__' + caller.join(':') : undefined;
    if (key !== undefined && key in this._warned) {
      return;
    }
    this._warned[key] = true;
    if (!message) {
      message = callSite === site || !callSite.name ? defaultMessage(site) : defaultMessage(callSite);
    }
    if (haslisteners) {
      var err = DeprecationError(this._namespace, message, stack.slice(i));
      process.emit('deprecation', err);
      return;
    }
    var format = process.stderr.isTTY ? formatColor : formatPlain;
    var msg = format.call(this, message, caller, stack.slice(i));
    process.stderr.write(msg + '\n', 'utf8');
    return;
  }
  function callSiteLocation(callSite) {
    var file = callSite.getFileName() || '<anonymous>';
    var line = callSite.getLineNumber();
    var colm = callSite.getColumnNumber();
    if (callSite.isEval()) {
      file = callSite.getEvalOrigin() + ', ' + file;
    }
    var site = [file, line, colm];
    site.callSite = callSite;
    site.name = callSite.getFunctionName();
    return site;
  }
  function defaultMessage(site) {
    var callSite = site.callSite;
    var funcName = site.name;
    if (!funcName) {
      funcName = '<anonymous@' + formatLocation(site) + '>';
    }
    var context = callSite.getThis();
    var typeName = context && callSite.getTypeName();
    if (typeName === 'Object') {
      typeName = undefined;
    }
    if (typeName === 'Function') {
      typeName = context.name || typeName;
    }
    return typeName && callSite.getMethodName() ? typeName + '.' + funcName : funcName;
  }
  function formatPlain(msg, caller, stack) {
    var timestamp = new Date().toUTCString();
    var formatted = timestamp + ' ' + this._namespace + ' deprecated ' + msg;
    if (this._traced) {
      for (var i = 0; i < stack.length; i++) {
        formatted += '\n    at ' + callSiteToString(stack[i]);
      }
      return formatted;
    }
    if (caller) {
      formatted += ' at ' + formatLocation(caller);
    }
    return formatted;
  }
  function formatColor(msg, caller, stack) {
    var formatted = '\x1b[36;1m' + this._namespace + '\x1b[22;39m' + ' \x1b[33;1mdeprecated\x1b[22;39m' + ' \x1b[0m' + msg + '\x1b[39m';
    if (this._traced) {
      for (var i = 0; i < stack.length; i++) {
        formatted += '\n    \x1b[36mat ' + callSiteToString(stack[i]) + '\x1b[39m';
      }
      return formatted;
    }
    if (caller) {
      formatted += ' \x1b[36m' + formatLocation(caller) + '\x1b[39m';
    }
    return formatted;
  }
  function formatLocation(callSite) {
    return relative(basePath, callSite[0]) + ':' + callSite[1] + ':' + callSite[2];
  }
  function getStack() {
    var limit = Error.stackTraceLimit;
    var obj = {};
    var prep = Error.prepareStackTrace;
    Error.prepareStackTrace = prepareObjectStackTrace;
    Error.stackTraceLimit = Math.max(10, limit);
    Error.captureStackTrace(obj);
    var stack = obj.stack.slice(1);
    Error.prepareStackTrace = prep;
    Error.stackTraceLimit = limit;
    return stack;
  }
  function prepareObjectStackTrace(obj, stack) {
    return stack;
  }
  function wrapfunction(fn, message) {
    if (typeof fn !== 'function') {
      throw new TypeError('argument fn must be a function');
    }
    var args = createArgumentsString(fn.length);
    var deprecate = this;
    var stack = getStack();
    var site = callSiteLocation(stack[1]);
    site.name = fn.name;
    var deprecatedfn = eval('(function (' + args + ') {\n' + '"use strict"\n' + 'log.call(deprecate, message, site)\n' + 'return fn.apply(this, arguments)\n' + '})');
    return deprecatedfn;
  }
  function wrapproperty(obj, prop, message) {
    if (!obj || (typeof obj !== 'object' && typeof obj !== 'function')) {
      throw new TypeError('argument obj must be object');
    }
    var descriptor = Object.getOwnPropertyDescriptor(obj, prop);
    if (!descriptor) {
      throw new TypeError('must call property on owner object');
    }
    if (!descriptor.configurable) {
      throw new TypeError('property must be configurable');
    }
    var deprecate = this;
    var stack = getStack();
    var site = callSiteLocation(stack[1]);
    site.name = prop;
    if ('value' in descriptor) {
      descriptor = convertDataDescriptorToAccessor(obj, prop, message);
    }
    var get = descriptor.get;
    var set = descriptor.set;
    if (typeof get === 'function') {
      descriptor.get = function getter() {
        log.call(deprecate, message, site);
        return get.apply(this, arguments);
      };
    }
    if (typeof set === 'function') {
      descriptor.set = function setter() {
        log.call(deprecate, message, site);
        return set.apply(this, arguments);
      };
    }
    Object.defineProperty(obj, prop, descriptor);
  }
  function DeprecationError(namespace, message, stack) {
    var error = new Error();
    var stackString;
    Object.defineProperty(error, 'constructor', {value: DeprecationError});
    Object.defineProperty(error, 'message', {
      configurable: true,
      enumerable: false,
      value: message,
      writable: true
    });
    Object.defineProperty(error, 'name', {
      enumerable: false,
      configurable: true,
      value: 'DeprecationError',
      writable: true
    });
    Object.defineProperty(error, 'namespace', {
      configurable: true,
      enumerable: false,
      value: namespace,
      writable: true
    });
    Object.defineProperty(error, 'stack', {
      configurable: true,
      enumerable: false,
      get: function() {
        if (stackString !== undefined) {
          return stackString;
        }
        return stackString = createStackString.call(this, stack);
      },
      set: function setter(val) {
        stackString = val;
      }
    });
    return error;
  }
})(require('process'));
