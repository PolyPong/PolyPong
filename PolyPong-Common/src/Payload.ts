// // this one is for the npm module
// import { GameClient } from "./Game";

// this one is for deno
// @ts-ignore
import { GameClient } from "./Game.ts";

export interface CheckExists {
  type: "check_exists";
  field: string;
  str: string;
}

export interface ServerExistsResponse {
  type: "check_exists";
  field: string;
  str: string;
  exists: boolean;
}

export interface CreateUser {
  type: "create_user";
  username: string;
  email: boolean;
}

export interface LobbyJoinedPayload {
  type: "lobby_joined_info";
  user_id: string;
}

export interface JoinGamePayload {
  type: "join_game";
  lobby_id: string;
  user_id: string;
}

export interface LobbyCreatedPayload {
  type: "lobby_created";
  lobby_id: string;
}

export interface SomeoneElseJoined {
  type: "join_success";
  user_id: string;
  lobby_id: string;
}

export interface ErrorPayload {
  type: "error";
  message: string;
}

export interface CreateLobbyRequest {
  type: "create_lobby";
}

export interface StartGameRequest {
  type: "start_game";
  lobby_id: string;
}

export interface ServerSaysGameStarted {
  type: "game_started";
  sides: number;
  your_player_number: number;
}

type ServerEvent =
  | ErrorPayload
  | LobbyJoinedPayload
  | SomeoneElseJoined
  | LobbyCreatedPayload
  | ServerUpdate;
type ClientAction = JoinGamePayload | CreateLobbyRequest | ClientUpdate;

export type { ClientAction, ServerEvent };

export interface ClientUpdate {
  type: "client_update";
  player_id: string;
  player_number: number;
  lobby_id: string;
  event: GameClient;
}

export interface ServerUpdate {
  type: "server_update",
  event: GameClient,
  player_number: number
}