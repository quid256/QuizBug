/* */ 
'use strict';
var debug = require('debug')('express:view');
var path = require('path');
var fs = require('fs');
var utils = require('./utils');
var dirname = path.dirname;
var basename = path.basename;
var extname = path.extname;
var join = path.join;
var resolve = path.resolve;
module.exports = View;
function View(name, options) {
  var opts = options || {};
  this.defaultEngine = opts.defaultEngine;
  this.ext = extname(name);
  this.name = name;
  this.root = opts.root;
  if (!this.ext && !this.defaultEngine) {
    throw new Error('No default engine was specified and no extension was provided.');
  }
  var fileName = name;
  if (!this.ext) {
    this.ext = this.defaultEngine[0] !== '.' ? '.' + this.defaultEngine : this.defaultEngine;
    fileName += this.ext;
  }
  if (!opts.engines[this.ext]) {
    opts.engines[this.ext] = require(this.ext.substr(1)).__express;
  }
  this.engine = opts.engines[this.ext];
  this.path = this.lookup(fileName);
}
View.prototype.lookup = function lookup(name) {
  var path;
  var roots = [].concat(this.root);
  debug('lookup "%s"', name);
  for (var i = 0; i < roots.length && !path; i++) {
    var root = roots[i];
    var loc = resolve(root, name);
    var dir = dirname(loc);
    var file = basename(loc);
    path = this.resolve(dir, file);
  }
  return path;
};
View.prototype.render = function render(options, callback) {
  debug('render "%s"', this.path);
  this.engine(this.path, options, callback);
};
View.prototype.resolve = function resolve(dir, file) {
  var ext = this.ext;
  var path = join(dir, file);
  var stat = tryStat(path);
  if (stat && stat.isFile()) {
    return path;
  }
  path = join(dir, basename(file, ext), 'index' + ext);
  stat = tryStat(path);
  if (stat && stat.isFile()) {
    return path;
  }
};
function tryStat(path) {
  debug('stat "%s"', path);
  try {
    return fs.statSync(path);
  } catch (e) {
    return undefined;
  }
}
