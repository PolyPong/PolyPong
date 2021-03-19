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
  | LobbyCreatedPayload;
type ClientAction = JoinGamePayload | CreateLobbyRequest;

export type { ClientAction, ServerEvent };
