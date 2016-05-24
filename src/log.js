// FIXME: replace this with a real logging library -- winston?
// log is a function that logs messages, and has a simple indent (.enter()) and
// unindent (.exit()) feature.
//
// Usage:
//   var log = require('./log.js')();
//   log.enter('starting');
//   ...
//   log('another message');
//   log.exit();  

const logs = {};

// Make a new logger, or return an existing one

module.exports = function(_opts) {
  opts = _opts || {};
  const braces = ('braces' in opts) ? opts.braces : false;
  const id = ('id' in opts) ? opts.id : Math.floor(Math.random() * 100000);
  if (id in logs) return logs[id];

  var log = function(...args) {
    if (!log.enabled) return;
    args.unshift('  '.repeat(log.indent));
    console.log.apply(console, args);
  };

  log.indent = 0;
  log.enabled = true;

  log.enable = function() {
    log.enabled = true;
  };
  log.disable = function() {
    log.enabled = false;
  };

  log.enter = function(...args) {
    if (!log.enabled) return;
    if (braces) args.push('{');
    log(...args);
    log.indent++;
  };

  log.exit = function() {
    if (!log.enabled) return;
    log.indent--;
    if (braces) log('}');
  };

  logs[id] = log;
  return log;
}


