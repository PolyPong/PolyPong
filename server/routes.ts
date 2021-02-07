import { Context } from "https://deno.land/x/oak/mod.ts";
import {
  create,
  getNumericDate,
  Header,
  Payload,
} from "https://deno.land/x/djwt/mod.ts";

import key from "./key.ts";
import users, { User } from "./users.ts";
import { sendEmail } from "./sendemail.ts";

const header: Header = {
  alg: "HS512",
  typ: "JWT",
};

export const login = async (ctx: Context) => {
  const body = await ctx.request.body();
  const value = await body.value;

  const user = await users.find((u: User) => u.email === value.email);
  console.log(value);
  ctx.response.status = 200;
  ctx.response.body = {
    message: "Check your email!",
  };

  // if the user is not found we don't want to show an error because otherwise
  // the site can be scraped and then we leak valid emails
  if (!user) {
    return;
  }

  const payload: Payload = {
    iss: user.username,
    exp: getNumericDate(600), // 10 minute expiry
  };

  const jwt = await create(header, payload, key);

  if (jwt) {
    ctx.response.status = 200;
    ctx.response.body = {
      id: user.id,
      username: user.username,
      jwt,
    };

    // await sendEmail(jwt);
    console.log("here's your jwt bro", jwt);
  } else {
    ctx.response.status = 500;
    ctx.response.body = {
      message: "Internal server error",
    };
  }
};

export const guest = (ctx: Context) => {
  ctx.response.body = "Guest success";
};

export const auth = async (ctx: Context) => {
  const payload: Payload = {
    iss: "test",
  };

  const jwt = await create(header, payload, key);
  ctx.response.body = {
      message: "Here's your non expiring token",
      token: jwt

    }
};
