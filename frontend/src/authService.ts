import createAuth0Client from "@auth0/auth0-spa-js";
import { isAuthenticated, popupOpen, user } from "./store";
import config from "./auth_config";

const createClient = async () => {
  let auth0Client = await createAuth0Client({
    domain: config.domain,
    client_id: config.clientId,
  });

  return auth0Client;
};

const loginWithPopup = async (client: any, options: any) => {
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
};

const logout = async (client) => {
  return client.logout();
};

const auth = {
  createClient,
  loginWithPopup,
  logout,
};

export default auth;
