import { Game, Paddle, Player, Ball, Shape, Color, ClientUpdateMessage } from "@polypong/polypong-common";

// FR6 Play Game
export class GameClient extends Game {
  radius: number = 175; // Size of the game board, determined at runtime but set to default of 400
  sides: number;
  paddleCoverageRatio: number = 0.25;
  sideLength: number;
  // ball: Ball;
  balls: Ball[];

  constructor(sides: number, ball: Ball) {
    super();
    this.sides = sides;
    // this.ball = ball;
    this.balls = [];
    this.balls.push(ball);
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
  // FR6 Play Game
  // FR11 Power Ups
  // FR12 Expanded Paddle
  // FR13 Shrink Paddle
  // FR14 Self Invisible Paddle
  // FR15 Others Invisible Paddle
  // FR16 Invisible Ball
  // FR17 Self Curved Outwards Paddle
  // FR18 Self Curved Inwards Paddle
  // FR19 Self Bumpy Paddle
  // FR20 Distracting Background
  // FR23 Add Ball
  // FR26 Path Trace
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
      for (var i = 0; i < this.balls.length; i++) {
        this.balls[i].x = state.balls[i].x;
        this.balls[i].y = state.balls[i].y;
        this.balls[i].dx = state.balls[i].dx;
        this.balls[i].dy = state.balls[i].dy;
      }
    } else if (message === "bigger"){
      if(player_number || player_number === 0){
        this.players[player_number].paddle.width = state.players[player_number].paddle.width;
      }
    } else if (message === "smaller"){
      for (var i = 0; i < this.players.length; i++) {
        if( (player_number || player_number === 0) && i !== player_number){
          this.players[i].paddle.width = state.players[i].paddle.width;
        }
      }
    } else if (message === "selfInvisible"){
      if(player_number || player_number === 0){
        this.players[player_number].paddle.visible = state.players[player_number].paddle.visible;
      }
    } else if (message === "othersInvisible"){
      for (var i = 0; i < this.players.length; i++) {
        if((player_number || player_number === 0) && i !== player_number){
          this.players[i].paddle.visible = state.players[i].paddle.visible;
        }
      }
    } else if (message === "ballInvisible") {
      for (var i = 0; i < this.balls.length; i++) {
        this.balls[i].visible = state.balls[i].visible;
      }
    } else if (message === "distracting") {
      this.backgroundColor = state.backgroundColor;

    // Future powerups need to be handled here so they are updated server-side before being broadcast
    // The state is updated on a one-by-one basis to prevent race conditions: multiple client updates
    // affecting the same variable server-side (overwriting each other and making the state of the game 
    // inaccurate).
    // } else if (message == "selfInvisible"){

    } else if (message === "bumpy"){
      if(player_number || player_number === 0){
        this.players[player_number].paddle.shape = Shape.Bumpy;
      }
    } else if (message === "curvedInwards"){
      if(player_number || player_number === 0){
        this.players[player_number].paddle.shape = Shape.CurvedInwards;
      }
    } else if (message === "curvedOutwards"){
      if(player_number || player_number === 0){
        this.players[player_number].paddle.shape = Shape.CurvedOutwards;
      }
    } else if (message === "game_start") {
      this.players = state.players;
      // if (player_number || player_number === 0) {
      //   this.players = state.players;
      // }

    } else if (message === "anotherBall") {
      // a new ball was added, replace balls array with new array
      //this.balls = state.balls;

      // Only add the most recently added ball so that other balls don't 
      // go "back in time"
      for (let i = state.balls.length; i > this.balls.length; i--){
        this.balls.push(state.balls[i-1]);
      }
      

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