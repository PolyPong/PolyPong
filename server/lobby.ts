import { Application, Context } from "https://deno.land/x/oak/mod.ts";
import { v4 } from "https://deno.land/std@0.92.0/uuid/mod.ts";
import { WebSocket, isWebSocketCloseEvent } from "https://deno.land/std@0.92.0/ws/mod.ts"

import {
  ClientAction,
  ErrorPayload,
  LobbyCreatedPayload,
  LobbyJoinedPayload,
  ServerEvent,
  Game,
  ServerUpdate,
  ExpandedPaddle,
  Ball,
  ClientUpdateMessage,
  ServerSaysStopGame,
} from "../PolyPong-Common/src/Game.ts";

import { GameServer } from "./Game.ts"

import dbHelper from "./db.ts";

class Lobby {
  userlist: Map<string, WebSocket>;
  userReadyList: string[]; // Array of user_id's that have hit "Let's play"
  usernameList: Map<string, string>;
  lobby_id: string;
  game: GameServer;
  ready_count = 0;
  lobby_count = 0;
  game_in_progress = false;

  constructor(lobby_id: string) {
    this.userlist = new Map();
    this.userReadyList = [];
    this.usernameList = new Map();
    this.lobby_id = lobby_id;
    this.game = new GameServer(new Map(), new Map()); // will be replaced by setGame
  }

  printState(){
    console.log("The current state of the lobby is: ")
    console.log("User List: " + this.userlist);
    console.log("User Ready List: " + this.userReadyList);
    console.log("Username List: " + this.usernameList);
    console.log("Lobby lobby_count: " + this.lobby_count);
    console.log("Game ready_count: " + this.ready_count);
    console.log("Game in progress: " + this.game_in_progress);
  }

  setGame(game: GameServer) {
    console.log("we have set the game");
    this.game = game;
  }

  async joinGame(user_id: string, ws: WebSocket, username: string | undefined) {

    if (this.game_in_progress){
      console.log("We are in game in progress")
      console.log(this.userlist.keys());
      const response: ErrorPayload = {
        type: "error",
        message: "Game in Progress",
      };
      ws.send(JSON.stringify(response));
      return;
    }

    this.userlist.set(user_id, ws);
    if (username !== undefined){
      this.usernameList.set(user_id, username);
    }

    console.log("Username List: " + this.usernameList);
    console.log("Userlist in Join Game: " + this.userlist);
    console.log("Userlist in Join Game: " + JSON.stringify(this.userlist));

    const usernamesToSend: [string, number][] = await this.getListOfUsernames(username);

    const response: LobbyJoinedPayload = {
      type: "lobby_joined_info",
      usernames: usernamesToSend,
    };
    this.broadcast(JSON.stringify(response), undefined);
    ws.send("success joining game");
  }

  async getListOfUsernames(username: string | undefined): Promise<[string, number][]> {
    const usernamesToSend: [string, number][] = [];
    let i = 1;
    for (let user of this.userlist.keys()){
      console.log("User in userlist: " + user);
      username = this.usernameList.get(user);
      if (username){
        const xp = await dbHelper.getXP(username);
        if (xp){
          usernamesToSend.push([username, xp]);
        } else {
          usernamesToSend.push([username, 0]);
        }
      } else {
        usernamesToSend.push(["Player " + i, 0]);
      }
      i++;
    }
    console.log(usernamesToSend);
    return usernamesToSend;

  }

  broadcast(message: string, ignore: string | undefined) {
    //console.log("broadcasting message", message)
    console.log("Userlist: " + this.userlist);
    for (const [k, v] of this.userlist.entries()) {
      if (v.isClosed){
        this.userlist.delete(k);
        this.usernameList.delete(k);
        continue;
      }
      
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
    this.game_in_progress = true;
    this.startGame();
  }

  incrementLobbyReady() {
    this.lobby_count += 1;
  }
  async checkLobbyReady(lobby: Lobby) {
    if (this.lobby_count < this.userlist.size) {
      return
    }
    this.lobby_count = 0;
    const game = new GameServer(lobby.userlist, lobby.usernameList);
    console.log("We have theoretically sent over the socket");
    lobby.setGame(game);
  }

  startGame() {

    for (const [user_id, ws_connection] of this.userlist.entries()){
      if (ws_connection.isClosed){
        this.userlist.delete(user_id);
        this.usernameList.delete(user_id);
        if (user_id in this.userReadyList){
          this.userReadyList.splice(this.userReadyList.indexOf(user_id),1);
          this.lobby_count -= 1;
        }

        if (this.userlist.size < 1) {
          this.game_in_progress = false;
          this.lobby_count = 0;
          this.ready_count = 0;
          if (!(LobbyNames.has(this.lobby_id))){
            LOBBIES.delete(this.lobby_id);
          }
        }
      }
    }

    console.log("3: " + JSON.stringify(this.game.players));

    const payload: ServerUpdate = {

      type: "server_update",
      event: this.game,
      player_number: undefined,
      message: "game_start",
    }

    // for (const p of payload.event.players) {
    //   p.websocketConnection = null;
    // }
    this.broadcast(JSON.stringify(payload), undefined)
  }
}

// global
// this dies if the server dies
const LOBBIES: Map<string, Lobby> = new Map();
const LobbyNames: Set<string> = new Set();
const names = ["DICE","Solarium","Cameron","SUB","CCIS","Windsor","ECERF","Telus", "Tory", "Butterdome", "Quad", "Lister"];
names.forEach((n) => LobbyNames.add(n));

for (const lobbyName of LobbyNames){
  LOBBIES.set(lobbyName, new Lobby(lobbyName));
}

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

