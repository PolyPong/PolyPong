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
  Ball,
  ClientUpdateMessage,
  ServerSaysStopGame,
  SetSkinResponse,
  GetAvailableSkinsResponse,
  LocalLeaderboard,
  GlobalLeaderboard

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

  mergeGameState(game: Game, player_number: number, message: ClientUpdateMessage) {
    this.game!.mergeState(game, player_number, message);
  }

  incrementReady() {
    this.ready_count += 1;
  }
  async checkReady() {
    if (this.ready_count < this.userlist.size) {
      return
    }
    this.ready_count = 0;
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
        lobby!.mergeGameState(event, player_number, message.message);

        const payload: ServerEvent = {
          type: "server_update",
          // @ts-ignore
          event: lobby!.game.jsonify(),
          player_number,
          message: message.message,
        };
        lobby!.broadcast(JSON.stringify(payload), player_id);
      } else if (message.type === "check_exists") {
        const field = message.field;
        const str = message.str;
        const strExists = await dbHelper.checkExists(field, str);
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
      } else if (message.type === "game_over") {
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

        lobby.userlist.delete(message.user_id);

        const payload: ServerSaysStopGame = {
          type: "stop_game",
          player_number: message.player_number,
          user_id: message.user_id, 
        }

        lobby.broadcast( JSON.stringify(payload), undefined)
        lobby.ready_count = 0;
      } else if (message.type === "client_stopped") {

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
        lobby.ready_count += 1;
  
        if (lobby.ready_count < lobby.userlist.size) {
          continue;
        }
        if (lobby.userlist.size < 2){
          continue;
        }
        
        lobby.ready_count = 0;

        const game = new GameServer(lobby.userlist);
        lobby.setGame(game);

      } else if (message.type === "set_skin"){
        const {token, skin} = message;
        const newskin = await dbHelper.setSkinAuthenticated(skin, token);

        const payload: SetSkinResponse = {
          type: "set_skin_response",
          skin,
        }
        ws.send(JSON.stringify(payload))
      } else if (message.type === "get_available_skins"){
        const {username} = message;
        const skins = await dbHelper.getAvailableSkins(username);
        const payload: GetAvailableSkinsResponse = {
          type: "available_skins",
          skins,
        }
        ws.send(JSON.stringify(payload));
      } else if (message.type === "get_global_leaderboard"){
        const data = await dbHelper.getGlobalLeaderboard();
        const payload: GlobalLeaderboard = {
          type: "global_leaderboard",
          data
        }
        ws.send(JSON.stringify(payload))
      } else if (message.type === "get_local_leaderboard"){
        const {username } = message
        const data = await dbHelper.getLocalLeaderboard(username);
        const payload: LocalLeaderboard = {
          type: "local_leaderboard",
          data
        }
        ws.send(JSON.stringify(payload))
      }
      else {
        console.log("unrecognized message", message)
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
  const socket = await ctx.upgrade();  
  await doStuff(socket);
};

export { handleSocket };
export default Lobby;
