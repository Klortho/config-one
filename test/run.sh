#!/bin/bash
# This is run from `npm run`, so current working directory is the project root.
# 

UUT=${C1_UUT:-src}
TARGET=${C1_TARGET:-node}
DEBUG=${C1_DEBUG:-false}

if [ "$DEBUG" = "true" ]; then
  echo "test/run.sh: C1_UUT = $UUT"
  echo "test/run.sh: C1_TARGET = $TARGET"
fi

DIST_BUNDLE='dist/config-one.js'
if [ "$UUT" = "dist" ] && [ ! -f $DIST_BUNDLE ]; then
  echo "Did you forget to build the distribution bundle first?"
  echo "It should be in $DIST_BUNDLE."
  exit 1
fi

TEST_FILES=`find ./test -name '*.test.js'`
#if [ "$DEBUG" = "true" ]; then
  echo "test/run.sh: Running tests on these sources: $TEST_FILES"
#fi

# Using the mochawesome reporter.
REPORT_DIR="test/reports/$UUT"
mocha -R mochawesome --reporter-options \
  "$REPORT_DIR=test/reports/src,reportName=test-report" $TEST_FILES

## Another great reporter (console):
#mocha -R nyan $TEST_FILES
