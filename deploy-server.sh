#! /usr/bin/env bash

ssh cybera "rm -rf ~/vol/capstone/*"
scp -pr PolyPong-Common cybera:~/vol/capstone/PolyPong-Common
scp -pr server cybera:~/vol/capstone/server
scp docker-compose.yml cybera:~/vol/capstone
scp Dockerfile cybera:~/vol/capstone

ssh cybera "cd ~/vol/capstone && SECRET=$SECRET docker-compose up -d --build"
