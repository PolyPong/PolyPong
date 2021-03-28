import {
  acceptable,
  acceptWebSocket,
} from "https://deno.land/std@0.84.0/ws/mod.ts";

import { Application, Context, Router } from "https://deno.land/x/oak/mod.ts";
import { v4 } from "https://deno.land/std@0.84.0/uuid/mod.ts";

import {
  ClientAction,
  ErrorPayload,
  LobbyCreatedPayload,
  LobbyJoinedPayload,
  ServerEvent,
  ServerExistsResponse,
  Game,
  ServerUpdate,
  Ball
} from "../PolyPong-Common/src/Game.ts";

import { GameServer } from "./Game.ts"

import dbHelper from "./db.ts";

class Lobby {
  userlist: Map<string, WebSocket>;
  lobby_id: string;
  game: GameServer;
  ready_count = 0;

  constructor(lobby_id: string) {
    this.userlist = new Map();
    this.lobby_id = lobby_id;
    this.game = new GameServer(new Map()); // will be replaced by setGame
  }

  setGame(game: GameServer) {
    this.game = game;
  }

  joinGame(user_id: string, ws: WebSocket) {
    this.userlist.set(user_id, ws);

    const response: LobbyJoinedPayload = {
      type: "lobby_joined_info",
      user_id,
    };
    this.broadcast(JSON.stringify(response), user_id);
    ws.send("success joining game");
  }

  broadcast(message: string, ignore: string | undefined) {
    //console.log("broadcasting message", message)
    for (const [k, v] of this.userlist.entries()) {
      if (k === ignore) {
        continue;
      }
      v.send(message);
    }
  }

  mergeGameState(game: Game, player_number: number) {
    this.game!.mergeState(game, player_number, undefined);
  }

  incrementReady() {
    this.ready_count += 1;
  }
  checkReady() {

    if (this.ready_count < this.userlist.size) {
      return
    }

    this.startGame();
  }

  startGame() {
    const payload: ServerUpdate = {

      type: "server_update",
      event: this.game,
      player_number: undefined,
      message: "game_start",
    }
    
    for (const p of payload.event.players){
      p.websocketConnection = null;
    }
    this.broadcast(JSON.stringify(payload), undefined)
  }
}

// global
// this dies if the server dies
const LOBBIES: Map<string, Lobby> = new Map();

export const createLobby: () => string = () => {
  const lobby_id = v4.generate();
  const lobby = new Lobby(lobby_id);
  LOBBIES.set(lobby_id, lobby);
  return lobby_id;
};

const doStuff = async (ws: any) => {
  for await (const event of ws) {
    console.log("got message", event);
    // in case parsing fails, we wrap in a try/catch
    try {
      const message = JSON.parse(event);
      if (message.type === "join_game") {
        const lobby = LOBBIES.get(message.lobby_id);
        if (!lobby) {
          const response: ErrorPayload = {
            type: "error",
            message: "lobby not found",
          };
          ws.send(JSON.stringify(response));
          continue;
        }
        lobby.joinGame(message.user_id, ws);
        continue;
      } else if (message.type === "create_lobby") {
        const lobby_id = createLobby();
        const response: LobbyCreatedPayload = {
          type: "lobby_created",
          lobby_id,
        };
        ws.send(JSON.stringify(response));
      } else if (message.type === "start_game") {
        const { lobby_id } = message;
        const lobby = LOBBIES.get(lobby_id);
        if (!lobby) {
          const response: ErrorPayload = {
            type: "error",
            message: "lobby not found",
          };
          ws.send(JSON.stringify(response));
          continue;
        }

        const game = new GameServer(lobby.userlist);
        lobby.setGame(game);
      } else if (message.type === "client_update") {
        const { lobby_id } = message;
        const lobby = LOBBIES.get(lobby_id);
        if (!lobby) {
          const response: ErrorPayload = {
            type: "error",
            message: "lobby not found",
          };
          ws.send(JSON.stringify(response));
          continue;
        }
        const { player_id, event, player_number } = message;
        lobby!.mergeGameState(event, player_number);

        const payload: ServerEvent = {
          type: "server_update",
          // @ts-ignore
          event: lobby!.game.jsonify(),
          player_number,
          message: undefined,
        };
        lobby!.broadcast(JSON.stringify(payload), player_id);
      } else if (message.type === "check_exists") {
        const field = message.field;
        const str = message.str;
        const strExists = await dbHelper.checkExists(field, str);
        console.log("strExists: ", strExists);
        const response: ServerExistsResponse = {
          type: "check_exists",
          field: field,
          str: str,
          exists: false,
        };
        if (strExists) {
          response.exists = true;
        }
        ws.send(JSON.stringify(response));
      } else if (message.type === "create_user") {
        dbHelper.addUser(message.username, message.email);
      } else if (message.type === "client_ready") {
        const { lobby_id } = message;
        const lobby = LOBBIES.get(lobby_id);
        if (!lobby) {
          const response: ErrorPayload = {
            type: "error",
            message: "lobby not found",
          };
          ws.send(JSON.stringify(response));
          continue;
        }
        lobby.incrementReady();
        lobby.checkReady();
      }
    } catch (e) {
      console.error(
        `got message: ${event} failed to parse it as json, so ignoring...`,
      );
      console.error(e);
      continue;
    }
  }
};

const handleSocket = async (ctx: Context) => {
  console.log(ctx);
  if (acceptable(ctx.request.serverRequest)) {
    const { conn, r: bufReader, w: bufWriter, headers } =
      ctx.request.serverRequest;
    const socket = await acceptWebSocket({
      conn,
      bufReader,
      bufWriter,
      headers,
    });
    await doStuff(socket);
  }
};

export { handleSocket };
export default Lobby;
