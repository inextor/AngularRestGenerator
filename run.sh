#!/bin/bash


if [[ ! -d "./akou" ]]
then
	git clone git@github.com:inextor/akou.git
fi

if [[ -d "./dist" ]]
then
	rm -rf ./dist
fi

php app.php $1 > example.json && node app.js $1
