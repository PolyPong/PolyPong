FROM hayd/alpine-deno:1.8.2
#ENV DB_URL=mongodb://mongo:27017

USER deno
WORKDIR /app
ADD . .
RUN deno cache server/server.ts
EXPOSE 5000
CMD ["run", "--allow-net", "--allow-env", "--allow-read", "server/server.ts"]