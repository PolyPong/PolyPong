import { handleSocket } from "./lobby.ts";

import {
  Application,
  Response,
  Router,
  Status,
} from "https://deno.land/x/oak/mod.ts";
import { oakCors } from "https://deno.land/x/cors/mod.ts";
import { getQuery } from "https://deno.land/x/oak/helpers.ts";
import dbHelper, { setSkinResponse } from "./db.ts";
import { Color } from "../PolyPong-Common/src/Game.ts";

import { verify, decode } from "https://deno.land/x/djwt/mod.ts";

const SECRET = Deno.env.get("SECRET") ?? "secret was not set";

const app = new Application();
const port = Deno.env.get("PORT") ? +Deno.env.get("PORT")! : 5000;

app.addEventListener("listen", ({ secure, hostname, port }) => {
  const protocol = secure ? "https://" : "http://";
  const url = `${protocol}${hostname ?? "localhost"}:${port}`;
  console.log(`Listening on: ${url}`);
});

const router = new Router();

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
});

router.get("/getavailableskins/:userid", async (ctx) => {
  const { userid } = getQuery(ctx, { mergeParams: true });
  const skins = await dbHelper.getAvailableSkins(userid);
  ctx.response.body = skins;
});

router.post("/setskin", async (ctx) => {
  const skinstr = await ctx.request.body({ type: "text" }).value;
  if (!(Object.values(Color).includes(skinstr as Color))) {
    ctx.response.body = "Error: Invalid skin";
    ctx.response.status = Status.BadRequest;
    return;
  }
  const skin = skinstr as Color;
  const jwt = ctx.request.headers.get("Authorization");
  if (!jwt) {
    ctx.response.body = "Error: JWT not in header";
    ctx.response.status = Status.Unauthorized;
    return;
  }
  try {
    console.log("about to verify token")
    console.log(jwt)
    // todo: wait for response from https://github.com/timonson/djwt/issues/47
    // const payload = await verify(jwt, SECRET, "RS256");

    const [_, payload, __]: [_: any, payload: any, __: any] = decode(jwt);
    console.log(payload)
    const email: string = payload["https://polyserver.polypong.ca/email"]
    console.log(email)
    const res: setSkinResponse = await dbHelper.setSkin(email as string, skin);
    switch (res) {
      case setSkinResponse.ErrorUpdating:
        console.log("errrorupdating")
      case setSkinResponse.UserNotFound:
        console.log('i get printed')
        ctx.response.status = Status.InternalServerError;
        return;
      case setSkinResponse.LevelTooLow:
        ctx.response.body = "Error: your XP is too low for that skin";
        ctx.response.status = Status.Forbidden;
        return;
      case setSkinResponse.Success:
        ctx.response.status = Status.NoContent;
        return;
    }
  } catch (e) {
    // verify failed
    console.error(e)
    ctx.response.body = "Error: invalid JWT";
    ctx.response.status = Status.Unauthorized;
  }
});

router.get("/leaderboard", async (ctx) => {
  ctx.response.body = await dbHelper.getGlobalLeaderboard();
});

router.get("/localleaderboard/:userid", async (ctx) => {
  const { userid } = getQuery(ctx, { mergeParams: true });
  const leaderboard = await dbHelper.getLocalLeaderboard(userid);
  ctx.response.body = leaderboard;
});

router.get("/whatismyname", async (ctx) => {
  const jwt = ctx.request.headers.get("Authorization");
  if (!jwt) {
    ctx.response.body = "Error: JWT not in header";
    ctx.response.status = Status.Unauthorized;
    return;
  }
  console.log("about to verify token")
  console.log(jwt)
  // todo: wait for response from https://github.com/timonson/djwt/issues/47
  // const payload = await verify(jwt, SECRET, "RS256");

  const [_, payload, __]: [_: any, payload: any, __: any] = decode(jwt);
  console.log(payload)
  const email: string = payload["https://polyserver.polypong.ca/email"]
  const user = await dbHelper.getUserbyEmail(email)

  ctx.response.body = user?.username;
})

const MODE = Deno.env.get("MODE") ?? "development";
if (MODE === "production") {
  app.use(oakCors({
    origin: "https://polypong.ca",
  }));
} else {
  app.use(oakCors());
}
app.use(router.routes());
app.use(router.allowedMethods());

if (MODE === "production") {
  await app.listen({
    port,
    hostname: "0.0.0.0",
    certFile: "/app/server/cert.pem",
    keyFile: "/app/server/key.pem",
    secure: true,
  });
} else {
  await app.listen({ port });
}
