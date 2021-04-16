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

// FR6 Play Game
export const game_active = writable(false);

// FR6 Play Game
export const all_clients_ready = writable(false);

// FR6 Play Game
export const stop_game_loop = writable(false);

// FR1 User Login
// FR2 User Registration
export const auth0Client = writable<Promise<Auth0Client>>(
  createAuth0Client(config)
);

// FR1 User Login
// FR2 User Registration
export const user = writable<any>({});

// FR1 User Login
// FR2 User Registration
export const popupOpen = writable(false);

// FR28 Select skin
export const skins = writable<[Color]>([Color.White]);

// FR3 Create Game
// FR4 Share Link
// FR5 Join Game
// FR6 Play Game
// FR7 Earn XP
// FR8 Local Leaderboard
// FR9 Global Leaderboard
// FR10 User statistics
// FR11 Power Ups
// FR12 Expanded Paddle
// FR13 Shrink Paddle
// FR14 Self Invisible Paddle
// FR15 Others Invisible Paddle
// FR16 Invisible Ball
// FR17 Self Curved Outwards Paddle
// FR18 Self Curved Inwards Paddle
// FR19 Self Bumpy Paddle
// FR20 Distracting Background
// FR23 Add Ball
// FR26 Path Trace
const SERVER_URL =
  import.meta.env.MODE === "production"
    ? "wss://polyserver.polypong.ca:8443/ws"
    : "ws://localhost:8443/ws";

// FR3 Create Game
// FR4 Share Link
// FR5 Join Game
// FR6 Play Game
// FR7 Earn XP
// FR8 Local Leaderboard
// FR9 Global Leaderboard
// FR10 User statistics
// FR11 Power Ups
// FR12 Expanded Paddle
// FR13 Shrink Paddle
// FR14 Self Invisible Paddle
// FR15 Others Invisible Paddle
// FR16 Invisible Ball
// FR17 Self Curved Outwards Paddle
// FR18 Self Curved Inwards Paddle
// FR19 Self Bumpy Paddle
// FR20 Distracting Background
// FR23 Add Ball
// FR26 Path Trace
export const ws = writable(new WebSocket(SERVER_URL));

// FR3 Create Game
// FR5 Join Game
export const lobby = writable(null);

// FR3 Create Game
// FR5 Join Game
export const lobby_id = writable<string>("");

// FR6 Play Game
export const user_id = writable<string>(v4());

// FR6 Play Game
export const game_info = writable<any>({});

// FR10 User statistics
export const loss_info = writable<any>({});

// FR3 Create Game
// FR4 Share Link
// FR5 Join Game
// FR6 Play Game
// FR7 Earn XP
// FR8 Local Leaderboard
// FR9 Global Leaderboard
// FR10 User statistics
// FR11 Power Ups
// FR12 Expanded Paddle
// FR13 Shrink Paddle
// FR14 Self Invisible Paddle
// FR15 Others Invisible Paddle
// FR16 Invisible Ball
// FR17 Self Curved Outwards Paddle
// FR18 Self Curved Inwards Paddle
// FR19 Self Bumpy Paddle
// FR20 Distracting Background
// FR23 Add Ball
export const game = writable<GameClient>(new GameClient(0, new Ball()));

// FR11 Power Ups
// FR12 Expanded Paddle
// FR13 Shrink Paddle
// FR14 Self Invisible Paddle
// FR15 Others Invisible Paddle
// FR16 Invisible Ball
// FR17 Self Curved Outwards Paddle
// FR18 Self Curved Inwards Paddle
// FR19 Self Bumpy Paddle
// FR20 Distracting Background
export const power_ups_str = writable<string[]>([]);

// FR11 Power Ups
// FR12 Expanded Paddle
// FR13 Shrink Paddle
// FR14 Self Invisible Paddle
// FR15 Others Invisible Paddle
// FR16 Invisible Ball
// FR17 Self Curved Outwards Paddle
// FR18 Self Curved Inwards Paddle
// FR19 Self Bumpy Paddle
// FR20 Distracting Background
export const power_ups_str_long = writable<string[]>([]);

// FR11 Power Ups
// FR12 Expanded Paddle
// FR13 Shrink Paddle
// FR14 Self Invisible Paddle
// FR15 Others Invisible Paddle
// FR16 Invisible Ball
// FR17 Self Curved Outwards Paddle
// FR18 Self Curved Inwards Paddle
// FR19 Self Bumpy Paddle
// FR20 Distracting Background
export const power_up_one_used = writable<boolean>(true);

