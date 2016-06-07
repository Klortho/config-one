#!/bin/bash
# This is run from `npm run`, so current working directory is the project root.

C1_BUILD_UUT=${C1_BUILD_UUT:-src}
C1_BUILD_TARGET=${C1_BUILD_TARGET:-node}

if [ "$C1_BUILD_DEBUG" = "true" ]; then
  echo "test/run.sh: C1_BUILD_UUT = $C1_BUILD_UUT"
  echo "test/run.sh: C1_BUILD_TARGET = $C1_BUILD_TARGET"
fi

if [ "$C1_BUILD_UUT" = "dist" ] && [ ! -f 'dist/config1.js' ]; then
  echo Did you forget to build the distribution bundle first?
  echo It should be in dist/config1.json.
  exit 1
fi

TEST_FILES=`find ./test -name '*.test.js'`
if [ "$C1_BUILD_DEBUG" = "true" ]; then
  echo "test/run.sh: TEST_FILES: $TEST_FILES"
fi

mocha -R nyan $TEST_FILES
