import {
  acceptable,
  acceptWebSocket,
} from "https://deno.land/std@0.84.0/ws/mod.ts";
import lobby, { handleSocket } from "./lobby.ts";

import { Application, Router, Response } from "https://deno.land/x/oak/mod.ts";
import { oakCors } from "https://deno.land/x/cors/mod.ts";
import { getQuery } from 'https://deno.land/x/oak/helpers.ts'
import dbHelper from "./db.ts"

const app = new Application();
const port = Deno.env.get("PORT") ? +Deno.env.get("PORT")! : 5000;

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
router.get("/test", ({ response }: { response: Response }) => {
  response.body = {
    message: "https://xkcd.com/1739/",
  };
});
router.get("/getxp/:userid", async (ctx) => {
  const { userid } = getQuery(ctx, { mergeParams: true });
  const xp = await dbHelper.getXP(userid);
  ctx.response.body = xp;
})

router.get("/getavailableskins/:userid", async (ctx) => {
  const { userid } = getQuery(ctx, { mergeParams: true });
  const skins = await dbHelper.getAvailableSkins(userid);
  ctx.response.body = skins;
})

const MODE = Deno.env.get("MODE") ?? "development";
if (MODE === "production") {
  app.use(oakCors({
    origin: "https://polypong.ca"
  }));
} else {
  app.use(oakCors());
}
app.use(router.routes());
app.use(router.allowedMethods());



if (MODE === "production") {
  await app.listen({ port, hostname: "0.0.0.0", certFile: "/app/server/cert.pem", keyFile: "/app/server/key.pem", secure: true });
} else {
  await app.listen({ port });
}