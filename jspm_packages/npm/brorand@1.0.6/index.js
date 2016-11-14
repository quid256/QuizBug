/* */ 
var r;
module.exports = function rand(len) {
  if (!r)
    r = new Rand(null);
  return r.generate(len);
};
function Rand(rand) {
  this.rand = rand;
}
module.exports.Rand = Rand;
Rand.prototype.generate = function generate(len) {
  return this._rand(len);
};
if (typeof window === 'object') {
  if (window.crypto && window.crypto.getRandomValues) {
    Rand.prototype._rand = function _rand(n) {
      var arr = new Uint8Array(n);
      window.crypto.getRandomValues(arr);
      return arr;
    };
  } else if (window.msCrypto && window.msCrypto.getRandomValues) {
    Rand.prototype._rand = function _rand(n) {
      var arr = new Uint8Array(n);
      window.msCrypto.getRandomValues(arr);
      return arr;
    };
  } else {
    Rand.prototype._rand = function() {
      throw new Error('Not implemented yet');
    };
  }
} else {
  try {
    var crypto = require('@empty');
    Rand.prototype._rand = function _rand(n) {
      return crypto.randomBytes(n);
    };
  } catch (e) {
    Rand.prototype._rand = function _rand(n) {
      var res = new Uint8Array(n);
      for (var i = 0; i < res.length; i++)
        res[i] = this.rand.getByte();
      return res;
    };
  }
}
