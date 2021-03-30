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
app.use(oakCors());
app.use(router.routes());
app.use(router.allowedMethods());

router.get("/ws", handleSocket);
await app.listen({ port, hostname: "0.0.0.0" })