    // if(isWebSocketCloseEvent(event)){
    //   for(const [lobby_id, lobby] of LOBBIES.entries()){
    //     for(const [user_id, ws_connection] of lobby.userlist.entries())
    //       if(ws_connection === ws){
    //         lobby.userlist.delete(user_id);
    //         lobby.usernameList.delete(user_id);
    //          lobby.lobby_count -= 1;
    //       }
    //   }
    // }

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
        ws.onclose = function(){
          console.log("We are closing the WS");
          this.userlist.delete(message.user_id);
          this.usernameList.delete(message.user_id);
          if (message.user_id in this.userReadyList){
            this.userReadyList.splice(this.userReadyList.indexOf(message.user_id),1);
            this.lobby_count -= 1;
          }
  
          if (this.userlist.size < 1) {
            this.game_in_progress = false;
            this.lobby_count = 0;
            this.ready_count = 0;
            if (!(LobbyNames.has(this.lobby_id))){
              LOBBIES.delete(this.lobby_id);
            }
          }
        }
        console.log("About to enter joinGame()");
        await lobby.joinGame(message.user_id, ws, message.username);
        continue;
      } else if (message.type === "exit_game"){

        // Known bug: If two players are in one lobby and one of the players
        // loses connection or closes the window, the lobby is deleted and the player
        // left in the lobby is in a non-existent lobby (ie. nobody else can join them)
        
        const lobby = LOBBIES.get(message.lobby_id);
        if (!lobby) {
          const response: ErrorPayload = {
            type: "error",
            message: "lobby not found",
          };
          ws.send(JSON.stringify(response));
          continue;
        }

        lobby.printState();

        if (message.user_id && message.lobby_id){
          lobby.userlist.delete(message.user_id);
          lobby.usernameList.delete(message.user_id);
          if (message.user_id in lobby.userReadyList){
            lobby.userReadyList.splice(lobby.userReadyList.indexOf(message.user_id),1);
            lobby.lobby_count -= 1;
          }

          if (lobby.game_in_progress){
            console.log("A user just left while a game is in progress");
            console.log("We may wish to display a message and start a new game without the player that lost connection");
            
            const payload: ServerSaysStopGame = {
              type: "stop_game",
              player_number: message.player_number,
              user_id: message.user_id,
            }
    
            lobby.broadcast(JSON.stringify(payload), undefined)
            lobby.ready_count = 0;
          
          }


          if (lobby.userlist.size < 1) {
            lobby.game_in_progress = false;
            lobby.lobby_count = 0;
            lobby.ready_count = 0;
            if (!(LobbyNames.has(message.lobby_id))){
              LOBBIES.delete(message.lobby_id);
            }
          }
          console.log(message.user_id + " just exited the lobby/game with lobby_id: " + message.lobby_id);
        }

        console.log("");
        lobby.printState();

        const usernamesToSend: [string, number][] = await lobby.getListOfUsernames(message.username);

        console.log("Length: " + usernamesToSend.length)
        if (usernamesToSend.length === 1){
          const response: ErrorPayload = {
            type: "error",
            message: "lobby not found",
          };
          lobby.broadcast(JSON.stringify(response), undefined);
          continue;
        }

        const response: LobbyJoinedPayload = {
          type: "lobby_joined_info",
          usernames: usernamesToSend,
        };
        lobby.broadcast(JSON.stringify(response), undefined);
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

        const game = new GameServer(lobby.userlist, lobby.usernameList);
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
      } else if (message.type === "lobby_client_ready") {
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
        lobby.userReadyList.push(message.user_id);
        lobby.incrementLobbyReady();
        lobby.checkLobbyReady(lobby);
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

        for (const username of lobby.usernameList.values()){
          console.log(username);
          dbHelper.levelUp(username, 1);
        }

        const lossUsername = lobby.usernameList.get(message.user_id);
        if (lossUsername){
          dbHelper.addLoss(lossUsername);
        }
          
        lobby.userlist.delete(message.user_id);
        lobby.usernameList.delete(message.user_id);
        if (message.user_id in lobby.userReadyList){
          lobby.userReadyList.splice(lobby.userReadyList.indexOf(message.user_id),1);
          lobby.lobby_count -= 1;
        }

        if (lobby.userlist.size < 2){
          console.log("There is only one player left, the game is over");
          for (const username of lobby.usernameList.values()){
            console.log(username);
            dbHelper.levelUp(username, 1);
            dbHelper.addWin(username);
          }
        }

        const payload: ServerSaysStopGame = {
          type: "stop_game",
          player_number: message.player_number,
          user_id: message.user_id,
        }

        lobby.broadcast(JSON.stringify(payload), undefined)
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
        lobby.ready_count = 0;

        if (lobby.userlist.size < 2) {
          console.log("Size of userlist less than 1");
          if (!(LobbyNames.has(lobby_id))){
            console.log(lobby_id + " is not in LobbyNames");
            LOBBIES.delete(lobby_id);
          } else {
            console.log("We are clearing out " + lobby.lobby_id + " lobby");
            lobby.game_in_progress = false;
            lobby.userlist = new Map();
            lobby.userReadyList = [];
            lobby.usernameList = new Map();
            lobby.lobby_count = 0;
            lobby.ready_count = 0;
            // LOBBIES.set(lobby_id, lobby);
            console.log(JSON.stringify(lobby));
          }
          continue;
        }

        const game = new GameServer(lobby.userlist, lobby.usernameList);
        lobby.setGame(game);

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
