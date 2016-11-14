/* */ 
var assign = require('./util/assign');
var fse = {};
var gfs = require('graceful-fs');
Object.keys(gfs).forEach(function(key) {
  fse[key] = gfs[key];
});
var fs = fse;
assign(fs, require('./copy/index'));
assign(fs, require('./copy-sync/index'));
assign(fs, require('./mkdirs/index'));
assign(fs, require('./remove/index'));
assign(fs, require('./json/index'));
assign(fs, require('./move/index'));
assign(fs, require('./empty/index'));
assign(fs, require('./ensure/index'));
assign(fs, require('./output/index'));
assign(fs, require('./walk/index'));
module.exports = fs;
var jsonfile = {};
Object.defineProperty(jsonfile, 'spaces', {
  get: function() {
    return fs.spaces;
  },
  set: function(val) {
    fs.spaces = val;
  }
});
module.exports.jsonfile = jsonfile;
