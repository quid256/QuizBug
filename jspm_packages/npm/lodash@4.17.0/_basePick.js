/* */ 
var basePickBy = require('./_basePickBy'),
    hasIn = require('./hasIn');
function basePick(object, paths) {
  object = Object(object);
  return basePickBy(object, paths, function(value, path) {
    return hasIn(object, path);
  });
}
module.exports = basePick;
