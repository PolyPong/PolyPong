import { derived, writable } from "svelte/store";
import { v4 } from "uuid";
import { Ball, Color, PowerupStrings } from "@polypong/polypong-common";
import type {
  JoinGamePayload,
  CreateUser,
  LeaderboardEntry,
} from "@polypong/polypong-common";
import { get } from "svelte/store";
import { router } from "tinro";
import createAuth0Client, { Auth0Client } from "@auth0/auth0-spa-js";
import config from "./auth_config";
import { GameClient } from "./Game";

export const game_active = writable(false);
export const all_clients_ready = writable(false);
export const stop_game_loop = writable(false);
export const auth0Client = writable<Promise<Auth0Client>>(
  createAuth0Client(config)
);
export const user = writable<any>({});
export const popupOpen = writable(false);
export const error = writable(null);
export const skins = writable<[Color]>([Color.White]);

const SERVER_URL =
  import.meta.env.MODE === "production"
    ? "wss://polyserver.polypong.ca:8443/ws"
    : "ws://localhost:5000/ws";
export const ws = writable(new WebSocket(SERVER_URL));
//export const ws = writable(new WebSocket("wss://polyserver.polypong.ca:8443/ws"));

export const lobby = writable(null);

export const lobby_id = writable<string>("");
export const user_id = writable<string>(v4());

export const game_info = writable<any>({});
export const loss_info = writable<any>({});

export const game = writable<GameClient>(new GameClient(0, new Ball()));
export const power_ups_str = writable<PowerupStrings[]>([]);
export const power_up_one_used = writable<boolean>(true);
export const power_up_two_used = writable<boolean>(true);
export const power_up_three_used = writable<boolean>(true);

export const usernameExists = writable<boolean>(false);

export const global_leaderboard = writable<LeaderboardEntry[]>([]);
export const local_leaderboard = writable<LeaderboardEntry[]>([]);

export const usernames = writable<[string, number][]>([]);

export const joinGame = (input: string | undefined, user_id: string) => {
  const username = get(user)?.username;
  console.log("Username in store.ts righ before sending a join game: " + username);

  const payload: JoinGamePayload = {
    type: "join_game",
    lobby_id: !!input ? input : get(lobby_id),
    user_id,
    username: username,
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
        console.log(`${message.user_id} has joined`);
      }
      lobby_id.set(message.lobby_id);
    } else if (message.type === "lobby_joined_info") {
      usernames.set(message.usernames);
      console.log("Usernames: " + usernames);
    } else if (message.type === "game_started") {
      console.log("We got a game_started message from the server");
      game_info.set({
        sides: message.sides,
        my_player_number: message.your_player_number,
        ball: message.ball,
      });
      game_active.set(true);
      router.goto("/game");
    } else if (message.type === "server_update") {
      const { event, player_number } = message;
      console.log("We are here, about to merge state")
      get(game).mergeState(event, player_number, message.message);

      if (message.message === "game_start") {
        all_clients_ready.set(true);
      }
    } else if (message.type === "stop_game") {
      loss_info.set({
        player_number: message.player_number,
        user_id: message.user_id,
      });
      stop_game_loop.set(true);
    } else if (message.type === "error"){
      if(message.message === "Game in Progress"){
        lobby_id.set("");
        alert("This game has already started");
      }
    }
    else {
      console.log("unrecognized message from server", message);
    }
  } catch (e) {
    console.error(
      `got message: ${m.data} failed to parse it as json, so ignoring...`
    );
    console.error(e);
  }
};
get(ws).addEventListener("message", gotMessage);
