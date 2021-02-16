// src/authService.js

import createAuth0Client from "@auth0/auth0-spa-js";
import { isAuthenticated, popupOpen, user } from "./store";
import config from "./auth_config";

async function createClient() {
  let auth0Client = await createAuth0Client({
    domain: config.domain,
    client_id: config.clientId,
  });

  return auth0Client;
}

async function loginWithPopup(client, options) {
  popupOpen.set(true);
  try {
    await client.loginWithPopup(options);

    user.set(await client.getUser());
    isAuthenticated.set(true);
  } catch (e) {
    // eslint-disable-next-line
    console.error(e);
  } finally {
    popupOpen.set(false);
  }
}

const loginWithRedirect = async (client, options) => {
  try {
    await client.loginWithRedirect({
      redirect_uri: "http://localhost:8080/",
    });
    //logged in. you can get the user profile like this:
    user.set(await client.getUser());
    isAuthenticated.set(true);
  } catch (e) {
    // eslint-disable-next-line
    console.error(e);
  }
};

function logout(client) {
  return client.logout();
}

const auth = {
  createClient,
  loginWithPopup,
  loginWithRedirect,
  logout,
};

export default auth;
