

const log = (...args) => {
  console.log(C1.pp(...args));
}
const lg = (name) => eval(`log('${name}', ${name})`);

/*

cfg0 = C1.extend({a: 1});
lg('cfg0');

cfg1 = C1.extend({
  a: 1,
  b: C1(X=> X.a),
})
lg('cfg1');

const defaults2 = {
  optionsSelector: '.config-one',
};
cfg2 = C1.extend(
  defaults2, 
  { a: 1 }
);
lg('cfg2');


const defaults3 = defaults2;
cfg3 = C1.extend(
  defaults3,
  { elem: C1(X=> X.optionsSelector), }
);
lg('cfg3');
*/

const defaults4 = {
  harvestMe: { a: 1, b: 2 },
}
cfg4 = C1.extend(
  defaults4,
  {copy: C1(X=> X.harvestMe)},
  {}
);
lg('cfg4');


/*
DataAttributeJsonHarvester = function() {
  return C1(X=> {
    const optsSel = X.optionsSelector;
    return { a: 1 };
  });
};

*/