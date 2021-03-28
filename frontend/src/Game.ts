import { Game, Paddle, Player, Ball, Shape, Color } from "@polypong/polypong-common";

export class GameClient extends Game {
  constructor(sides: number) {
    super();
    this.sides = sides;
    // this.player_number = player_number;

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
  mergeState(state: GameClient, player_number: number | undefined) {
    if (player_number) {
      this.players[player_number] = state.players[player_number];
    }
    this.ball.dx = state.ball.dx;
    this.ball.dy = state.ball.dy;
  }
}