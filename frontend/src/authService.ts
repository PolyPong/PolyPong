// src/authService.js

import createAuth0Client, { Auth0Client } from "@auth0/auth0-spa-js";
import { popupOpen, user } from "./store";
import config from "./auth_config";

// FR1 User Login
// FR2 User Registration
async function createClient() {
  let auth0Client = await createAuth0Client({
    domain: config.domain,
    client_id: config.clientId,
  });

  return auth0Client;
}

// FR1 User Login
// FR2 User Registration
async function loginWithPopup(client: Auth0Client, options: any) {
  popupOpen.set(true);
  try {
    await client.loginWithPopup(options);

    user.set(await client.getUser());
  } catch (e) {
    // eslint-disable-next-line
    console.error(e);
  } finally {
    popupOpen.set(false);
  }
}

// FR1 User Login
// FR2 User Registration
async function loginWithRedirect(client: Auth0Client, options: any) {
  try {
    await client.loginWithRedirect(options);

    user.set(await client.getUser());
  } catch (e) {
    // eslint-disable-next-line
    console.error(e);
  } finally {
  }
}

// FR1 User Login
// FR2 User Registration
function logout(client: Auth0Client) {
  return client.logout();
}

const auth = {
  createClient,
  loginWithPopup,
  logout,
  loginWithRedirect,
};

export default auth;
