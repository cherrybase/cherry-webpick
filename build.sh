#!/bin/bash

echo 'Building module and globals bundles'
./node_modules/.bin/rollup -i src/loader-module.js -f amd -o build/web_sdk.amd.js -c rollup.config.js
./node_modules/.bin/rollup -i src/loader-module.js -f cjs -o build/web_sdk.cjs.js -c rollup.config.js
./node_modules/.bin/rollup -i src/loader-module.js -f umd -o build/web_sdk.umd.js -n web_sdk -c rollup.config.js
./node_modules/.bin/rollup -i src/loader-globals.js -f iife -o build/web_sdk.globals.js -n web_sdk -c rollup.config.js