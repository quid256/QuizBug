/* */ 
var baseGet = require('./_baseGet'),
    baseSet = require('./_baseSet');
function basePickBy(object, paths, predicate) {
  var index = -1,
      length = paths.length,
      result = {};
  while (++index < length) {
    var path = paths[index],
        value = baseGet(object, path);
    if (predicate(value, path)) {
      baseSet(result, path, value);
    }
  }
  return result;
}
module.exports = basePickBy;
