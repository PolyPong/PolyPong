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

    for (let i = 0; i < sides; i++) {
      // Note width of each paddle is set to the radius of the shape divided by the number of sides
      const player: Player = new Player(
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
      );
      
      //var player: Player = new Player("","",new Paddle(0,this.radius/this.sides,true,Shape.Regular,Color.White),[],0);
      this.players.push(player);
    }
  }
  mergeState(state: GameClient, player_number: number | undefined, message: ClientUpdateMessage) {
    // if (player_number || player_number === 0) {
    //   // this.players[player_number].paddle.x = state.players[player_number].paddle.x;
    //   // this.players[player_number].paddle.moving = state.players[player_number].paddle.moving;
    //   // this.players[player_number].paddle.direction = state.players[player_number].paddle.direction;    
    //   console.log("State color: " + state.players[0].paddle.paddleColor);
    //   console.log("Client color: " + this.players[0].paddle.paddleColor);
      
    //   this.players = state.players;
    //   this.ball.visible = state.ball.visible;
    //   this.backgroundColor = state.backgroundColor;
    // }

    // Old mergeState, no powerup handling
    // if (player_number || player_number === 0) {
    //   this.players[player_number] = state.players[player_number];
    // } else if (player_number === undefined){
    //   this.players = state.players;
    // }


    // this.ball.visible = state.ball.visible;
    // this.backgroundColor = state.backgroundColor;

    // if (message === "ball_update") {
    //   this.ball.x = state.ball.x;
    //   this.ball.y = state.ball.y;
    //   this.ball.dx = state.ball.dx;
    //   this.ball.dy = state.ball.dy;
    // }


    if (message === "ball_update") {
      this.ball.x = state.ball.x;
      this.ball.y = state.ball.y;
      this.ball.dx = state.ball.dx;
      this.ball.dy = state.ball.dy;
    } else if (message === "bigger"){
      if(player_number){
        this.players[player_number].paddle.width = state.players[player_number].paddle.width;
      }
    } else if (message === "smaller"){
      console.log("smaller received client-side");
      console.log();
      console.log();
      console.log();
      console.log();
      console.log();
      console.log();
      console.log();
      console.log();
      console.log()
      for (var i = 0; i < this.players.length; i++) {
        if(player_number && i !== player_number){
          this.players[i].paddle.width = state.players[i].paddle.width;
        }
      }
    } else if (message === "selfInvisible"){
      if(player_number){
        this.players[player_number].paddle.visible = state.players[player_number].paddle.visible;
      }
    } else if (message === "othersInvisible"){
      console.log("othersInvisible received client-side");
      console.log();
      console.log();
      console.log();
      console.log();
      console.log();
      console.log();
      console.log();
      console.log();
      for (var i = 0; i < this.players.length; i++) {
        if(player_number && i !== player_number){
          this.players[i].paddle.visible = state.players[i].paddle.visible;
        }
      }
    } else if (message === "ballInvisible"){
      this.ball.visible = state.ball.visible;
    } else if (message === "distracting"){
      this.backgroundColor = state.backgroundColor;

    // Future powerups need to be handled here so they are updated server-side before being broadcast
    // The state is updated on a one-by-one basis to prevent race conditions: multiple client updates
    // affecting the same variable server-side (overwriting each other and making the state of the game 
    // inaccurate).
    // } else if (message == "selfInvisible"){


    } else if (message === "game_start") {
      this.players = state.players;
      // if (player_number || player_number === 0) {
      //   this.players = state.players;
      // }

    } else if (player_number || player_number === 0) {
      // for (var i = 0; i < this.players.length; i++)
      //   this.players[i].paddle.x = game.players[i].paddle.x;
      // this.players[player_number].paddle.moving = game.players[player_number].paddle.moving;
      // this.players[player_number].paddle.direction = game.players[player_number].paddle.direction;
      
      // this.players[player_number] = game.players[player_number];
      console.log("moving player number: " + player_number)
      console.log("client x: " + state.players[player_number].paddle.x)

      this.players[player_number].paddle.x = state.players[player_number].paddle.x;
      this.players[player_number].paddle.moving_left = state.players[player_number].paddle.moving_left;
      this.players[player_number].paddle.moving_right = state.players[player_number].paddle.moving_right;
  
    } else {
      console.log();
      console.log("Not sure what happened here");
      console.log();
      console.log("Game: " + JSON.stringify(state));
      console.log("Player Number: " + JSON.stringify(player_number));
      console.log("Message: " + JSON.stringify(message));
    }
  }
}