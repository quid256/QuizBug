/* */ 
var arrayMap = require('./_arrayMap'),
    basePick = require('./_basePick'),
    flatRest = require('./_flatRest'),
    toKey = require('./_toKey');
var pick = flatRest(function(object, paths) {
  return object == null ? {} : basePick(object, arrayMap(paths, toKey));
});
module.exports = pick;
