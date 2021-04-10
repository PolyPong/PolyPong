#! /usr/bin/env bash
deno test --allow-env --allow-net --coverage=coverage --unstable db.ts
deno coverage --unstable coverage
