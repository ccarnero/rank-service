#!/bin/bash

set -ex

# cd to the root of the repo.
cd ../deploy

echo "Testing 0-base"
tilt ci --file Tiltfile
tilt down --file Tiltfile

# echo "Testing 1-measured"
# tilt ci --file 1-measured/Tiltfile
# tilt down --file 1-measured/Tiltfile

# echo "Testing 2-optimized"
# tilt ci --file 2-optimized-dockerfile/Tiltfile
# tilt down --file 2-optimized-dockerfile/Tiltfile

# echo "Testing 3-recommended"
# tilt ci --file 3-recommended/Tiltfile
# tilt down --file 3-recommended/Tiltfile

# echo "Testing 101-debugger"
# tilt ci --file 101-debugger/Tiltfile
# tilt down --file 101-debugger/Tiltfile

# echo "Testing tests-example"
# tilt ci --file tests-example/Tiltfile
# tilt down --file tests-example/Tiltfile