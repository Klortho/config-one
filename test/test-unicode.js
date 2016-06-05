// This page is a bit frivolous -- a search for some alternative characters
// to use as indentifiers, so as to:
// - lessen the visual/syntactic noise inherent in declaring recipes
// - make name collisions unlikely

// Here's a breakdown, by category, of some of the characters I looked at.
// The main reference is "Valid JavaScript variable names in ECMAScript 5",
// https://mathiasbynens.be/notes/javascript-identifiers. I tried a lot of
// these in the tests (but not every one) and never had a problem.

// Alternative forms of "C" (for config):
// ℂ  U+2102 DOUBLE-STRUCK CAPITAL C - my favorite
// Various latin "C"s with diacritics:  Ç  Ĉ  Ć  Ċ  Č
// Ɔ  U+0186 LATIN CAPITAL LETTER OPEN O
// Ƈ  U+0187 LATIN CAPITAL LETTER C WITH HOOK
// К  uppercase cyrillic Ka; конфигурация == configuration
// С  U+0421 CYRILLIC CAPITAL LETTER ES (looks too much like "C")
// ᑕ  U+1455 CANADIAN SYLLABICS TA

// Looks like, or connotes "1" (for "config-one"):
// Ⅰ  U+2160 Roman numeral one
// ǀ  U+01C0 LATIN LETTER DENTAL CLICK

// For "recipe":
// ρ   // greek rho
// 食  // Chinese shi2 (food)
// ᴙ  //  U+1D19 LATIN LETTER SMALL CAPITAL REVERSED R
// ᖇ  // canadian aboriginal

// For "extend":
// ᙭  // canadian aboriginal
// ᗕ  // because it looks like it's getting bigger
// ᗉ  // ditto
// ᕮ  // looks like "E" for "extend"

// Symbols for their aesthetics
// ᐸ   // U+1438 CANADIAN SYLLABICS PA
// Ⱉ   // U+2C19 GLAGOLITIC CAPITAL LETTER OTU
// ᐧ    // U+1427 CANADIAN SYLLABICS FINAL MIDDLE DOT - almost invisible
// ᗕ   // another canadian syllabics
// ᑕ   // U+1455 CANADIAN SYLLABICS TA
// A lot more nice looking Canadian Aboriginal Syllabics:
// https://en.wikipedia.org/wiki/Unified_Canadian_Aboriginal_Syllabics_(Unicode_block)
//  ᗧ  ᗏ  ᗡ  ᙐ   ᐳ  ᐸ   ᑕ

"use strict";

const assert = require('chai').assert;
const R = require('ramda');

// unit under test
const ℂ = require('../src/main.js');
const recipe = ℂ.recipe;
const X = ℂ.extend;

describe('unicode - works with these unicode characters as symbols', 
  function() {

    it('my favorites', function() {
      var config = X(
        { a: 1,
          b: ℂ(Ɔ=> 5 + Ɔ.a),
        }
      );
      assert.equal(config.b, 6);
    });

    it('others', function() {
      // Symbols for recipe
      var [ᗏ, ρ, 食, ᐸ, Ⱉ, ᴙ, ᐧ, ǀ, ᗕ, ᑕ, ᐳ, ᐸ] = R.repeat(ℂ.recipe, 20);

      var config = X(
        {
          // One of my favorites, for the looks:
          m: ᗏ(ᑕ=> 3 + ᑕ.a),

          a: 1,
          b: ρ(X=> 3),
          f: 食(X=> 3),

          // Symbols just for their looks
          c: ᐸ(ᐳ=> 3 + ᐳ.a),
          d: Ⱉ(X=> 3 + X.a),
          e: ᴙ(X=> 7),
          g: ᐧ(ǀ=> 9),
          h: ǀ(ᐧ=> 9 + ᐧ.a),
          i: ᗕ(Ⅰ=> 20 + Ⅰ.a),
          j: ᑕ(ǀ=> 3 + ǀ.a),

          // I like these, because the symbols are clean and symmetrical, and
          // the "ᑕ" looks like a capital "C", for "config". But the characters
          // for recipe, "ᐳ" and "ᐸ", look too much like "<" and ">".
          k: ᐳ(ᑕ=> 3 + ᑕ.a),
          n: ᐸ(ᑕ=> 3 + ᑕ.a),
        }
      );
      assert.equal(config.b, 3);
      assert.equal(config.f, 3);
      assert.equal(config.c, 4);
      assert.equal(config.d, 4);
      assert.equal(config.e, 7);
      assert.equal(config.g, 9);
      assert.equal(config.h, 10);
    });
  }
);
