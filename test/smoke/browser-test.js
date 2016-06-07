
// Quick and dirty check that it works in Chrome. This is not part
// of the nodejs-based suite.

document.addEventListener("DOMContentLoaded", function(event) { 
  const ℂ = window.C1;
  const nodeType = ℂ.private.nodeType;
  const deepEqual = ℂ.deepEqual;

  const assert = function(pred) {
    if (!pred) throw Error('no good!');
  }

  const config0 = {
    ver: '1.0.0',
    mdlib: 'markdown-it',
    libs: ℂ(Ɔ=> ({
      mdlib: Ɔ.mdlib,
      jqlib: 'jQuery',
    })),
    cdn: 'https://cdn.org/',
    jqurl: ℂ(Ɔ=> Ɔ.cdn + Ɔ.libs.jqlib + '-' + Ɔ.ver),
  };
  const config1 = {
    ver: '1.1.0',
    libs: { funclib: 'ramda', },
    clibs: ℂ(Ɔ=> Ɔ.libs),
  };
  const config = ℂ.extend(config0, config1);

  const res = deepEqual(config,
    { ver: '1.1.0',
      mdlib: 'markdown-it',
      libs: {
        mdlib: 'markdown-it',
        jqlib: 'jQuery',
        funclib: 'ramda'
      },
      cdn: 'https://cdn.org/',
      jqurl: 'https://cdn.org/jQuery-1.1.0',
      clibs: {
        mdlib: 'markdown-it',
        jqlib: 'jQuery',
        funclib: 'ramda'
      },
    }
  );

  document.getElementById('pass').innerHTML = 'pass';
});

