import { handleSocket } from "./lobby.ts";

import {
  Application,
  Response,
  Router,
  Status,
} from "https://deno.land/x/oak@v6.5.0/mod.ts";
import { superoak } from "https://deno.land/x/superoak@4.1.0/mod.ts";
import { oakCors } from "https://deno.land/x/cors@v1.2.1/mod.ts";
import { getQuery } from "https://deno.land/x/oak@v6.5.0/helpers.ts";
import dbHelper, { setSkinResponse, users } from "./db.ts";
import { Color } from "../PolyPong-Common/src/Game.ts";

import { verify, decode } from "https://deno.land/x/djwt@v2.2/mod.ts";

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

router.get("/getselectedskin/:userid", async (ctx) => {
  const { userid } = getQuery(ctx, { mergeParams: true });
  const skin = await dbHelper.getSelectedSkin(userid);
  ctx.response.body = skin;
});

router.get("/getwins/:userid", async (ctx) => {
  const { userid } = getQuery(ctx, { mergeParams: true });
  const wins = await dbHelper.getWins(userid);
  ctx.response.body = wins;
});

router.get("/getlosses/:userid", async (ctx) => {
  const { userid } = getQuery(ctx, { mergeParams: true });
  const losses = await dbHelper.getLosses(userid);
  ctx.response.body = losses;
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

  if (!user) {
    ctx.response.status = Status.NoContent;
    return;
  }

  ctx.response.body = user?.username;
})

router.post("/signup", async (ctx) => {
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

  const body = await ctx.request.body({ type: "json" }).value;

  const { username } = body;

  if (!username) {
    ctx.response.status = Status.BadRequest
    ctx.response.body = "Error: no username specified"
    return;
  }

  try {
    console.log("what")
    await dbHelper.addUser(username, email);
    ctx.response.status = Status.NoContent;
    return;
  } catch {
    ctx.response.status = Status.Conflict
    ctx.response.body = `Error: ${username} is already taken or your email already exists under a different username!`
    return;
  }

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
} else if (import.meta.main) {
  await app.listen({ port });
}

const test_setup = async () => {
  // clean db for test
  await users.deleteMany({})
  // add user test
  await dbHelper.addUser("arun", "test@example.com");
  dbHelper.levelUp("arun", 869)
}

const ARUN_TOKEN = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImJoWmJMdFNuWWZjQlY4ZktzdkpRRiJ9.eyJodHRwczovL3BvbHlzZXJ2ZXIucG9seXBvbmcuY2EvZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIiwiaXNzIjoiaHR0cHM6Ly9wb2x5cG9uZy51cy5hdXRoMC5jb20vIiwic3ViIjoiZ29vZ2xlLW9hdXRoMnwxMDMzODA5NzgyNjkwNjI1MzUyNTUiLCJhdWQiOlsiaHR0cHM6Ly9wb2x5c2VydmVyLnBvbHlwb25nLmNhIiwiaHR0cHM6Ly9wb2x5cG9uZy51cy5hdXRoMC5jb20vdXNlcmluZm8iXSwiaWF0IjoxNjE3NzY4NjYxLCJleHAiOjE2MTc4NTUwNjEsImF6cCI6Im1IYXpnbTZmUktYT2dvTHhGWVJodnN0WEpSbDFkU0dDIiwic2NvcGUiOiJvcGVuaWQgcHJvZmlsZSBlbWFpbCJ9Cg.sRn45skCZAGdXCuPBD8u-k5lFSWpuqCd0v4bbl-YQnLso7UlYELLzRfURUFeUuGVMub1mEsnboyrb8623sQHiYRTWjj_X4pAyFLWBmQ96aPBSvsu_joh9X5j-pGJGs_UKitiMp_ugMU6Nr9bsklfslMRoO4YOn3i-uQlH8WPCbMFrVN4V7Nru18T9_YHPgQPKUxHau4hGmT4nbDe3WM466vSWoIUS-Ful2drStwUT9ug7O6gkBZtx3AkTL7toqjgzb8jQu_Rg0DK9hfNC9cukAYIBeP8v36QSnDGwtLMjEuDuCtICt6nr_ecpM15J2WdSsgMFF1dwsBfhkDMPjyI9A"

Deno.test("getxp", async () => {
  test_setup();
  const request = await superoak(app);
  await request.get("/getxp/arun").expect(200).expect("869");
})

Deno.test("whatismyname", async () => {
  await test_setup();
  const request = await superoak(app);
  await request
    .get("/whatismyname")
    .set("Authorization", ARUN_TOKEN)
    .expect(200)
    .expect("arun");
})

Deno.test("leaderboard", async () => {
  await test_setup();
  const request = await superoak(app);
  await request
    .get("/leaderboard")
    .expect(200)
    .expect('[{"username":"arun","xp":0}]');
})
