import {
  acceptable,
  acceptWebSocket,
} from "https://deno.land/std@0.84.0/ws/mod.ts";

import { Application, Context, Router } from "https://deno.land/x/oak/mod.ts";
import { v4 } from "https://deno.land/std@0.84.0/uuid/mod.ts";
import {
  ClientAction,
  ErrorPayload,
  LobbyJoinedPayload,
  ServerEvent,
  LobbyCreatedPayload
} from "../PolyPong-Common/src/Payload.ts";

class Lobby {
  userlist: Map<string, WebSocket>;
  lobby_id: string;

  constructor(lobby_id: string) {
    this.userlist = new Map();
    this.lobby_id = lobby_id;
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
    for (const [k, v] of this.userlist.entries()) {
      if (k === ignore) {
        continue;
      }
      v.send(message);
    }
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
      }
    } catch {
      console.error(
        `got message: ${event} failed to parse it as json, so ignoring...`,
      );
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
