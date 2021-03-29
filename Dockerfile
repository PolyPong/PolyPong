FROM hayd/deno-alpine:1.8.2
#ENV DB_URL=mongodb://mongo:27017

WORKDIR /app
COPY PolyPong-Common PolyPong-Common
COPY server server
RUN deno cache server/server.ts
EXPOSE 5000
# USER deno
CMD ["run", "--allow-net", "--allow-env", "server/server.ts"]