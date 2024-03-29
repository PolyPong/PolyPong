#! /usr/bin/env bash

ssh cybera "rm -rf ~/vol/capstone/*"
rm -rf PolyPong-Common/node_modules
scp -pr PolyPong-Common cybera:~/vol/capstone/PolyPong-Common
rm -rf server/coverage
scp -pr server cybera:~/vol/capstone/server
scp docker-compose.yml cybera:~/vol/capstone
scp Dockerfile cybera:~/vol/capstone

ssh cybera "cd ~/vol/capstone && SECRET=$SECRET MODE=production docker-compose up -d --build"
