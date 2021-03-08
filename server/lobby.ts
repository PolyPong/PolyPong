import {
  acceptable,
  acceptWebSocket,
} from "https://deno.land/std@0.84.0/ws/mod.ts";

import { Application, Context, Router } from "https://deno.land/x/oak/mod.ts";
import { v4 } from "https://deno.land/std@0.84.0/uuid/mod.ts";

class Lobby {
  userlist: Map<string, WebSocket>;
  constructor() {
    this.userlist = new Map();
  }

  joinGame(user_id: string, ws: WebSocket) {
    this.userlist.set(user_id, ws);
    this.broadcast(JSON.stringify({
      event: `user ${user_id} has joined the game`,
    }));
  }

  broadcast(message: string) {
    for (const sock of this.userlist.values()) {
      sock.send(message);
    }
  }
}

// global
// this dies if the server dies
const LOBBIES: Map<string, Lobby> = new Map();

export const createLobby: () => string = () => {
  const lobby_id = v4.generate();
  const lobby = new Lobby();
  LOBBIES.set(lobby_id, lobby);
  return lobby_id;
};

const doStuff = async (ws: any) => {
  // broadcast(`${uid} has joined`)
  console.log("uhhhh");
  for await (const event of ws) {
    console.log("got message", event);
    ws.send(JSON.stringify({ info: `server got your message: ${event}` }));
    try {
      // for now, let's just assume all messages are in JSON
      // regular ol' strings are a no go

      const message = JSON.parse(event);
      if (message.action === "join_game") {
        const lobby = LOBBIES.get(message.lobby_id);
        if (!lobby) {
          ws.send(JSON.stringify({ error: "lobby not found" }));
          continue;
        }
        lobby.joinGame(message.user_id, ws);
        continue;
      } else if (message.action === "create_lobby") {
        const lobby_id = createLobby();
        ws.send(JSON.stringify({ event: "lobby_created", lobby_id }));
      }
    } catch {
      console.log(`got message: ${event} , ignoring...`);
      continue;
    }
  }
};

// const createLobbyRoute = (ctx: Context) => {
//   console.log(ctx)
//   const lobby_id = createLobby();
//   ctx.response.body = {
//     lobby_id
//   }
// }

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

export {
  // createLobbyRoute,
  handleSocket,
};
export default Lobby;
