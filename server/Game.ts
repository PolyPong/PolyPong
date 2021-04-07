import {
  Ball,
  Color,
  Paddle,
  Player,
  Powerup,
  Shape,
  Game,
  ServerSaysGameStarted,
  ClientUpdateMessage,
} from "../PolyPong-Common/src/Game.ts";
import dbHelper from "./db.ts";
import { WebSocket } from "https://deno.land/std@0.92.0/ws/mod.ts"


export class GameServer extends Game {
  radius: number = 175; // Size of the game board, determined at runtime but set to default of 400
  sides: number;
  paddleCoverageRatio: number = 0.25;
  sideLength: number;
  ball: Ball = new Ball();

  ballVisible: boolean = true;
  numBalls: number = 1;
  backgroundColor: Color = Color.BackgroundColor;
  activePowerups: Powerup[] = [];
  players: Player[] = [];
  usernameList: Map<string, string>;


  constructor(userlist: Map<string, WebSocket>, usernameList: Map<string, string>) {
    super();
    this.sides = userlist.size;
    this.usernameList = usernameList;
    this.sideLength = 2 * this.radius * Math.sin(Math.PI / this.sides);

    for (const [user_id, ws] of userlist.entries()) {  
      const player = new Player(
        user_id,
        "",
        new Paddle(
          0,
          this.sideLength * this.paddleCoverageRatio,
          true,
          Shape.Regular,
          Color.White,
          false,
          false,
        ),
        [],
        0,
      );
      this.players.push(player);
    }
    this.setSkins(userlist);
  }

  async setSkins(userlist: Map<string, WebSocket>){
    console.log("1: " + JSON.stringify(this.players));
    for (const player of this.players){
      let skin = Color.White;
      const username: string = this.usernameList.get(player.username) ?? "";

      if(username){
        skin = await dbHelper.getSelectedSkin(username) ?? Color.White;
      }
      player.paddle.paddleColor = skin;
    }

    console.log("2: " + JSON.stringify(this.players));
    console.log("Userlist");
    console.log(userlist);


    for (const player of this.players) {
      console.log("We are creating a payload to send");
      const payload: ServerSaysGameStarted = {
        type: "game_started",
        sides: this.sides,
        your_player_number: this.players.indexOf(player),
        ball: this.ball,
      };
      // player.websocketConnection!.send(JSON.stringify(payload));
      const socket = userlist.get(player.username);
      if(!socket){
        console.log("Socket no worky");
      }

      console.log("We are sending our payload");
      socket?.send(JSON.stringify(payload));
    }

  }

  mergeState(game: Game, player_number: number | undefined, message: ClientUpdateMessage) {

    if (player_number || player_number === 0) {
      // for (var i = 0; i < this.players.length; i++)
      //   this.players[i].paddle.x = game.players[i].paddle.x;
      // this.players[player_number].paddle.moving = game.players[player_number].paddle.moving;
      // this.players[player_number].paddle.direction = game.players[player_number].paddle.direction;
      if (player_number || player_number === 0) {
        this.players[player_number] = game.players[player_number];
      }
      console.log("We are merging client state into the server, ball visibility should change")
      this.ball.visible = game.ball.visible;
      this.backgroundColor = game.backgroundColor;
    }

    if (message === "ball_update") {
      this.ball.x = game.ball.x;
      this.ball.y = game.ball.y;
      this.ball.dx = game.ball.dx;
      this.ball.dy = game.ball.dy;
    }


  }
}