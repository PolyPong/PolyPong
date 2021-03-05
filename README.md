# Welcome to PolyPong

PolyPong is a multiplayer online version of the classic game we all know and love. Play with friends, unlock new skins and climb the leaderboard to eternal PolyPong greatness!

# How to install packages

We made a PolyPong-common package which holds types for both the server and the frontend.
To be able to install it, you need to create a personal access token in GitHub:

https://github.com/settings/tokens


give it the repo:write permission and then copy the token

copy the .npmrc file in the root of this repo to ~/.npmrc
add the token you just copied to the file

then cd into frontend, type npm install and watch it go brrrrrrrrrrrrr

I ditched yarn because it doesn't seem to work well with github's package registry
