#!/bin/bash

if [[ -d "./dist" ]]
then
	rm -rf ./dist
fi

php app.php $1 > example.json && node app.js $1
