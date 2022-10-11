#!/bin/bash

# Start the first process
yarn run watch &

# Start the second process
yarn run lite-server &

# Wait for any process to exit
wait -n

# Exit with status of process that exited first
exit $?
