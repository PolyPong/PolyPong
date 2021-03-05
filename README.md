# Welcome to PolyPong

PolyPong is a multiplayer online version of the classic game we all know and love. Play with friends, unlock new skins and climb the leaderboard to eternal PolyPong greatness!

# How to install packages

Edit: Actually it looks like you can do a relative import in package.json lol that makes this SO much easier
and then we don't have to worry about out-of-sync versions lol

tl;dr ignore everything after this line, and yarn probably still works


We made a PolyPong-common package which holds types for both the server and the frontend.
To be able to install it, you need to create a personal access token in GitHub:

https://github.com/settings/tokens


give it the repo:write permission and then copy the token

copy the .npmrc file in the root of this repo to ~/.npmrc
add the token you just copied to the file

then cd into frontend, type npm install and watch it go brrrrrrrrrrrrr

I ditched yarn because it doesn't seem to work well with github's package registry

To make a new version, you need to change the version in package.json, run npm publish, and hope it works