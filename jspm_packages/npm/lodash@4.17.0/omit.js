/* */ 
var baseClone = require('./_baseClone'),
    baseUnset = require('./_baseUnset'),
    copyObject = require('./_copyObject'),
    flatRest = require('./_flatRest'),
    getAllKeysIn = require('./_getAllKeysIn');
var CLONE_DEEP_FLAG = 1,
    CLONE_FLAT_FLAG = 2,
    CLONE_SYMBOLS_FLAG = 4;
var omit = flatRest(function(object, paths) {
  var result = {};
  if (object == null) {
    return result;
  }
  copyObject(object, getAllKeysIn(object), result);
  result = baseClone(result, CLONE_DEEP_FLAG | CLONE_FLAT_FLAG | CLONE_SYMBOLS_FLAG);
  var length = paths.length;
  while (length--) {
    baseUnset(result, paths[length]);
  }
  return result;
});
module.exports = omit;
