// Some very simple in-browser tests for webpackification.

const report = function(pass) {
  const msgColor = pass ? 'green' : 'red';
  const msg = pass ? 'passed' : 'failed';
  document.write(`<h3 style='color:${msgColor}'><em>${msg}</em></h3>`)
}

const assert = function(pred, msg) {
  if (!pred) {
    report(false);
    throw Error('assert failed' + (msg ? ': ' + msg : ''));
  }
}
var viewc = config1(null,
  {a: 31, b: 32, c: 33},
  {a: 35}
);
assert(viewc.a == 35);
assert(viewc.b == 32);
assert(viewc.c == 33);



report(true);
