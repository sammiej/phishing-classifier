#!/bin/bash

scriptdir="$(dirname "$0")"
cd $scriptdir

# Run the unit tests
NODE_ENV="test" mocha *.spec.js
