import type { Auth0ClientOptions } from "@auth0/auth0-spa-js";

const redirect_uri = import.meta.env.MODE === "production" ? "https://polypong.ca/#/callback" : "http://localhost:3000/#/callback"
const config: Auth0ClientOptions = {
  domain: "polypong.us.auth0.com",
  client_id: "mHazgm6fRKXOgoLxFYRhvstXJRl1dSGC",
  redirect_uri,
  //  cacheLocation: 'localstorage',
  audience: "https://polyserver.polypong.ca",
};

export default config;
