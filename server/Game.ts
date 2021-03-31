import {
  Ball,
  Color,
  Paddle,
  Player,
  Powerup,
  Shape,
  Game,
  ServerSaysGameStarted,
  ClientUpdateMessage
} from "../PolyPong-Common/src/Game.ts";


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

  constructor(userlist: Map<string, WebSocket>) {
    super();
    this.sides = userlist.size;
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
        ),
        [],
        0,
        ws,
      );
      this.players.push(player);
    }

    for (const player of this.players) {
      const payload: ServerSaysGameStarted = {
        type: "game_started",
        sides: this.sides,
        your_player_number: this.players.indexOf(player),
        ball: this.ball,
      };
      player.websocketConnection!.send(JSON.stringify(payload));
    }
  }

  mergeState(game: Game, player_number: number | undefined, message: ClientUpdateMessage ) {

    if (player_number || player_number === 0) {
      this.players[player_number].paddle.x = game.players[player_number].paddle.x;
    }
    
    if (message === "ball_update"){
      this.ball.x = game.ball.x;
      this.ball.y = game.ball.y;
      this.ball.dx = game.ball.dx;
      this.ball.dy = game.ball.dy;
    }
    
    
  }
}