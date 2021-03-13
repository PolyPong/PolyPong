#! /usr/bin/env /bin/bash

for f in *.puml
do
  plantuml -tsvg $f -o output/ &
done
wait
