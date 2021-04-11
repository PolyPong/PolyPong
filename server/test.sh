#! /usr/bin/env bash
deno test --allow-env --allow-net --coverage=coverage --unstable server.ts
deno coverage --unstable coverage