// FR11 Power Ups
// FR12 Expanded Paddle
// FR13 Shrink Paddle
// FR14 Self Invisible Paddle
// FR15 Others Invisible Paddle
// FR16 Invisible Ball
// FR17 Self Curved Outwards Paddle
// FR18 Self Curved Inwards Paddle
// FR19 Self Bumpy Paddle
// FR20 Distracting Background
export const power_up_two_used = writable<boolean>(true);

// FR11 Power Ups
// FR12 Expanded Paddle
// FR13 Shrink Paddle
// FR14 Self Invisible Paddle
// FR15 Others Invisible Paddle
// FR16 Invisible Ball
// FR17 Self Curved Outwards Paddle
// FR18 Self Curved Inwards Paddle
// FR19 Self Bumpy Paddle
// FR20 Distracting Background
export const power_up_three_used = writable<boolean>(true);

// FR2 User Registration
export const usernameExists = writable<boolean>(false);

// FR9 Global Leaderboard
export const global_leaderboard = writable<LeaderboardEntry[]>([]);

// FR8 Local Leaderboard
export const local_leaderboard = writable<LeaderboardEntry[]>([]);

// FR6 Play Game
export const usernames = writable<[string, number][]>([]);

// FR5 Join Game
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

// FR3 Create Game
// FR4 Share Link
// FR5 Join Game
// FR6 Play Game
// FR7 Earn XP
// FR11 Power Ups
// FR12 Expanded Paddle
// FR13 Shrink Paddle
// FR14 Self Invisible Paddle
// FR15 Others Invisible Paddle
// FR16 Invisible Ball
// FR17 Self Curved Outwards Paddle
// FR18 Self Curved Inwards Paddle
// FR19 Self Bumpy Paddle
// FR20 Distracting Background
// FR23 Add Ball
// FR26 Path Trace
const gotMessage = async (m: MessageEvent) => {
  console.log(m.data);
  try {
    const message = JSON.parse(m.data);
    console.log(message);
    // FR3 Create Game
    if (message.type === "lobby_created") {
      lobby_id.set(message.lobby_id);
      joinGame(message.lobby_id, get(user_id));
      // FR5 Join Game
    } else if (message.type === "join_success") {
      if (message.user_id === get(user_id)) {
        console.log(`${message.user_id} has joined`);
      }
      lobby_id.set(message.lobby_id);
      // FR5 Join Game
    } else if (message.type === "lobby_joined_info") {
      console.log("We is here " + message.usernames);
      usernames.set(message.usernames);
      console.log("Usernames: " + usernames);
      // FR6 Play Game
    } else if (message.type === "game_started") {
      console.log("We got a game_started message from the server");
      game_info.set({
        sides: message.sides,
        my_player_number: message.your_player_number,
        ball: message.ball,
      });
      game_active.set(true);
      router.goto("/game");
      // FR6 Play Game
      // FR11 Power Ups
      // FR12 Expanded Paddle
      // FR13 Shrink Paddle
      // FR14 Self Invisible Paddle
      // FR15 Others Invisible Paddle
      // FR16 Invisible Ball
      // FR17 Self Curved Outwards Paddle
      // FR18 Self Curved Inwards Paddle
      // FR19 Self Bumpy Paddle
      // FR20 Distracting Background
      // FR23 Add Ball
      // FR26 Path Trace
    } else if (message.type === "server_update") {
      const { event, player_number } = message;
      console.log("We are here, about to merge state")
      get(game).mergeState(event, player_number, message.message);

      if (message.message === "game_start") {
        all_clients_ready.set(true);
      }
      // FR6 Play Game
    } else if (message.type === "stop_game") {
      loss_info.set({
        player_number: message.player_number,
        user_id: message.user_id,
      });
      stop_game_loop.set(true);
      // FR5 Join Game
    } else if (message.type === "error"){
      if (message.message === "lobby not found") {
        lobby_id.set("");
        alert("This lobby does not exist. Either this is an invalid lobby ID, or the only other player in the lobby lost connection.");
        router.goto("/home");
      }

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

// FR3 Create Game
// FR4 Share Link
// FR5 Join Game
// FR6 Play Game
// FR7 Earn XP
// FR11 Power Ups
// FR12 Expanded Paddle
// FR13 Shrink Paddle
// FR14 Self Invisible Paddle
// FR15 Others Invisible Paddle
// FR16 Invisible Ball
// FR17 Self Curved Outwards Paddle
// FR18 Self Curved Inwards Paddle
// FR19 Self Bumpy Paddle
// FR20 Distracting Background
// FR23 Add Ball
// FR26 Path Trace
get(ws).addEventListener("message", gotMessage);
