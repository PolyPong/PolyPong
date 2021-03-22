import Lobby from "./routes/Lobby.svelte";
import { derived, writable } from "svelte/store";
import type { JoinGamePayload } from "@polypong/polypong-common";
import { get } from "svelte/store";
import {router } from "tinro";
import type { Auth0Client } from "@auth0/auth0-spa-js";
import auth from "./authService";

export const isAuthenticated = writable(false);
export const auth0Client = writable<Promise<Auth0Client>>(auth.createClient());
export const user = writable<any>({});
export const popupOpen = writable(false);
export const error = writable(null);

export const ws = writable(new WebSocket("ws://localhost:5000/ws"));

export const lobby = writable(null);

export const lobby_id = writable<string>("");
export const user_id = writable<string>("");

export const game_info = writable<any>({});

export const joinGame = (input: string | undefined, user_id: string) => {
  const payload: JoinGamePayload = {
    type: "join_game",
    lobby_id: !!input ? input : get(lobby_id),
    user_id,
  };
  get(ws).send(JSON.stringify(payload));
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
    } else if (message.type === "game_started"){
        game_info.set({
            sides: message.sides,
            my_player_number: message.your_player_number,
        });
        router.goto("/game");
    }
  } catch (e) {
    console.error(
      `got message: ${m.data} failed to parse it as json, so ignoring...`,
    );
  }
};
get(ws).addEventListener("message", gotMessage);
