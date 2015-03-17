#!/bin/sh

npm install

cd ../js
for file in $(ls); do
    echo "$file"
    name="${file%.*}"
    echo "$name"
    ../doc/node_modules/.bin/jsdoc $file -d ../doc/jsdoc/$name
    node ../doc/replace.js $name
done
