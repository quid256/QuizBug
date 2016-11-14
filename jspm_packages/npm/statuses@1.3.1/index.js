/* */ 
'use strict';
var codes = require('./codes.json!systemjs-json');
module.exports = status;
status.codes = populateStatusesMap(status, codes);
status.redirect = {
  300: true,
  301: true,
  302: true,
  303: true,
  305: true,
  307: true,
  308: true
};
status.empty = {
  204: true,
  205: true,
  304: true
};
status.retry = {
  502: true,
  503: true,
  504: true
};
function populateStatusesMap(statuses, codes) {
  var arr = [];
  Object.keys(codes).forEach(function forEachCode(code) {
    var message = codes[code];
    var status = Number(code);
    statuses[status] = message;
    statuses[message] = status;
    statuses[message.toLowerCase()] = status;
    arr.push(status);
  });
  return arr;
}
function status(code) {
  if (typeof code === 'number') {
    if (!status[code])
      throw new Error('invalid status code: ' + code);
    return code;
  }
  if (typeof code !== 'string') {
    throw new TypeError('code must be a number or string');
  }
  var n = parseInt(code, 10);
  if (!isNaN(n)) {
    if (!status[n])
      throw new Error('invalid status code: ' + n);
    return n;
  }
  n = status[code.toLowerCase()];
  if (!n)
    throw new Error('invalid status message: "' + code + '"');
  return n;
}
