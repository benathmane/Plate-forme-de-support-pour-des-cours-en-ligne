#!/bin/sh

## Port that the node api app runs on
export PORT=3080

## Test database to use
export MONGO_DATABASE=mytest_db

## DO NOT CHANGE -- Flag that will let you run the test Makefile.  This was done so that you
## don't accidentally run make test and overwrite your dev database.
export TRIVIA_TEST_MODE=test_mode_is_enabled

if [ -z `which mongo` ]; then
  echo "ERROR: The command 'which mongo' returned nothing.  Need to have the mongo shell on your path."
  exit 1
fi

echo "Dropping database: $MONGO_DATABASE"
mongo $MONGO_DATABASE --eval "db.dropDatabase()" 2>&1 >/dev/null

LOG_FILE=test.log

node server.js > $LOG_FILE 2>&1 &
## Grab PID of background process
NODE_PID=$!
echo "Node.js app launching on PID: ${NODE_PID}.  Starting tests in 3 seconds.  Log files for the Node.js app are logged to $LOG_FILE"

## Give about 3 sec for the node process to completely startup
sleep 3

make test

## Kill background node process
kill $NODE_PID
