/* */ 
"format cjs";
(function(Buffer, process) {
  (function(global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) : typeof define === 'function' && define.amd ? define(['exports'], factory) : (factory((global.async = global.async || {})));
  }(this, (function(exports) {
    'use strict';
    function identity(value) {
      return value;
    }
    function apply(func, thisArg, args) {
      switch (args.length) {
        case 0:
          return func.call(thisArg);
        case 1:
          return func.call(thisArg, args[0]);
        case 2:
          return func.call(thisArg, args[0], args[1]);
        case 3:
          return func.call(thisArg, args[0], args[1], args[2]);
      }
      return func.apply(thisArg, args);
    }
    var nativeMax = Math.max;
    function overRest(func, start, transform) {
      start = nativeMax(start === undefined ? (func.length - 1) : start, 0);
      return function() {
        var args = arguments,
            index = -1,
            length = nativeMax(args.length - start, 0),
            array = Array(length);
        while (++index < length) {
          array[index] = args[start + index];
        }
        index = -1;
        var otherArgs = Array(start + 1);
        while (++index < start) {
          otherArgs[index] = args[index];
        }
        otherArgs[start] = transform(array);
        return apply(func, this, otherArgs);
      };
    }
    function constant(value) {
      return function() {
        return value;
      };
    }
    function isObject(value) {
      var type = typeof value;
      return value != null && (type == 'object' || type == 'function');
    }
    var funcTag = '[object Function]';
    var genTag = '[object GeneratorFunction]';
    var proxyTag = '[object Proxy]';
    var objectProto$1 = Object.prototype;
    var objectToString = objectProto$1.toString;
    function isFunction(value) {
      var tag = isObject(value) ? objectToString.call(value) : '';
      return tag == funcTag || tag == genTag || tag == proxyTag;
    }
    var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;
    var freeSelf = typeof self == 'object' && self && self.Object === Object && self;
    var root = freeGlobal || freeSelf || Function('return this')();
    var coreJsData = root['__core-js_shared__'];
    var maskSrcKey = (function() {
      var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || '');
      return uid ? ('Symbol(src)_1.' + uid) : '';
    }());
    function isMasked(func) {
      return !!maskSrcKey && (maskSrcKey in func);
    }
    var funcProto$1 = Function.prototype;
    var funcToString$1 = funcProto$1.toString;
    function toSource(func) {
      if (func != null) {
        try {
          return funcToString$1.call(func);
        } catch (e) {}
        try {
          return (func + '');
        } catch (e) {}
      }
      return '';
    }
    var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;
    var reIsHostCtor = /^\[object .+?Constructor\]$/;
    var funcProto = Function.prototype;
    var objectProto = Object.prototype;
    var funcToString = funcProto.toString;
    var hasOwnProperty = objectProto.hasOwnProperty;
    var reIsNative = RegExp('^' + funcToString.call(hasOwnProperty).replace(reRegExpChar, '\\$&').replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$');
    function baseIsNative(value) {
      if (!isObject(value) || isMasked(value)) {
        return false;
      }
      var pattern = isFunction(value) ? reIsNative : reIsHostCtor;
      return pattern.test(toSource(value));
    }
    function getValue(object, key) {
      return object == null ? undefined : object[key];
    }
    function getNative(object, key) {
      var value = getValue(object, key);
      return baseIsNative(value) ? value : undefined;
    }
    var defineProperty = (function() {
      try {
        var func = getNative(Object, 'defineProperty');
        func({}, '', {});
        return func;
      } catch (e) {}
    }());
    var baseSetToString = !defineProperty ? identity : function(func, string) {
      return defineProperty(func, 'toString', {
        'configurable': true,
        'enumerable': false,
        'value': constant(string),
        'writable': true
      });
    };
    var HOT_COUNT = 500;
    var HOT_SPAN = 16;
    var nativeNow = Date.now;
    function shortOut(func) {
      var count = 0,
          lastCalled = 0;
      return function() {
        var stamp = nativeNow(),
            remaining = HOT_SPAN - (stamp - lastCalled);
        lastCalled = stamp;
        if (remaining > 0) {
          if (++count >= HOT_COUNT) {
            return arguments[0];
          }
        } else {
          count = 0;
        }
        return func.apply(undefined, arguments);
      };
    }
    var setToString = shortOut(baseSetToString);
    function baseRest$1(func, start) {
      return setToString(overRest(func, start, identity), func + '');
    }
    var initialParams = function(fn) {
      return baseRest$1(function(args) {
        var callback = args.pop();
        fn.call(this, args, callback);
      });
    };
    function applyEach$1(eachfn) {
      return baseRest$1(function(fns, args) {
        var go = initialParams(function(args, callback) {
          var that = this;
          return eachfn(fns, function(fn, cb) {
            fn.apply(that, args.concat([cb]));
          }, callback);
        });
        if (args.length) {
          return go.apply(this, args);
        } else {
          return go;
        }
      });
    }
    var MAX_SAFE_INTEGER = 9007199254740991;
    function isLength(value) {
      return typeof value == 'number' && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
    }
    function isArrayLike(value) {
      return value != null && isLength(value.length) && !isFunction(value);
    }
    function noop() {}
    function once(fn) {
      return function() {
        if (fn === null)
          return;
        var callFn = fn;
        fn = null;
        callFn.apply(this, arguments);
      };
    }
    var iteratorSymbol = typeof Symbol === 'function' && Symbol.iterator;
    var getIterator = function(coll) {
      return iteratorSymbol && coll[iteratorSymbol] && coll[iteratorSymbol]();
    };
    function baseTimes(n, iteratee) {
      var index = -1,
          result = Array(n);
      while (++index < n) {
        result[index] = iteratee(index);
      }
      return result;
    }
    function isObjectLike(value) {
      return value != null && typeof value == 'object';
    }
    var argsTag = '[object Arguments]';
    var objectProto$4 = Object.prototype;
    var objectToString$1 = objectProto$4.toString;
    function baseIsArguments(value) {
      return isObjectLike(value) && objectToString$1.call(value) == argsTag;
    }
    var objectProto$3 = Object.prototype;
    var hasOwnProperty$2 = objectProto$3.hasOwnProperty;
    var propertyIsEnumerable = objectProto$3.propertyIsEnumerable;
    var isArguments = baseIsArguments(function() {
      return arguments;
    }()) ? baseIsArguments : function(value) {
      return isObjectLike(value) && hasOwnProperty$2.call(value, 'callee') && !propertyIsEnumerable.call(value, 'callee');
    };
    var isArray = Array.isArray;
    function stubFalse() {
      return false;
    }
    var freeExports = typeof exports == 'object' && exports && !exports.nodeType && exports;
    var freeModule = freeExports && typeof module == 'object' && module && !module.nodeType && module;
    var moduleExports = freeModule && freeModule.exports === freeExports;
    var Buffer = moduleExports ? root.Buffer : undefined;
    var nativeIsBuffer = Buffer ? Buffer.isBuffer : undefined;
    var isBuffer = nativeIsBuffer || stubFalse;
    var MAX_SAFE_INTEGER$1 = 9007199254740991;
    var reIsUint = /^(?:0|[1-9]\d*)$/;
    function isIndex(value, length) {
      length = length == null ? MAX_SAFE_INTEGER$1 : length;
      return !!length && (typeof value == 'number' || reIsUint.test(value)) && (value > -1 && value % 1 == 0 && value < length);
    }
    var argsTag$1 = '[object Arguments]';
    var arrayTag = '[object Array]';
    var boolTag = '[object Boolean]';
    var dateTag = '[object Date]';
    var errorTag = '[object Error]';
    var funcTag$1 = '[object Function]';
    var mapTag = '[object Map]';
    var numberTag = '[object Number]';
    var objectTag = '[object Object]';
    var regexpTag = '[object RegExp]';
    var setTag = '[object Set]';
    var stringTag = '[object String]';
    var weakMapTag = '[object WeakMap]';
    var arrayBufferTag = '[object ArrayBuffer]';
    var dataViewTag = '[object DataView]';
    var float32Tag = '[object Float32Array]';
    var float64Tag = '[object Float64Array]';
    var int8Tag = '[object Int8Array]';
    var int16Tag = '[object Int16Array]';
    var int32Tag = '[object Int32Array]';
    var uint8Tag = '[object Uint8Array]';
    var uint8ClampedTag = '[object Uint8ClampedArray]';
    var uint16Tag = '[object Uint16Array]';
    var uint32Tag = '[object Uint32Array]';
    var typedArrayTags = {};
    typedArrayTags[float32Tag] = typedArrayTags[float64Tag] = typedArrayTags[int8Tag] = typedArrayTags[int16Tag] = typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] = typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] = typedArrayTags[uint32Tag] = true;
    typedArrayTags[argsTag$1] = typedArrayTags[arrayTag] = typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] = typedArrayTags[dataViewTag] = typedArrayTags[dateTag] = typedArrayTags[errorTag] = typedArrayTags[funcTag$1] = typedArrayTags[mapTag] = typedArrayTags[numberTag] = typedArrayTags[objectTag] = typedArrayTags[regexpTag] = typedArrayTags[setTag] = typedArrayTags[stringTag] = typedArrayTags[weakMapTag] = false;
    var objectProto$5 = Object.prototype;
    var objectToString$2 = objectProto$5.toString;
    function baseIsTypedArray(value) {
      return isObjectLike(value) && isLength(value.length) && !!typedArrayTags[objectToString$2.call(value)];
    }
    function baseUnary(func) {
      return function(value) {
        return func(value);
      };
    }
    var freeExports$1 = typeof exports == 'object' && exports && !exports.nodeType && exports;
    var freeModule$1 = freeExports$1 && typeof module == 'object' && module && !module.nodeType && module;
    var moduleExports$1 = freeModule$1 && freeModule$1.exports === freeExports$1;
    var freeProcess = moduleExports$1 && freeGlobal.process;
    var nodeUtil = (function() {
      try {
        return freeProcess && freeProcess.binding('util');
      } catch (e) {}
    }());
    var nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;
    var isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;
    var objectProto$2 = Object.prototype;
    var hasOwnProperty$1 = objectProto$2.hasOwnProperty;
    function arrayLikeKeys(value, inherited) {
      var isArr = isArray(value),
          isArg = !isArr && isArguments(value),
          isBuff = !isArr && !isArg && isBuffer(value),
          isType = !isArr && !isArg && !isBuff && isTypedArray(value),
          skipIndexes = isArr || isArg || isBuff || isType,
          result = skipIndexes ? baseTimes(value.length, String) : [],
          length = result.length;
      for (var key in value) {
        if ((inherited || hasOwnProperty$1.call(value, key)) && !(skipIndexes && (key == 'length' || (isBuff && (key == 'offset' || key == 'parent')) || (isType && (key == 'buffer' || key == 'byteLength' || key == 'byteOffset')) || isIndex(key, length)))) {
          result.push(key);
        }
      }
      return result;
    }
    var objectProto$7 = Object.prototype;
    function isPrototype(value) {
      var Ctor = value && value.constructor,
          proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto$7;
      return value === proto;
    }
    function overArg(func, transform) {
      return function(arg) {
        return func(transform(arg));
      };
    }
    var nativeKeys = overArg(Object.keys, Object);
    var objectProto$6 = Object.prototype;
    var hasOwnProperty$3 = objectProto$6.hasOwnProperty;
    function baseKeys(object) {
      if (!isPrototype(object)) {
        return nativeKeys(object);
      }
      var result = [];
      for (var key in Object(object)) {
        if (hasOwnProperty$3.call(object, key) && key != 'constructor') {
          result.push(key);
        }
      }
      return result;
    }
    function keys(object) {
      return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
    }
    function createArrayIterator(coll) {
      var i = -1;
      var len = coll.length;
      return function next() {
        return ++i < len ? {
          value: coll[i],
          key: i
        } : null;
      };
    }
    function createES2015Iterator(iterator) {
      var i = -1;
      return function next() {
        var item = iterator.next();
        if (item.done)
          return null;
        i++;
        return {
          value: item.value,
          key: i
        };
      };
    }
    function createObjectIterator(obj) {
      var okeys = keys(obj);
      var i = -1;
      var len = okeys.length;
      return function next() {
        var key = okeys[++i];
        return i < len ? {
          value: obj[key],
          key: key
        } : null;
      };
    }
    function iterator(coll) {
      if (isArrayLike(coll)) {
        return createArrayIterator(coll);
      }
      var iterator = getIterator(coll);
      return iterator ? createES2015Iterator(iterator) : createObjectIterator(coll);
    }
    function onlyOnce(fn) {
      return function() {
        if (fn === null)
          throw new Error("Callback was already called.");
        var callFn = fn;
        fn = null;
        callFn.apply(this, arguments);
      };
    }
    var breakLoop = {};
    function _eachOfLimit(limit) {
      return function(obj, iteratee, callback) {
        callback = once(callback || noop);
        if (limit <= 0 || !obj) {
          return callback(null);
        }
        var nextElem = iterator(obj);
        var done = false;
        var running = 0;
        function iterateeCallback(err, value) {
          running -= 1;
          if (err) {
            done = true;
            callback(err);
          } else if (value === breakLoop || done && running <= 0) {
            done = true;
            return callback(null);
          } else {
            replenish();
          }
        }
        function replenish() {
          while (running < limit && !done) {
            var elem = nextElem();
            if (elem === null) {
              done = true;
              if (running <= 0) {
                callback(null);
              }
              return;
            }
            running += 1;
            iteratee(elem.value, elem.key, onlyOnce(iterateeCallback));
          }
        }
        replenish();
      };
    }
    function eachOfLimit(coll, limit, iteratee, callback) {
      _eachOfLimit(limit)(coll, iteratee, callback);
    }
    function doLimit(fn, limit) {
      return function(iterable, iteratee, callback) {
        return fn(iterable, limit, iteratee, callback);
      };
    }
    function eachOfArrayLike(coll, iteratee, callback) {
      callback = once(callback || noop);
      var index = 0,
          completed = 0,
          length = coll.length;
      if (length === 0) {
        callback(null);
      }
      function iteratorCallback(err) {
        if (err) {
          callback(err);
        } else if (++completed === length) {
          callback(null);
        }
      }
      for (; index < length; index++) {
        iteratee(coll[index], index, onlyOnce(iteratorCallback));
      }
    }
    var eachOfGeneric = doLimit(eachOfLimit, Infinity);
    var eachOf = function(coll, iteratee, callback) {
      var eachOfImplementation = isArrayLike(coll) ? eachOfArrayLike : eachOfGeneric;
      eachOfImplementation(coll, iteratee, callback);
    };
    function doParallel(fn) {
      return function(obj, iteratee, callback) {
        return fn(eachOf, obj, iteratee, callback);
      };
    }
    function _asyncMap(eachfn, arr, iteratee, callback) {
      callback = once(callback || noop);
      arr = arr || [];
      var results = [];
      var counter = 0;
      eachfn(arr, function(value, _, callback) {
        var index = counter++;
        iteratee(value, function(err, v) {
          results[index] = v;
          callback(err);
        });
      }, function(err) {
        callback(err, results);
      });
    }
    var map = doParallel(_asyncMap);
    var applyEach = applyEach$1(map);
    function doParallelLimit(fn) {
      return function(obj, limit, iteratee, callback) {
        return fn(_eachOfLimit(limit), obj, iteratee, callback);
      };
    }
    var mapLimit = doParallelLimit(_asyncMap);
    var mapSeries = doLimit(mapLimit, 1);
    var applyEachSeries = applyEach$1(mapSeries);
    var apply$2 = baseRest$1(function(fn, args) {
      return baseRest$1(function(callArgs) {
        return fn.apply(null, args.concat(callArgs));
      });
    });
    function asyncify(func) {
      return initialParams(function(args, callback) {
        var result;
        try {
          result = func.apply(this, args);
        } catch (e) {
          return callback(e);
        }
        if (isObject(result) && typeof result.then === 'function') {
          result.then(function(value) {
            callback(null, value);
          }, function(err) {
            callback(err.message ? err : new Error(err));
          });
        } else {
          callback(null, result);
        }
      });
    }
    function arrayEach(array, iteratee) {
      var index = -1,
          length = array ? array.length : 0;
      while (++index < length) {
        if (iteratee(array[index], index, array) === false) {
          break;
        }
      }
      return array;
    }
    function createBaseFor(fromRight) {
      return function(object, iteratee, keysFunc) {
        var index = -1,
            iterable = Object(object),
            props = keysFunc(object),
            length = props.length;
        while (length--) {
          var key = props[fromRight ? length : ++index];
          if (iteratee(iterable[key], key, iterable) === false) {
            break;
          }
        }
        return object;
      };
    }
    var baseFor = createBaseFor();
    function baseForOwn(object, iteratee) {
      return object && baseFor(object, iteratee, keys);
    }
    function baseFindIndex(array, predicate, fromIndex, fromRight) {
      var length = array.length,
          index = fromIndex + (fromRight ? 1 : -1);
      while ((fromRight ? index-- : ++index < length)) {
        if (predicate(array[index], index, array)) {
          return index;
        }
      }
      return -1;
    }
    function baseIsNaN(value) {
      return value !== value;
    }
    function strictIndexOf(array, value, fromIndex) {
      var index = fromIndex - 1,
          length = array.length;
      while (++index < length) {
        if (array[index] === value) {
          return index;
        }
      }
      return -1;
    }
    function baseIndexOf(array, value, fromIndex) {
      return value === value ? strictIndexOf(array, value, fromIndex) : baseFindIndex(array, baseIsNaN, fromIndex);
    }
    var auto = function(tasks, concurrency, callback) {
      if (typeof concurrency === 'function') {
        callback = concurrency;
        concurrency = null;
      }
      callback = once(callback || noop);
      var keys$$1 = keys(tasks);
      var numTasks = keys$$1.length;
      if (!numTasks) {
        return callback(null);
      }
      if (!concurrency) {
        concurrency = numTasks;
      }
      var results = {};
      var runningTasks = 0;
      var hasError = false;
      var listeners = {};
      var readyTasks = [];
      var readyToCheck = [];
      var uncheckedDependencies = {};
      baseForOwn(tasks, function(task, key) {
        if (!isArray(task)) {
          enqueueTask(key, [task]);
          readyToCheck.push(key);
          return;
        }
        var dependencies = task.slice(0, task.length - 1);
        var remainingDependencies = dependencies.length;
        if (remainingDependencies === 0) {
          enqueueTask(key, task);
          readyToCheck.push(key);
          return;
        }
        uncheckedDependencies[key] = remainingDependencies;
        arrayEach(dependencies, function(dependencyName) {
          if (!tasks[dependencyName]) {
            throw new Error('async.auto task `' + key + '` has a non-existent dependency in ' + dependencies.join(', '));
          }
          addListener(dependencyName, function() {
            remainingDependencies--;
            if (remainingDependencies === 0) {
              enqueueTask(key, task);
            }
          });
        });
      });
      checkForDeadlocks();
      processQueue();
      function enqueueTask(key, task) {
        readyTasks.push(function() {
          runTask(key, task);
        });
      }
      function processQueue() {
        if (readyTasks.length === 0 && runningTasks === 0) {
          return callback(null, results);
        }
        while (readyTasks.length && runningTasks < concurrency) {
          var run = readyTasks.shift();
          run();
        }
      }
      function addListener(taskName, fn) {
        var taskListeners = listeners[taskName];
        if (!taskListeners) {
          taskListeners = listeners[taskName] = [];
        }
        taskListeners.push(fn);
      }
      function taskComplete(taskName) {
        var taskListeners = listeners[taskName] || [];
        arrayEach(taskListeners, function(fn) {
          fn();
        });
        processQueue();
      }
      function runTask(key, task) {
        if (hasError)
          return;
        var taskCallback = onlyOnce(baseRest$1(function(err, args) {
          runningTasks--;
          if (args.length <= 1) {
            args = args[0];
          }
          if (err) {
            var safeResults = {};
            baseForOwn(results, function(val, rkey) {
              safeResults[rkey] = val;
            });
            safeResults[key] = args;
            hasError = true;
            listeners = [];
            callback(err, safeResults);
          } else {
            results[key] = args;
            taskComplete(key);
          }
        }));
        runningTasks++;
        var taskFn = task[task.length - 1];
        if (task.length > 1) {
          taskFn(results, taskCallback);
        } else {
          taskFn(taskCallback);
        }
      }
      function checkForDeadlocks() {
        var currentTask;
        var counter = 0;
        while (readyToCheck.length) {
          currentTask = readyToCheck.pop();
          counter++;
          arrayEach(getDependents(currentTask), function(dependent) {
            if (--uncheckedDependencies[dependent] === 0) {
              readyToCheck.push(dependent);
            }
          });
        }
        if (counter !== numTasks) {
          throw new Error('async.auto cannot execute tasks due to a recursive dependency');
        }
      }
      function getDependents(taskName) {
        var result = [];
        baseForOwn(tasks, function(task, key) {
          if (isArray(task) && baseIndexOf(task, taskName, 0) >= 0) {
            result.push(key);
          }
        });
        return result;
      }
    };
    function arrayMap(array, iteratee) {
      var index = -1,
          length = array ? array.length : 0,
          result = Array(length);
      while (++index < length) {
        result[index] = iteratee(array[index], index, array);
      }
      return result;
    }
    function copyArray(source, array) {
      var index = -1,
          length = source.length;
      array || (array = Array(length));
      while (++index < length) {
        array[index] = source[index];
      }
      return array;
    }
    var Symbol$1 = root.Symbol;
    var symbolTag = '[object Symbol]';
    var objectProto$8 = Object.prototype;
    var objectToString$3 = objectProto$8.toString;
    function isSymbol(value) {
      return typeof value == 'symbol' || (isObjectLike(value) && objectToString$3.call(value) == symbolTag);
    }
    var INFINITY = 1 / 0;
    var symbolProto = Symbol$1 ? Symbol$1.prototype : undefined;
    var symbolToString = symbolProto ? symbolProto.toString : undefined;
    function baseToString(value) {
      if (typeof value == 'string') {
        return value;
      }
      if (isArray(value)) {
        return arrayMap(value, baseToString) + '';
      }
      if (isSymbol(value)) {
        return symbolToString ? symbolToString.call(value) : '';
      }
      var result = (value + '');
      return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result;
    }
    function baseSlice(array, start, end) {
      var index = -1,
          length = array.length;
      if (start < 0) {
        start = -start > length ? 0 : (length + start);
      }
      end = end > length ? length : end;
      if (end < 0) {
        end += length;
      }
      length = start > end ? 0 : ((end - start) >>> 0);
      start >>>= 0;
      var result = Array(length);
      while (++index < length) {
        result[index] = array[index + start];
      }
      return result;
    }
    function castSlice(array, start, end) {
      var length = array.length;
      end = end === undefined ? length : end;
      return (!start && end >= length) ? array : baseSlice(array, start, end);
    }
    function charsEndIndex(strSymbols, chrSymbols) {
      var index = strSymbols.length;
      while (index-- && baseIndexOf(chrSymbols, strSymbols[index], 0) > -1) {}
      return index;
    }
    function charsStartIndex(strSymbols, chrSymbols) {
      var index = -1,
          length = strSymbols.length;
      while (++index < length && baseIndexOf(chrSymbols, strSymbols[index], 0) > -1) {}
      return index;
    }
    function asciiToArray(string) {
      return string.split('');
    }
    var rsAstralRange = '\\ud800-\\udfff';
    var rsComboMarksRange = '\\u0300-\\u036f\\ufe20-\\ufe23';
    var rsComboSymbolsRange = '\\u20d0-\\u20f0';
    var rsVarRange = '\\ufe0e\\ufe0f';
    var rsZWJ = '\\u200d';
    var reHasUnicode = RegExp('[' + rsZWJ + rsAstralRange + rsComboMarksRange + rsComboSymbolsRange + rsVarRange + ']');
    function hasUnicode(string) {
      return reHasUnicode.test(string);
    }
    var rsAstralRange$1 = '\\ud800-\\udfff';
    var rsComboMarksRange$1 = '\\u0300-\\u036f\\ufe20-\\ufe23';
    var rsComboSymbolsRange$1 = '\\u20d0-\\u20f0';
    var rsVarRange$1 = '\\ufe0e\\ufe0f';
    var rsAstral = '[' + rsAstralRange$1 + ']';
    var rsCombo = '[' + rsComboMarksRange$1 + rsComboSymbolsRange$1 + ']';
    var rsFitz = '\\ud83c[\\udffb-\\udfff]';
    var rsModifier = '(?:' + rsCombo + '|' + rsFitz + ')';
    var rsNonAstral = '[^' + rsAstralRange$1 + ']';
    var rsRegional = '(?:\\ud83c[\\udde6-\\uddff]){2}';
    var rsSurrPair = '[\\ud800-\\udbff][\\udc00-\\udfff]';
    var rsZWJ$1 = '\\u200d';
    var reOptMod = rsModifier + '?';
    var rsOptVar = '[' + rsVarRange$1 + ']?';
    var rsOptJoin = '(?:' + rsZWJ$1 + '(?:' + [rsNonAstral, rsRegional, rsSurrPair].join('|') + ')' + rsOptVar + reOptMod + ')*';
    var rsSeq = rsOptVar + reOptMod + rsOptJoin;
    var rsSymbol = '(?:' + [rsNonAstral + rsCombo + '?', rsCombo, rsRegional, rsSurrPair, rsAstral].join('|') + ')';
    var reUnicode = RegExp(rsFitz + '(?=' + rsFitz + ')|' + rsSymbol + rsSeq, 'g');
    function unicodeToArray(string) {
      return string.match(reUnicode) || [];
    }
    function stringToArray(string) {
      return hasUnicode(string) ? unicodeToArray(string) : asciiToArray(string);
    }
    function toString(value) {
      return value == null ? '' : baseToString(value);
    }
    var reTrim = /^\s+|\s+$/g;
    function trim(string, chars, guard) {
      string = toString(string);
      if (string && (guard || chars === undefined)) {
        return string.replace(reTrim, '');
      }
      if (!string || !(chars = baseToString(chars))) {
        return string;
      }
      var strSymbols = stringToArray(string),
          chrSymbols = stringToArray(chars),
          start = charsStartIndex(strSymbols, chrSymbols),
          end = charsEndIndex(strSymbols, chrSymbols) + 1;
      return castSlice(strSymbols, start, end).join('');
    }
    var FN_ARGS = /^(function)?\s*[^\(]*\(\s*([^\)]*)\)/m;
    var FN_ARG_SPLIT = /,/;
    var FN_ARG = /(=.+)?(\s*)$/;
    var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
    function parseParams(func) {
      func = func.toString().replace(STRIP_COMMENTS, '');
      func = func.match(FN_ARGS)[2].replace(' ', '');
      func = func ? func.split(FN_ARG_SPLIT) : [];
      func = func.map(function(arg) {
        return trim(arg.replace(FN_ARG, ''));
      });
      return func;
    }
    function autoInject(tasks, callback) {
      var newTasks = {};
      baseForOwn(tasks, function(taskFn, key) {
        var params;
        if (isArray(taskFn)) {
          params = copyArray(taskFn);
          taskFn = params.pop();
          newTasks[key] = params.concat(params.length > 0 ? newTask : taskFn);
        } else if (taskFn.length === 1) {
          newTasks[key] = taskFn;
        } else {
          params = parseParams(taskFn);
          if (taskFn.length === 0 && params.length === 0) {
            throw new Error("autoInject task functions require explicit parameters.");
          }
          params.pop();
          newTasks[key] = params.concat(newTask);
        }
        function newTask(results, taskCb) {
          var newArgs = arrayMap(params, function(name) {
            return results[name];
          });
          newArgs.push(taskCb);
          taskFn.apply(null, newArgs);
        }
      });
      auto(newTasks, callback);
    }
    var hasSetImmediate = typeof setImmediate === 'function' && setImmediate;
    var hasNextTick = typeof process === 'object' && typeof process.nextTick === 'function';
    function fallback(fn) {
      setTimeout(fn, 0);
    }
    function wrap(defer) {
      return baseRest$1(function(fn, args) {
        defer(function() {
          fn.apply(null, args);
        });
      });
    }
    var _defer;
    if (hasSetImmediate) {
      _defer = setImmediate;
    } else if (hasNextTick) {
      _defer = process.nextTick;
    } else {
      _defer = fallback;
    }
    var setImmediate$1 = wrap(_defer);
    function DLL() {
      this.head = this.tail = null;
      this.length = 0;
    }
    function setInitial(dll, node) {
      dll.length = 1;
      dll.head = dll.tail = node;
    }
    DLL.prototype.removeLink = function(node) {
      if (node.prev)
        node.prev.next = node.next;
      else
        this.head = node.next;
      if (node.next)
        node.next.prev = node.prev;
      else
        this.tail = node.prev;
      node.prev = node.next = null;
      this.length -= 1;
      return node;
    };
    DLL.prototype.empty = DLL;
    DLL.prototype.insertAfter = function(node, newNode) {
      newNode.prev = node;
      newNode.next = node.next;
      if (node.next)
        node.next.prev = newNode;
      else
        this.tail = newNode;
      node.next = newNode;
      this.length += 1;
    };
    DLL.prototype.insertBefore = function(node, newNode) {
      newNode.prev = node.prev;
      newNode.next = node;
      if (node.prev)
        node.prev.next = newNode;
      else
        this.head = newNode;
      node.prev = newNode;
      this.length += 1;
    };
    DLL.prototype.unshift = function(node) {
      if (this.head)
        this.insertBefore(this.head, node);
      else
        setInitial(this, node);
    };
    DLL.prototype.push = function(node) {
      if (this.tail)
        this.insertAfter(this.tail, node);
      else
        setInitial(this, node);
    };
    DLL.prototype.shift = function() {
      return this.head && this.removeLink(this.head);
    };
    DLL.prototype.pop = function() {
      return this.tail && this.removeLink(this.tail);
    };
    function queue(worker, concurrency, payload) {
      if (concurrency == null) {
        concurrency = 1;
      } else if (concurrency === 0) {
        throw new Error('Concurrency must not be zero');
      }
      function _insert(data, insertAtFront, callback) {
        if (callback != null && typeof callback !== 'function') {
          throw new Error('task callback must be a function');
        }
        q.started = true;
        if (!isArray(data)) {
          data = [data];
        }
        if (data.length === 0 && q.idle()) {
          return setImmediate$1(function() {
            q.drain();
          });
        }
        for (var i = 0,
            l = data.length; i < l; i++) {
          var item = {
            data: data[i],
            callback: callback || noop
          };
          if (insertAtFront) {
            q._tasks.unshift(item);
          } else {
            q._tasks.push(item);
          }
        }
        setImmediate$1(q.process);
      }
      function _next(tasks) {
        return baseRest$1(function(args) {
          workers -= 1;
          for (var i = 0,
              l = tasks.length; i < l; i++) {
            var task = tasks[i];
            var index = baseIndexOf(workersList, task, 0);
            if (index >= 0) {
              workersList.splice(index);
            }
            task.callback.apply(task, args);
            if (args[0] != null) {
              q.error(args[0], task.data);
            }
          }
          if (workers <= q.concurrency - q.buffer) {
            q.unsaturated();
          }
          if (q.idle()) {
            q.drain();
          }
          q.process();
        });
      }
      var workers = 0;
      var workersList = [];
      var q = {
        _tasks: new DLL(),
        concurrency: concurrency,
        payload: payload,
        saturated: noop,
        unsaturated: noop,
        buffer: concurrency / 4,
        empty: noop,
        drain: noop,
        error: noop,
        started: false,
        paused: false,
        push: function(data, callback) {
          _insert(data, false, callback);
        },
        kill: function() {
          q.drain = noop;
          q._tasks.empty();
        },
        unshift: function(data, callback) {
          _insert(data, true, callback);
        },
        process: function() {
          while (!q.paused && workers < q.concurrency && q._tasks.length) {
            var tasks = [],
                data = [];
            var l = q._tasks.length;
            if (q.payload)
              l = Math.min(l, q.payload);
            for (var i = 0; i < l; i++) {
              var node = q._tasks.shift();
              tasks.push(node);
              data.push(node.data);
            }
            if (q._tasks.length === 0) {
              q.empty();
            }
            workers += 1;
            workersList.push(tasks[0]);
            if (workers === q.concurrency) {
              q.saturated();
            }
            var cb = onlyOnce(_next(tasks));
            worker(data, cb);
          }
        },
        length: function() {
          return q._tasks.length;
        },
        running: function() {
          return workers;
        },
        workersList: function() {
          return workersList;
        },
        idle: function() {
          return q._tasks.length + workers === 0;
        },
        pause: function() {
          q.paused = true;
        },
        resume: function() {
          if (q.paused === false) {
            return;
          }
          q.paused = false;
          var resumeCount = Math.min(q.concurrency, q._tasks.length);
          for (var w = 1; w <= resumeCount; w++) {
            setImmediate$1(q.process);
          }
        }
      };
      return q;
    }
    function cargo(worker, payload) {
      return queue(worker, 1, payload);
    }
    var eachOfSeries = doLimit(eachOfLimit, 1);
    function reduce(coll, memo, iteratee, callback) {
      callback = once(callback || noop);
      eachOfSeries(coll, function(x, i, callback) {
        iteratee(memo, x, function(err, v) {
          memo = v;
          callback(err);
        });
      }, function(err) {
        callback(err, memo);
      });
    }
    var seq$1 = baseRest$1(function seq(functions) {
      return baseRest$1(function(args) {
        var that = this;
        var cb = args[args.length - 1];
        if (typeof cb == 'function') {
          args.pop();
        } else {
          cb = noop;
        }
        reduce(functions, args, function(newargs, fn, cb) {
          fn.apply(that, newargs.concat([baseRest$1(function(err, nextargs) {
            cb(err, nextargs);
          })]));
        }, function(err, results) {
          cb.apply(that, [err].concat(results));
        });
      });
    });
    var compose = baseRest$1(function(args) {
      return seq$1.apply(null, args.reverse());
    });
    function concat$1(eachfn, arr, fn, callback) {
      var result = [];
      eachfn(arr, function(x, index, cb) {
        fn(x, function(err, y) {
          result = result.concat(y || []);
          cb(err);
        });
      }, function(err) {
        callback(err, result);
      });
    }
    var concat = doParallel(concat$1);
    function doSeries(fn) {
      return function(obj, iteratee, callback) {
        return fn(eachOfSeries, obj, iteratee, callback);
      };
    }
    var concatSeries = doSeries(concat$1);
    var constant$2 = baseRest$1(function(values) {
      var args = [null].concat(values);
      return initialParams(function(ignoredArgs, callback) {
        return callback.apply(this, args);
      });
    });
    function _createTester(eachfn, check, getResult) {
      return function(arr, limit, iteratee, cb) {
        function done() {
          if (cb) {
            cb(null, getResult(false));
          }
        }
        function wrappedIteratee(x, _, callback) {
          if (!cb)
            return callback();
          iteratee(x, function(err, v) {
            if (cb && (err || check(v))) {
              if (err)
                cb(err);
              else
                cb(err, getResult(true, x));
              cb = iteratee = false;
              callback(err, breakLoop);
            } else {
              callback();
            }
          });
        }
        if (arguments.length > 3) {
          cb = cb || noop;
          eachfn(arr, limit, wrappedIteratee, done);
        } else {
          cb = iteratee;
          cb = cb || noop;
          iteratee = limit;
          eachfn(arr, wrappedIteratee, done);
        }
      };
    }
    function _findGetResult(v, x) {
      return x;
    }
    var detect = _createTester(eachOf, identity, _findGetResult);
    var detectLimit = _createTester(eachOfLimit, identity, _findGetResult);
    var detectSeries = _createTester(eachOfSeries, identity, _findGetResult);
    function consoleFunc(name) {
      return baseRest$1(function(fn, args) {
        fn.apply(null, args.concat([baseRest$1(function(err, args) {
          if (typeof console === 'object') {
            if (err) {
              if (console.error) {
                console.error(err);
              }
            } else if (console[name]) {
              arrayEach(args, function(x) {
                console[name](x);
              });
            }
          }
        })]));
      });
    }
    var dir = consoleFunc('dir');
    function doDuring(fn, test, callback) {
      callback = onlyOnce(callback || noop);
      var next = baseRest$1(function(err, args) {
        if (err)
          return callback(err);
        args.push(check);
        test.apply(this, args);
      });
      function check(err, truth) {
        if (err)
          return callback(err);
        if (!truth)
          return callback(null);
        fn(next);
      }
      check(null, true);
    }
    function doWhilst(iteratee, test, callback) {
      callback = onlyOnce(callback || noop);
      var next = baseRest$1(function(err, args) {
        if (err)
          return callback(err);
        if (test.apply(this, args))
          return iteratee(next);
        callback.apply(null, [null].concat(args));
      });
      iteratee(next);
    }
    function doUntil(fn, test, callback) {
      doWhilst(fn, function() {
        return !test.apply(this, arguments);
      }, callback);
    }
    function during(test, fn, callback) {
      callback = onlyOnce(callback || noop);
      function next(err) {
        if (err)
          return callback(err);
        test(check);
      }
      function check(err, truth) {
        if (err)
          return callback(err);
        if (!truth)
          return callback(null);
        fn(next);
      }
      test(check);
    }
    function _withoutIndex(iteratee) {
      return function(value, index, callback) {
        return iteratee(value, callback);
      };
    }
    function eachLimit(coll, iteratee, callback) {
      eachOf(coll, _withoutIndex(iteratee), callback);
    }
    function eachLimit$1(coll, limit, iteratee, callback) {
      _eachOfLimit(limit)(coll, _withoutIndex(iteratee), callback);
    }
    var eachSeries = doLimit(eachLimit$1, 1);
    function ensureAsync(fn) {
      return initialParams(function(args, callback) {
        var sync = true;
        args.push(function() {
          var innerArgs = arguments;
          if (sync) {
            setImmediate$1(function() {
              callback.apply(null, innerArgs);
            });
          } else {
            callback.apply(null, innerArgs);
          }
        });
        fn.apply(this, args);
        sync = false;
      });
    }
    function notId(v) {
      return !v;
    }
    var every = _createTester(eachOf, notId, notId);
    var everyLimit = _createTester(eachOfLimit, notId, notId);
    var everySeries = doLimit(everyLimit, 1);
    function baseProperty(key) {
      return function(object) {
        return object == null ? undefined : object[key];
      };
    }
    function _filter(eachfn, arr, iteratee, callback) {
      callback = once(callback || noop);
      var results = [];
      eachfn(arr, function(x, index, callback) {
        iteratee(x, function(err, v) {
          if (err) {
            callback(err);
          } else {
            if (v) {
              results.push({
                index: index,
                value: x
              });
            }
            callback();
          }
        });
      }, function(err) {
        if (err) {
          callback(err);
        } else {
          callback(null, arrayMap(results.sort(function(a, b) {
            return a.index - b.index;
          }), baseProperty('value')));
        }
      });
    }
    var filter = doParallel(_filter);
    var filterLimit = doParallelLimit(_filter);
    var filterSeries = doLimit(filterLimit, 1);
    function forever(fn, errback) {
      var done = onlyOnce(errback || noop);
      var task = ensureAsync(fn);
      function next(err) {
        if (err)
          return done(err);
        task(next);
      }
      next();
    }
    var log = consoleFunc('log');
    function mapValuesLimit(obj, limit, iteratee, callback) {
      callback = once(callback || noop);
      var newObj = {};
      eachOfLimit(obj, limit, function(val, key, next) {
        iteratee(val, key, function(err, result) {
          if (err)
            return next(err);
          newObj[key] = result;
          next();
        });
      }, function(err) {
        callback(err, newObj);
      });
    }
    var mapValues = doLimit(mapValuesLimit, Infinity);
    var mapValuesSeries = doLimit(mapValuesLimit, 1);
    function has(obj, key) {
      return key in obj;
    }
    function memoize(fn, hasher) {
      var memo = Object.create(null);
      var queues = Object.create(null);
      hasher = hasher || identity;
      var memoized = initialParams(function memoized(args, callback) {
        var key = hasher.apply(null, args);
        if (has(memo, key)) {
          setImmediate$1(function() {
            callback.apply(null, memo[key]);
          });
        } else if (has(queues, key)) {
          queues[key].push(callback);
        } else {
          queues[key] = [callback];
          fn.apply(null, args.concat([baseRest$1(function(args) {
            memo[key] = args;
            var q = queues[key];
            delete queues[key];
            for (var i = 0,
                l = q.length; i < l; i++) {
              q[i].apply(null, args);
            }
          })]));
        }
      });
      memoized.memo = memo;
      memoized.unmemoized = fn;
      return memoized;
    }
    var _defer$1;
    if (hasNextTick) {
      _defer$1 = process.nextTick;
    } else if (hasSetImmediate) {
      _defer$1 = setImmediate;
    } else {
      _defer$1 = fallback;
    }
    var nextTick = wrap(_defer$1);
    function _parallel(eachfn, tasks, callback) {
      callback = callback || noop;
      var results = isArrayLike(tasks) ? [] : {};
      eachfn(tasks, function(task, key, callback) {
        task(baseRest$1(function(err, args) {
          if (args.length <= 1) {
            args = args[0];
          }
          results[key] = args;
          callback(err);
        }));
      }, function(err) {
        callback(err, results);
      });
    }
    function parallelLimit(tasks, callback) {
      _parallel(eachOf, tasks, callback);
    }
    function parallelLimit$1(tasks, limit, callback) {
      _parallel(_eachOfLimit(limit), tasks, callback);
    }
    var queue$1 = function(worker, concurrency) {
      return queue(function(items, cb) {
        worker(items[0], cb);
      }, concurrency, 1);
    };
    var priorityQueue = function(worker, concurrency) {
      var q = queue$1(worker, concurrency);
      q.push = function(data, priority, callback) {
        if (callback == null)
          callback = noop;
        if (typeof callback !== 'function') {
          throw new Error('task callback must be a function');
        }
        q.started = true;
        if (!isArray(data)) {
          data = [data];
        }
        if (data.length === 0) {
          return setImmediate$1(function() {
            q.drain();
          });
        }
        priority = priority || 0;
        var nextNode = q._tasks.head;
        while (nextNode && priority >= nextNode.priority) {
          nextNode = nextNode.next;
        }
        for (var i = 0,
            l = data.length; i < l; i++) {
          var item = {
            data: data[i],
            priority: priority,
            callback: callback
          };
          if (nextNode) {
            q._tasks.insertBefore(nextNode, item);
          } else {
            q._tasks.push(item);
          }
        }
        setImmediate$1(q.process);
      };
      delete q.unshift;
      return q;
    };
    function race(tasks, callback) {
      callback = once(callback || noop);
      if (!isArray(tasks))
        return callback(new TypeError('First argument to race must be an array of functions'));
      if (!tasks.length)
        return callback();
      for (var i = 0,
          l = tasks.length; i < l; i++) {
        tasks[i](callback);
      }
    }
    var slice = Array.prototype.slice;
    function reduceRight(array, memo, iteratee, callback) {
      var reversed = slice.call(array).reverse();
      reduce(reversed, memo, iteratee, callback);
    }
    function reflect(fn) {
      return initialParams(function reflectOn(args, reflectCallback) {
        args.push(baseRest$1(function callback(err, cbArgs) {
          if (err) {
            reflectCallback(null, {error: err});
          } else {
            var value = null;
            if (cbArgs.length === 1) {
              value = cbArgs[0];
            } else if (cbArgs.length > 1) {
              value = cbArgs;
            }
            reflectCallback(null, {value: value});
          }
        }));
        return fn.apply(this, args);
      });
    }
    function reject$1(eachfn, arr, iteratee, callback) {
      _filter(eachfn, arr, function(value, cb) {
        iteratee(value, function(err, v) {
          if (err) {
            cb(err);
          } else {
            cb(null, !v);
          }
        });
      }, callback);
    }
    var reject = doParallel(reject$1);
    function reflectAll(tasks) {
      var results;
      if (isArray(tasks)) {
        results = arrayMap(tasks, reflect);
      } else {
        results = {};
        baseForOwn(tasks, function(task, key) {
          results[key] = reflect.call(this, task);
        });
      }
      return results;
    }
    var rejectLimit = doParallelLimit(reject$1);
    var rejectSeries = doLimit(rejectLimit, 1);
    function retry(opts, task, callback) {
      var DEFAULT_TIMES = 5;
      var DEFAULT_INTERVAL = 0;
      var options = {
        times: DEFAULT_TIMES,
        intervalFunc: constant(DEFAULT_INTERVAL)
      };
      function parseTimes(acc, t) {
        if (typeof t === 'object') {
          acc.times = +t.times || DEFAULT_TIMES;
          acc.intervalFunc = typeof t.interval === 'function' ? t.interval : constant(+t.interval || DEFAULT_INTERVAL);
          acc.errorFilter = t.errorFilter;
        } else if (typeof t === 'number' || typeof t === 'string') {
          acc.times = +t || DEFAULT_TIMES;
        } else {
          throw new Error("Invalid arguments for async.retry");
        }
      }
      if (arguments.length < 3 && typeof opts === 'function') {
        callback = task || noop;
        task = opts;
      } else {
        parseTimes(options, opts);
        callback = callback || noop;
      }
      if (typeof task !== 'function') {
        throw new Error("Invalid arguments for async.retry");
      }
      var attempt = 1;
      function retryAttempt() {
        task(function(err) {
          if (err && attempt++ < options.times && (typeof options.errorFilter != 'function' || options.errorFilter(err))) {
            setTimeout(retryAttempt, options.intervalFunc(attempt));
          } else {
            callback.apply(null, arguments);
          }
        });
      }
      retryAttempt();
    }
    var retryable = function(opts, task) {
      if (!task) {
        task = opts;
        opts = null;
      }
      return initialParams(function(args, callback) {
        function taskFn(cb) {
          task.apply(null, args.concat([cb]));
        }
        if (opts)
          retry(opts, taskFn, callback);
        else
          retry(taskFn, callback);
      });
    };
    function series(tasks, callback) {
      _parallel(eachOfSeries, tasks, callback);
    }
    var some = _createTester(eachOf, Boolean, identity);
    var someLimit = _createTester(eachOfLimit, Boolean, identity);
    var someSeries = doLimit(someLimit, 1);
    function sortBy(coll, iteratee, callback) {
      map(coll, function(x, callback) {
        iteratee(x, function(err, criteria) {
          if (err)
            return callback(err);
          callback(null, {
            value: x,
            criteria: criteria
          });
        });
      }, function(err, results) {
        if (err)
          return callback(err);
        callback(null, arrayMap(results.sort(comparator), baseProperty('value')));
      });
      function comparator(left, right) {
        var a = left.criteria,
            b = right.criteria;
        return a < b ? -1 : a > b ? 1 : 0;
      }
    }
    function timeout(asyncFn, milliseconds, info) {
      var originalCallback,
          timer;
      var timedOut = false;
      function injectedCallback() {
        if (!timedOut) {
          originalCallback.apply(null, arguments);
          clearTimeout(timer);
        }
      }
      function timeoutCallback() {
        var name = asyncFn.name || 'anonymous';
        var error = new Error('Callback function "' + name + '" timed out.');
        error.code = 'ETIMEDOUT';
        if (info) {
          error.info = info;
        }
        timedOut = true;
        originalCallback(error);
      }
      return initialParams(function(args, origCallback) {
        originalCallback = origCallback;
        timer = setTimeout(timeoutCallback, milliseconds);
        asyncFn.apply(null, args.concat(injectedCallback));
      });
    }
    var nativeCeil = Math.ceil;
    var nativeMax$1 = Math.max;
    function baseRange(start, end, step, fromRight) {
      var index = -1,
          length = nativeMax$1(nativeCeil((end - start) / (step || 1)), 0),
          result = Array(length);
      while (length--) {
        result[fromRight ? length : ++index] = start;
        start += step;
      }
      return result;
    }
    function timeLimit(count, limit, iteratee, callback) {
      mapLimit(baseRange(0, count, 1), limit, iteratee, callback);
    }
    var times = doLimit(timeLimit, Infinity);
    var timesSeries = doLimit(timeLimit, 1);
    function transform(coll, accumulator, iteratee, callback) {
      if (arguments.length === 3) {
        callback = iteratee;
        iteratee = accumulator;
        accumulator = isArray(coll) ? [] : {};
      }
      callback = once(callback || noop);
      eachOf(coll, function(v, k, cb) {
        iteratee(accumulator, v, k, cb);
      }, function(err) {
        callback(err, accumulator);
      });
    }
    function unmemoize(fn) {
      return function() {
        return (fn.unmemoized || fn).apply(null, arguments);
      };
    }
    function whilst(test, iteratee, callback) {
      callback = onlyOnce(callback || noop);
      if (!test())
        return callback(null);
      var next = baseRest$1(function(err, args) {
        if (err)
          return callback(err);
        if (test())
          return iteratee(next);
        callback.apply(null, [null].concat(args));
      });
      iteratee(next);
    }
    function until(test, fn, callback) {
      whilst(function() {
        return !test.apply(this, arguments);
      }, fn, callback);
    }
    var waterfall = function(tasks, callback) {
      callback = once(callback || noop);
      if (!isArray(tasks))
        return callback(new Error('First argument to waterfall must be an array of functions'));
      if (!tasks.length)
        return callback();
      var taskIndex = 0;
      function nextTask(args) {
        if (taskIndex === tasks.length) {
          return callback.apply(null, [null].concat(args));
        }
        var taskCallback = onlyOnce(baseRest$1(function(err, args) {
          if (err) {
            return callback.apply(null, [err].concat(args));
          }
          nextTask(args);
        }));
        args.push(taskCallback);
        var task = tasks[taskIndex++];
        task.apply(null, args);
      }
      nextTask([]);
    };
    var index = {
      applyEach: applyEach,
      applyEachSeries: applyEachSeries,
      apply: apply$2,
      asyncify: asyncify,
      auto: auto,
      autoInject: autoInject,
      cargo: cargo,
      compose: compose,
      concat: concat,
      concatSeries: concatSeries,
      constant: constant$2,
      detect: detect,
      detectLimit: detectLimit,
      detectSeries: detectSeries,
      dir: dir,
      doDuring: doDuring,
      doUntil: doUntil,
      doWhilst: doWhilst,
      during: during,
      each: eachLimit,
      eachLimit: eachLimit$1,
      eachOf: eachOf,
      eachOfLimit: eachOfLimit,
      eachOfSeries: eachOfSeries,
      eachSeries: eachSeries,
      ensureAsync: ensureAsync,
      every: every,
      everyLimit: everyLimit,
      everySeries: everySeries,
      filter: filter,
      filterLimit: filterLimit,
      filterSeries: filterSeries,
      forever: forever,
      log: log,
      map: map,
      mapLimit: mapLimit,
      mapSeries: mapSeries,
      mapValues: mapValues,
      mapValuesLimit: mapValuesLimit,
      mapValuesSeries: mapValuesSeries,
      memoize: memoize,
      nextTick: nextTick,
      parallel: parallelLimit,
      parallelLimit: parallelLimit$1,
      priorityQueue: priorityQueue,
      queue: queue$1,
      race: race,
      reduce: reduce,
      reduceRight: reduceRight,
      reflect: reflect,
      reflectAll: reflectAll,
      reject: reject,
      rejectLimit: rejectLimit,
      rejectSeries: rejectSeries,
      retry: retry,
      retryable: retryable,
      seq: seq$1,
      series: series,
      setImmediate: setImmediate$1,
      some: some,
      someLimit: someLimit,
      someSeries: someSeries,
      sortBy: sortBy,
      timeout: timeout,
      times: times,
      timesLimit: timeLimit,
      timesSeries: timesSeries,
      transform: transform,
      unmemoize: unmemoize,
      until: until,
      waterfall: waterfall,
      whilst: whilst,
      all: every,
      any: some,
      forEach: eachLimit,
      forEachSeries: eachSeries,
      forEachLimit: eachLimit$1,
      forEachOf: eachOf,
      forEachOfSeries: eachOfSeries,
      forEachOfLimit: eachOfLimit,
      inject: reduce,
      foldl: reduce,
      foldr: reduceRight,
      select: filter,
      selectLimit: filterLimit,
      selectSeries: filterSeries,
      wrapSync: asyncify
    };
    exports['default'] = index;
    exports.applyEach = applyEach;
    exports.applyEachSeries = applyEachSeries;
    exports.apply = apply$2;
    exports.asyncify = asyncify;
    exports.auto = auto;
    exports.autoInject = autoInject;
    exports.cargo = cargo;
    exports.compose = compose;
    exports.concat = concat;
    exports.concatSeries = concatSeries;
    exports.constant = constant$2;
    exports.detect = detect;
    exports.detectLimit = detectLimit;
    exports.detectSeries = detectSeries;
    exports.dir = dir;
    exports.doDuring = doDuring;
    exports.doUntil = doUntil;
    exports.doWhilst = doWhilst;
    exports.during = during;
    exports.each = eachLimit;
    exports.eachLimit = eachLimit$1;
    exports.eachOf = eachOf;
    exports.eachOfLimit = eachOfLimit;
    exports.eachOfSeries = eachOfSeries;
    exports.eachSeries = eachSeries;
    exports.ensureAsync = ensureAsync;
    exports.every = every;
    exports.everyLimit = everyLimit;
    exports.everySeries = everySeries;
    exports.filter = filter;
    exports.filterLimit = filterLimit;
    exports.filterSeries = filterSeries;
    exports.forever = forever;
    exports.log = log;
    exports.map = map;
    exports.mapLimit = mapLimit;
    exports.mapSeries = mapSeries;
    exports.mapValues = mapValues;
    exports.mapValuesLimit = mapValuesLimit;
    exports.mapValuesSeries = mapValuesSeries;
    exports.memoize = memoize;
    exports.nextTick = nextTick;
    exports.parallel = parallelLimit;
    exports.parallelLimit = parallelLimit$1;
    exports.priorityQueue = priorityQueue;
    exports.queue = queue$1;
    exports.race = race;
    exports.reduce = reduce;
    exports.reduceRight = reduceRight;
    exports.reflect = reflect;
    exports.reflectAll = reflectAll;
    exports.reject = reject;
    exports.rejectLimit = rejectLimit;
    exports.rejectSeries = rejectSeries;
    exports.retry = retry;
    exports.retryable = retryable;
    exports.seq = seq$1;
    exports.series = series;
    exports.setImmediate = setImmediate$1;
    exports.some = some;
    exports.someLimit = someLimit;
    exports.someSeries = someSeries;
    exports.sortBy = sortBy;
    exports.timeout = timeout;
    exports.times = times;
    exports.timesLimit = timeLimit;
    exports.timesSeries = timesSeries;
    exports.transform = transform;
    exports.unmemoize = unmemoize;
    exports.until = until;
    exports.waterfall = waterfall;
    exports.whilst = whilst;
    exports.all = every;
    exports.allLimit = everyLimit;
    exports.allSeries = everySeries;
    exports.any = some;
    exports.anyLimit = someLimit;
    exports.anySeries = someSeries;
    exports.find = detect;
    exports.findLimit = detectLimit;
    exports.findSeries = detectSeries;
    exports.forEach = eachLimit;
    exports.forEachSeries = eachSeries;
    exports.forEachLimit = eachLimit$1;
    exports.forEachOf = eachOf;
    exports.forEachOfSeries = eachOfSeries;
    exports.forEachOfLimit = eachOfLimit;
    exports.inject = reduce;
    exports.foldl = reduce;
    exports.foldr = reduceRight;
    exports.select = filter;
    exports.selectLimit = filterLimit;
    exports.selectSeries = filterSeries;
    exports.wrapSync = asyncify;
    Object.defineProperty(exports, '__esModule', {value: true});
  })));
})(require('buffer').Buffer, require('process'));
