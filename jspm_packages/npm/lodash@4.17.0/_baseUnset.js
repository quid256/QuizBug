/* */ 
var castPath = require('./_castPath'),
    isKey = require('./_isKey'),
    last = require('./last'),
    parent = require('./_parent'),
    toKey = require('./_toKey');
var objectProto = Object.prototype;
var hasOwnProperty = objectProto.hasOwnProperty;
function baseUnset(object, path) {
  path = isKey(path, object) ? [path] : castPath(path);
  object = parent(object, path);
  var key = toKey(last(path));
  return !(object != null && hasOwnProperty.call(object, key)) || delete object[key];
}
module.exports = baseUnset;
