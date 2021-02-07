import { Context } from "https://deno.land/x/oak/mod.ts";
import { verify } from "https://deno.land/x/djwt/mod.ts";
import key from "./key.ts";

const authMiddleware = async (ctx: Context, next: any) => {
  const headers: Headers = ctx.request.headers;
  // Taking JWT from Authorization header and comparing if it is valid JWT token, if YES - we continue,
  // otherwise we return with status code 401
  const authorization = headers.get("Authorization");
  console.log(authorization);
  if (!authorization) {
    ctx.response.status = 401;
    return;
  }
  const jwt = authorization.split(" ")[1];
  if (!jwt) {
    ctx.response.status = 401;
    return;
  }
  console.log("I made it here", jwt);
  let v;
  try {
    v = await verify(jwt, key, "HS512");
  } catch (e: any) {
    console.log(e);
  }
  console.log(v);
  if (v) {
    console.log("hey");
    await next();
    return;
  }

  console.log("uh oh");

  ctx.response.status = 401;
  ctx.response.body = { message: "Invalid jwt token" };
};

export default authMiddleware;
