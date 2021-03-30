import {
  acceptable,
  acceptWebSocket,
} from "https://deno.land/std@0.84.0/ws/mod.ts";
import lobby, { handleSocket } from "./lobby.ts";

import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import { oakCors } from "https://deno.land/x/cors/mod.ts";

const app = new Application();
const port: number = 5000;

app.addEventListener("listen", ({ secure, hostname, port }) => {
  const protocol = secure ? "https://" : "http://";
  const url = `${protocol}${hostname ?? "localhost"}:${port}`;
  console.log(`Listening on: ${url}`);
});

const router = new Router();
// app.use(
//   oakCors({
//     origin: "http://localhost:5000"
//   }),
// );


router.get("/ws", handleSocket);
router.get("/test", ({ response }: { response: any }) => {
  response.body = {
    message: "https://xkcd.com/1739/",
  };
});

app.use(oakCors());
app.use(router.routes());
app.use(router.allowedMethods());

const MODE = Deno.env.get("MODE") ?? "development";

if (MODE === "production") {
  await app.listen({ port, hostname: "0.0.0.0", certFile: "/app/server/cert.pem", keyFile: "/app/server/key.pem", secure: true });
} else {
  await app.listen({ port });
}