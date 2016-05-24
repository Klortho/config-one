// This is a test file, used for study/experimentation.
//
// How much should we worry about inherited and/or non-enumerable properties?
// Here's a function that gets all the properties of an object. There are a
// lot. On the other hand, most of them probably come from Object.prototype,
// and probably we could implement using the same mechanism: i.e. instantiate
// a view_prototype for every c1.prototype, and append that to the *view's*
// prototype chain.
//
// If we do proxy them, then the rule is that non-enumerable properties and 
// inherited properties are always *atoms*.

function getAllPropertyNames( obj ) {
  var keys = {};
  do {
    Object.getOwnPropertyNames(obj).forEach(function(key) {
      keys[key] = true;
    });
  } while (obj = Object.getPrototypeOf(obj));
  return Object.keys(keys);
}

var A = function() { 
  this.a_prop = 10; 
  Object.defineProperty(this, 'a_nonEnum', {
    enumerable: false, 
    value: 25,
  });
};
var Ap = A.prototype = {
  ap_prop: 5, 
};
Object.defineProperty(Ap, 'ap_nonEnum', {
  enumerable: false, 
  value: 30,
});

var a = new A();
console.log(getAllPropertyNames(a));
