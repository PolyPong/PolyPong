import { Game, Paddle, Player, Ball, Shape, Color, ClientUpdateMessage } from "@polypong/polypong-common";

export class GameClient extends Game {
  sideLength: number;
  constructor(sides: number) {
    super();
    this.sides = sides;
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
            this.radius / this.sides,
            true,
            Shape.Regular,
            Color.Red,
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
            this.radius / this.sides,
            true,
            Shape.Regular,
            Color.White,
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
    if (player_number || player_number === 0) {
      this.players[player_number] = state.players[player_number];
    }
    this.ball.dx = state.ball.dx;
    this.ball.dy = state.ball.dy;
  }
}