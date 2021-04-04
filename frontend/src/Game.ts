import { Game, Paddle, Player, Ball, Shape, Color, ClientUpdateMessage } from "@polypong/polypong-common";

export class GameClient extends Game {
  radius: number = 175; // Size of the game board, determined at runtime but set to default of 400
  sides: number;
  paddleCoverageRatio: number = 0.25;
  sideLength: number;
  ball: Ball;

  constructor(sides: number, ball: Ball) {
    super();
    this.sides = sides;
    this.ball = ball;
    // this.player_number = player_number;
    this.sideLength = 2 * this.radius * Math.sin(Math.PI / sides);

    for (var i = 0; i < sides; i++) {
      // Note width of each paddle is set to the radius of the shape divided by the number of sides
      if (i < 1) {
        var player: Player = new Player(
          "",
          "",
          new Paddle(
            0,
            this.sideLength * this.paddleCoverageRatio,
            true,
            Shape.Regular,
            Color.Red,
            false,
            false,
          ),
          [],
          0,
          null,
        );
      } else {
        var player: Player = new Player(
          "",
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
          null,
        );
      }
      //var player: Player = new Player("","",new Paddle(0,this.radius/this.sides,true,Shape.Regular,Color.White),[],0);
      this.players.push(player);
    }
  }
  mergeState(state: GameClient, player_number: number | undefined, message: ClientUpdateMessage) {
    console.log(player_number);
    if (player_number || player_number === 0) {
      // this.players[player_number].paddle.x = state.players[player_number].paddle.x;
      // this.players[player_number].paddle.moving = state.players[player_number].paddle.moving;
      // this.players[player_number].paddle.direction = state.players[player_number].paddle.direction;    
      this.players = state.players;
      this.ball.visible = state.ball.visible;
    }
    if (message === "ball_update"){
      this.ball.x = state.ball.x;
      this.ball.y = state.ball.y;
      this.ball.dx = state.ball.dx;
      this.ball.dy = state.ball.dy;
    }
  }
}