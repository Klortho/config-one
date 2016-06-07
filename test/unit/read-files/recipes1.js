const ℂ = require('../../src/main.js');

module.exports = {
  ver: '1.0.0',
  mdlib: 'markdown-it',
  libs: ℂ(Ɔ=> ({
    mdlib: Ɔ.mdlib,
    jqlib: 'jQuery',
  })),
  cdn: 'https://cdn.org/',
  jqurl: ℂ(Ɔ=> Ɔ.cdn + Ɔ.libs.jqlib + '-' + Ɔ.ver),
};

