#! /usr/bin/env fish

set powerups 'expanded paddle power up'
set -a powerups 'shrink paddle power up'
set -a powerups 'self invisible paddle power up'
set -a powerups 'others invisible paddle power up'
set -a powerups 'invisible ball power up'
set -a powerups 'curved outwards paddle power up'
set -a powerups 'curved inwards paddle power up'
set -a powerups 'shaped paddle bumpy power up'
set -a powerups 'colour background power up'
set -a powerups 'self split paddle power up'
set -a powerups 'others split paddle power up'
set -a powerups 'add ball power up'
set -a powerups 'stop aim power up'
set -a powerups 'bomb power up'
set -a powerups 'path trace power up'


set curr 12
for x in $powerups
  echo $x
  echo "fr$curr.puml"
  echo ''
  set curr (math $curr + 1)
end
