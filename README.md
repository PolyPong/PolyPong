# Welcome to PolyPong

PolyPong is a multiplayer online version of the classic game we all know and love. Play with friends, unlock new skins and climb the leaderboard to eternal PolyPong greatness!

# How to build this project
You should not have to set any environment variables to
get the project to run locally. We only use environment variables in the production environment.

## Frontend

The frontend requires that you have npm and node installed.
This was tested with npm version 7.10.0.

If your version of npm is out of date, either update with
your system package manager, or run 

```bash
sudo npm i -g npm@latest
```

On Arch Linux, the installation for npm would look like this:
```bash
sudo pacman -S npm
```

Node should be installed automatically, since it is a
dependency of npm. I cannot guarantee this for your
operating system though, so make sure node is also installed.


First, you'll want to build PolyPong-Common

```bash
cd PolyPong-Common
npm i
npm run build
cd ..
```

Next, install and run the frontend
```bash
cd frontend
npm i
npm start
```

Now, if you open up a browser window,
the frontend should be accessible at
http://localhost:3000

## Backend
There are two ways to get the backend up and running: either using docker or doing a manual installation.

NOTE: The database is left open in this configuration.
(i.e. there is no root password for mongoDB in this configuration)

When deploying for production, you should specify a password
for the database, and also modify the arguments passed to MongoClient
in server/db.ts

### Using Docker
make sure you have the Docker service running.
Open a terminal in the root of this project, and run:

```bash
docker-compose up
```

This was tested with 
```
Docker version 20.10.6, build 370c28948e
docker-compose version 1.29.1
```

The server should be running at
http://0.0.0.0:8443

### Manual installation

First, install mongodb and Deno
on Arch Linux, it would look like this

```bash
sudo pacman -S deno
git clone https://aur.archlinux.org/mongodb-bin.git
cd mongodb-bin
makepkg -si
cd ..
rm -rf mongodb-bin
```
Then, start the mongodb service

```bash
sudo systemctl start mongodb
```

You'll know mongodb is working if you run
```bash
curl localhost:27017
```
and the response is
```
It looks like you are trying to access MongoDB over HTTP on the native driver port.
```

Now, it's time to get the backend working:
```
cd server
deno run --allow-net --allow-env --allow-read server.ts
```

You'll know it's working if you see this in the output:
```
Listening on: http://0.0.0.0:8443
```

This was tested with mongo version
```
MongoDB shell version v4.4.5
Build Info: {
    "version": "4.4.5",
    "gitVersion": "ff5cb77101b052fa02da43b8538093486cf9b3f7",
    "openSSLVersion": "OpenSSL 1.1.1k  25 Mar 2021",
    "modules": [],
    "allocator": "tcmalloc",
    "environment": {
        "distmod": "ubuntu2004",
        "distarch": "x86_64",
        "target_arch": "x86_64"
    }
}
```

and Deno version
```
deno 1.9.0 (release, x86_64-unknown-linux-gnu)
v8 9.1.269.5
typescript 4.2.2
```

# Running automated tests

## Frontend
For the frontend, we have an automated puppeteer test

To run it,

```bash
cd e2e-test
npm i
npm test
```


## Backend
For the backend, here's how you run the tests

```bash
cd server
deno test  --allow-env --allow-net --coverage=coverage --unstable server.ts 
```

To get the code coverage, run this:
```bash
deno coverage --unstable coverage --include="db.ts"
```

