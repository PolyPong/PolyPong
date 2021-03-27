import Lobby from "./routes/Lobby.svelte";
import { derived, writable } from "svelte/store";
import type {Game, JoinGamePayload, CreateUser } from "@polypong/polypong-common";
import { get } from "svelte/store";
import {router } from "tinro";
import createAuth0Client, { Auth0Client } from "@auth0/auth0-spa-js";
import config from "./auth_config";
import {GameClient} from "./Game";


export const isAuthenticated = writable(false);
export const auth0Client = writable<Promise<Auth0Client>>(
  createAuth0Client({
    domain: config.domain,
    client_id: config.clientId,
  })
);
export const user = writable<any>({});
export const popupOpen = writable(false);
export const error = writable(null);

export const ws = writable(new WebSocket("ws://localhost:5000/ws"));

export const lobby = writable(null);

export const lobby_id = writable<string>("");
export const user_id = writable<string>("");

export const game_info = writable<any>({});

export const game = writable<Game>(new GameClient(0));

export const usernameExists = writable<boolean>(false);

export const joinGame = (input: string | undefined, user_id: string) => {
  const payload: JoinGamePayload = {
    type: "join_game",
    lobby_id: !!input ? input : get(lobby_id),
    user_id,
  };
  get(ws).send(JSON.stringify(payload));
  lobby_id.set(!!input ? input : get(lobby_id));
};

const gotMessage = async (m: MessageEvent) => {
  console.log(m.data);
  try {
    const message = JSON.parse(m.data);
    console.log(message);
    if (message.type === "lobby_created") {
      lobby_id.set(message.lobby_id);
      joinGame(message.lobby_id, get(user_id));
    } else if (message.type === "join_success") {
      if (message.user_id === get(user_id)) {
          console.log(`${message.user_id} has joined`)
      }
      lobby_id.set(message.lobby_id)
    } else if (message.type === "game_started"){
        game_info.set({
            sides: message.sides,
            my_player_number: message.your_player_number,
        });
        router.goto("/game");
    } else if (message.type === "server_update") {
      const {event, player_number} = message;
      console.log(get(game));
      get(game).mergeState(event, player_number);
    } else if (message.type === "check_exists") {
      // If email already exists in the database, redirect to login.svelte
      // Otherwise redirect to the sign up page and allow the user to choose a username
      if (message.field === "email"){
        if (message.exists){
          router.goto("/login");
        } else {
          router.goto("/signup");
        }
      } else if (message.field === "username"){
        if (message.exists){
          console.log("Username already exists");
          usernameExists.set(true);
        } else {
          console.log("Username does not exist yet");
          const request: CreateUser = {
            type: "create_user",
            username: message.str,
            email: get(user).email,
          }
          get(ws).send(JSON.stringify(request));
          console.log("Request to create user has been sent");
          router.goto("/login");
        }
      } else {
        console.log("Error. Unrecognized field")
      }
    }
  } catch (e) {
    console.error(
      `got message: ${m.data} failed to parse it as json, so ignoring...`,
    );
    console.error(e)
  }
};
get(ws).addEventListener("message", gotMessage);
