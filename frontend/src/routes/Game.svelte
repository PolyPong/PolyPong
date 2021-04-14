<script lang="typescript">
  import {
    game_info,
    ws,
    user,
    user_id,
    lobby_id,
    game,
    game_active,
    all_clients_ready,
    stop_game_loop,
    loss_info,
    auth0Client,
    power_ups_str,
    power_ups_str_long,
    power_up_one_used,
    power_up_two_used,
    power_up_three_used,
  } from "../store";
  import { onMount, tick, onDestroy } from "svelte";
  import { Ball, Color, Paddle, Shape } from "@polypong/polypong-common";
  import type {
    ClientUpdate,
    KeyDownEvent,
    KeyUpEvent,
    ClientReady,
    ClientSaysGameOver,
    ClientStopped,
    GameWon,
    PowerupStrings,
  } from "@polypong/polypong-common";
  import { GameClient } from "../Game";
  import { router } from "tinro";
  let w: number;
  let h: number;
  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;
  let leftArrowPressed = false;
  let rightArrowPressed = false;

  let gameLoopRunning: Timeout;
  let animationInterval: Timeout[] = [];
  let gameActiveInterval: Timeout;
  let allClientsReadyInterval: Timeout;
  let serverSaysStopGameInterval: Timeout;
  let distractingBackgroundInterval: Timeout;
  let textAlpha: number = 0;

  const paddleCoverageRatio: number = 1 / 4;
  const ballScaleFactor: number = 1 / 30;
  // const frameRate = 1000/60;  // 60 FPS
  const frameRate = 1000 / 60;

  const SERVER_URL =
    import.meta.env.MODE === "production"
      ? "https://polyserver.polypong.ca:8443/"
      : "http://localhost:5000/";

  const WS_SERVER_URL =
    import.meta.env.MODE === "production"
      ? "wss://polyserver.polypong.ca:8443/ws"
      : "ws://localhost:5000/ws";

  let beginningXP: number = 0;
  let endingXP: number = 0;
  let earnedXP: number = 0;
  let myShape: Shape = Shape.Regular;
  let pathShown: boolean = false;
  

  // Note: keeping these in case paddles is not as easy as it currently is coded (please ignore for now but keep them just in case)
  // function getPlayerInitialX(sides: number, playerNumber: number): number{
  //     console.log("X position")
  //     console.log((game.radius-200)*Math.cos(Math.PI/sides + 2*Math.PI*(playerNumber-1)/sides));
  //     return (game.radius-500/sides)*Math.cos(Math.PI/sides + 2*Math.PI*(playerNumber-1)/sides)
  // }

  // function getPlayerInitialY(sides: number, playerNumber: number): number{
  //     console.log("Y position")
  //     console.log((game.radius-200)*Math.sin(Math.PI/sides + 2*Math.PI*(playerNumber-1)/sides));
  //     return (game.radius-500/sides)*Math.sin(Math.PI/sides + 2*Math.PI*(playerNumber-1)/sides)
  // }

  onMount(async () => {
    load();
  });

  onDestroy( () => {
    window.removeEventListener("keydown", handleKeyPresses);
    window.removeEventListener("keyup", handleKeyPresses);
    window.removeEventListener("blur", blurHandler);
    clearInterval(gameLoopRunning);
    clearInterval(gameActiveInterval);
    animationInterval.forEach(clearInterval);
    clearInterval(allClientsReadyInterval);
    clearInterval(serverSaysStopGameInterval);
    clearInterval(distractingBackgroundInterval);
  });

  async function load() {
    w = document.documentElement.clientWidth;
    h = document.documentElement.clientHeight;

    canvas.width = 400;
    canvas.height = 400;

    // canvas.width = w - 100;
    // canvas.height = h - 150;

    ctx = canvas.getContext("2d")! as CanvasRenderingContext2D;

    if (await (await $auth0Client).isAuthenticated()) {
      await (await $auth0Client).getTokenSilently();
    }

    beginningXP = await getXP();
    console.log("Beginning XP: " + beginningXP);


    // First we send a game_over message from Game.svelte to lobby.ts
    // Then, lobby.ts sends over a game_started message, which is processed in store.ts
    // In store.ts, when we receive game_started message, we update game_info and set game_active to true
    // This is a problem because the gameLoop in Game.svelte is still running
    // (this client is unaware another client has game over'ed)

    // For example, assume player 2 is eliminated, and that there is also a player 3,4,5,6,7...
    // Since the gameLoop in this client is still running, when game_info is updated,
    // the player number is updated (for example, player 3 now becomes player 2) but ALL the
    // other game information is still based on the previous game
    // So when the gameLoop runs, player 3 is now essentially the old game's player 2, and
    // the ball is below the old game's player 2 paddle
    // Hence, player 3 (as well as player 4, 5, 6, 7, ...) is immediately eliminated since gameOver()
    // returns true. This all happens because we change the player number without the client
    // knowing that another client has already lost the current game.
    // We can fix this by adding a gameLost boolean to the store perhaps, and
    // when we handle gameOver() on the client that lost, we send over a server message which is
    // broadcast to all the other clients to say "Hey, this game has already been lost - you've made it
    // to the next round. Stop the game loop and wait for more info from the server."

    // So the new protocol will be:
    // Send game_over from Game.svelte to lobby.ts
    // Broadcast game over from lobby.svelte to the other clients, received in store.ts
    // Get all the other clients to send a payload saying they have stopped their gameLoop
    // Then, in lobby.ts, once all the clients have send back a ready message, send a game_started message

    gameActiveInterval = setInterval(async () => {
      if ($game_active) {
        $game_active = false;

        ctx.translate(canvas.width / 2, canvas.height / 2);
        clearScreenOriginCentered();
        animateText("3", 1000);
        await sleep(1500);

        animateText("2", 1000);
        await sleep(1500);

        animateText("1", 1000);
        await sleep(1500);

        ctx.translate((-1 * canvas.width) / 2, (-1 * canvas.height) / 2);
        // ctx.setTransform(1, 0, 0, 1, 0, 0);

        startGame(
          $game_info.sides,
          $game_info.my_player_number,
          $game_info.ball
        );
        adjustSize();
      }
      await tick();
    }, 50);

    allClientsReadyInterval = setInterval(async () => {
      if ($all_clients_ready) {
        $all_clients_ready = false;

        console.log("We are setting the interval for gameLoop");
        gameLoopRunning = setInterval(gameLoop, frameRate);

        if(myShape === Shape.Regular){
          
        } else {
          $game.players[$game_info.my_player_number].paddle.shape = myShape;
          if (myShape === Shape.Bumpy){
            sendUpdate("bumpy");
          }
          else if (myShape === Shape.CurvedInwards){
            sendUpdate("curvedInwards");
          }
          else if (myShape === Shape.CurvedOutwards){
            sendUpdate("curvedOutwards");
          }
        }
      }
      await tick();
    }, 50);

    serverSaysStopGameInterval = setInterval(async () => {
      if ($stop_game_loop) {
        $stop_game_loop = false;
        console.log("We get to the stop game loop");

        clearInterval(gameLoopRunning);
        clearInterval(distractingBackgroundInterval);
        // animateText("Player " + $loss_info.player_number + ", " + $loss_info.user_id + ", has lost", 8000);
        // await sleep(8000);

        if ($game_info.sides === 2) {
          console.log("Two players left and one just lost");
          window.removeEventListener("keydown", handleKeyPresses);
          window.removeEventListener("keyup", handleKeyPresses);
          window.removeEventListener("blur", blurHandler);
          clearScreenOriginCentered();
          animateText("You Win!", 8000);
          playSound("You-Win");
          await sleep(8500);

          if (await (await $auth0Client).isAuthenticated()) {
            endingXP = await getXP();
            earnedXP = endingXP - beginningXP;
            console.log("Earned XP: " + earnedXP);
            let xpString: string = "+" + earnedXP + " XP Earned!";
            console.log("XP String: " + xpString);
            animateText(xpString, 8000);
            playSound("XP");
            await sleep(8500);
            router.goto("/home");
          }
          router.goto("/home");
        }

        console.log("We are sending the client payload");
        const payload: ClientStopped = {
          type: "client_stopped",
          lobby_id: $lobby_id,
        };
        $ws.send(JSON.stringify(payload));
        ctx.translate((-1 * canvas.width) / 2, (-1 * canvas.height) / 2);

        // if ($game_info.sides === 2) {
        //   $lobby_id = "";
        // }
      }
      await tick();
    }, 50);
  }

  function startGame(sides: number, player_number: number, ball: Ball) {
    // Adding an EventListener to window to listen for keys being pressed
    // window.addEventListener("keydown", keyDownHandler);
    // window.addEventListener("keyup", keyUpHandler);
    window.addEventListener("keydown", handleKeyPresses);
    window.addEventListener("keyup", handleKeyPresses);
    // Adding an EventListener to check if window in focus
    window.addEventListener("blur", blurHandler);

    // Create new games with 'sides' number of players

    $game = new GameClient(sides, ball);
    // Starts the game loop
    const payload: ClientReady = {
      type: "client_ready",
      lobby_id: $lobby_id,
    };

    $ws.send(JSON.stringify(payload));
  }

  // Draw the current game board or polygon according to the size of the client's window
  // Also adjust the size of paddles based on the length of each side
  // (currently, each paddle is one quarter of the side length)
  function adjustSize() {
    w = document.documentElement.clientWidth;
    h = document.documentElement.clientHeight;
    // canvas.width = w - 100;
    // canvas.height = h - 150;
    // ctx.scale((canvas.width)/400, (canvas.height)/400)

    $game.radius = 175; // Set the radius of the game

    // Get the length of each side
    $game.sideLength = 2 * $game.radius * Math.sin(Math.PI / $game.sides);

    // Set the width of each paddle to be a quarter of the side length
    for (var i = 0; i < $game.players.length; i++) {
      $game.players[i].paddle.width = $game.sideLength * paddleCoverageRatio;
      $game.players[i].paddle.regularWidth = $game.sideLength * paddleCoverageRatio;
      // TODO: Need to handle if expanded paddle/shrunk paddle is applied here
    }

    // TODO adjust the ball size based on $game.radius
    // for (var i = 0; i < $game.balls.length; i++) {
    //   $game.balls[i].radius = $game.radius * ballScaleFactor;
    // }
  }

  export function gameLoop() {
    update(); // For updating the state of the game
    render(); // For rendering the updated state of the game 
              // (ie. clears the screen and draws the new state onto the canvas)
  }

  // Update the state of the game, using what the server sends us
  function update() {
    // Handles paddle movement side-to-side using the left and right arrow keys,
    // only lets the paddle move along the length of its respective side (bounded by the side length)
    // if (
    //   leftArrowPressed &&
    //   $game.players[$game_info.my_player_number].paddle.x -
    //     $game.players[$game_info.my_player_number].paddle.width -
    //     Paddle.velocity >
    //     -$game.sideLength / 2
    // ) {
    //   $game.players[$game_info.my_player_number].paddle.x -= Paddle.velocity;
    // } else if (
    //   rightArrowPressed &&
    //   $game.players[$game_info.my_player_number].paddle.x + Paddle.velocity <
    //     $game.sideLength / 2
    // ) {
    //   $game.players[$game_info.my_player_number].paddle.x += Paddle.velocity;
    // }

    // simulate other players movement
    for (var i = 0; i < $game.players.length; i++) {
      // skip updating self since already handled above
      // if (i == $game_info.my_player_number) continue;

      // let paddle = $game.players[i].paddle;
      if ($game.players[i].paddle.moving_right && $game.players[i].paddle.moving_left) {
        continue;
      }

      if ($game.players[i].paddle.moving_right) {
        // constrain movement to length of side
        if (
          $game.players[i].paddle.x + Paddle.velocity <
          $game.sideLength / 2
        ) {
          $game.players[i].paddle.x += Paddle.velocity;
        }
      }
      if ($game.players[i].paddle.moving_left) {
        // constrain movement to length of side
        if (
          $game.players[i].paddle.x -
            $game.players[i].paddle.width -
            Paddle.velocity >
          -$game.sideLength / 2
        ) {
          $game.players[i].paddle.x -= Paddle.velocity;
        }
      }
    }

    moveBall();

    for (var i = 0; i < $game.balls.length; i++) {
      if (collisionDetect(i)) {
        handleCollision(i);
      }

      if (gameOver(i)) {
        handleGameOver();
      }
    }
  }

  // Re-render the game according to the new state
  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if($game.sides === 2){
      $game.radius = 200;
    }

    drawPolygon($game.sides, 255, 255, 255);

    //Move the origin to the exact center of the canvas
    ctx.translate(canvas.width / 2, canvas.height / 2);

    // Rotate so that the player which has '$game_info.my_player_number' number is at the bottom
    // Need to rotate BEFORE paddles are drawn to the screen, need to rotate around center of canvas
    ctx.rotate((-2 * Math.PI * $game_info.my_player_number) / $game.sides);
    drawPaddles();

    drawBall();
    // Undo the spell we cast
    ctx.rotate((2 * Math.PI * $game_info.my_player_number) / $game.sides);


    // Later on, when the ball information is coming in from the server, we will want to include
    // drawBall() in between the two rotations. For now, the ball information is not rotated because
    // right now the ball information is from player 0's perspective, not from player playerNumber's perspective

    // TLDR: drawBall() stays outside the rotations until we are synchronizing ball information across clients

    // We want Game Over drawn correctly without rotation
    for (var i = 0; i < $game.balls.length; i++) {
      if (gameOver(i)) {
        drawGameOver();
      }
    }
  }

  async function drawGameOver() {
    
    clearScreenOriginCentered();
    animateText("Game Over", 8000);
    playSound("Game-Over");
    await sleep(8500);

    if (await (await $auth0Client).isAuthenticated()) {
      endingXP = await getXP();
      earnedXP = endingXP - beginningXP;
      console.log("Earned XP: " + earnedXP);
      let xpString: string = "+" + earnedXP + " XP Earned!";
      console.log("XP String: " + xpString);
      animateText(xpString, 8000);
      playSound("XP");
      await sleep(8500);
      // $lobby_id = "";
      router.goto("/home");
    }
    // $lobby_id = "";
    router.goto("/home");
  }

  function drawPolygon(
    sides: number,
    red: string | number,
    green: string | number,
    blue: string | number
  ) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // For changing the background color of just the game board/within the polygon
    ctx.fillStyle = $game.backgroundColor; // See $game.ts, default color is set to the same color as rest of board
    
    if($game_info.sides === 2){
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    //Move the origin to the exact center of the canvas
    ctx.translate(canvas.width / 2, canvas.height / 2);

    // Rotate the canvas so that the bottom side of every shape is flat
    ctx.rotate((rotationAngle(sides) * Math.PI) / 180);

    // Angle of each vertex of the shape (ie. 120 degrees or 2PI/3 for triangles, 90 or PI/2 for squares, etc.)
    let a = (2 * Math.PI) / sides;

    ctx.lineWidth = 1;
    ctx.beginPath(); // Begin the path
    ctx.moveTo($game.radius, 0); // Move the "pencil" to the (radius, 0) on the unit circle
    for (let i = 1; i < sides; i++) {
      // Draw a line to each of the vertices of the polygon (plotting all the vertices on the circumference of a circle)
      ctx.lineTo(
        $game.radius * Math.cos(a * i),
        $game.radius * Math.sin(a * i)
      );
    }
    ctx.closePath();

    ctx.strokeStyle = "rgba(" + red + ", " + green + ", " + blue + ", 1.0)";
    ctx.stroke();

    ctx.fill();

    ctx.translate((-1 * canvas.width) / 2, (-1 * canvas.height) / 2);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }

  // // 3 Sides = 120 degrees = 30 degrees
  // // 4 Sides = 90 degrees = 45 degrees
  // // 5 Sides = 72 degrees = 54 degrees
  // // 6 Sides = 60 degrees = 60 degrees/0 degrees
  // // 7 Sides = 51.428571429 degrees = 51.428571429/4 degrees
  // // 8 Sides = 45 degrees = 22.5 degrees
  // // 9 Sides = 40 degrees = 30 degrees
  // // 10 Sides = 36 degrees = 0 degrees
  // // 11 Sides = 32.727272727 degrees = 32.727272727/4 degrees
  // // 12 Sides = 30 degrees = 15 degrees

  function rotationAngle(sides: number) {
    return (360 / sides) * (((sides + 2) % 4) / 4);
  }

  function drawPaddles() {
    ctx.lineWidth = Paddle.height;

    for (var i = 0; i < $game.sides; i++) {
      if ($game.players[i].paddle.visible) {
        ctx.beginPath();
        ctx.strokeStyle = $game.players[i].paddle.paddleColor;
        if ($game.players[i].paddle.shape === Shape.Regular){
          // Starting from the exact center, we move down the canvas (positive Y is down)
          // and across to where the right side of the paddle is
          // Old note, ignore: In place of 0, we need $game.players[i].paddle.x
          ctx.moveTo($game.players[i].paddle.x, getPaddleY());
          // We then go to the left (since negative X is left) by
          // the paddle width ($game.players[i].paddle.width)
          ctx.lineTo(
            $game.players[i].paddle.x - $game.players[i].paddle.width,
            getPaddleY()
          );
        } else if ($game.players[i].paddle.shape === Shape.Bumpy) {
          for (let j = 0; j < 5; j++){
            const zeroOrOne = j % 2;
            ctx.moveTo(
              $game.players[i].paddle.x - $game.players[i].paddle.width*(j)/5, 
              getPaddleY()+2-zeroOrOne*4
            );
            ctx.lineTo(
              $game.players[i].paddle.x - $game.players[i].paddle.width*(j+1)/5,
              getPaddleY()+2-zeroOrOne*4
            );
          }
        } else if ($game.players[i].paddle.shape === Shape.CurvedOutwards) {

          for (let j = 0; j < 5; j++){
            if (j < 3){
              ctx.moveTo(
                $game.players[i].paddle.x - $game.players[i].paddle.width*(j)/5, 
                getPaddleY()+5-j*5
              );
              ctx.lineTo(
                $game.players[i].paddle.x - $game.players[i].paddle.width*(j+1)/5,
                getPaddleY()+5-j*5
              );
            } else {
              ctx.moveTo(
                $game.players[i].paddle.x - $game.players[i].paddle.width*(j)/5, 
                getPaddleY()-15+j*5
              );
              ctx.lineTo(
                $game.players[i].paddle.x - $game.players[i].paddle.width*(j+1)/5,
                getPaddleY()-15+j*5
              );
            }
          }
        } else if ($game.players[i].paddle.shape === Shape.CurvedInwards) {

          for (let j = 0; j < 5; j++){
            if (j < 3){
              ctx.moveTo(
                $game.players[i].paddle.x - $game.players[i].paddle.width*(j)/5, 
                getPaddleY()-5+j*5
              );
              ctx.lineTo(
                $game.players[i].paddle.x - $game.players[i].paddle.width*(j+1)/5,
                getPaddleY()-5+j*5
              );
            } else {
              ctx.moveTo(
                $game.players[i].paddle.x - $game.players[i].paddle.width*(j)/5, 
                getPaddleY()+15-j*5
              );
              ctx.lineTo(
                $game.players[i].paddle.x - $game.players[i].paddle.width*(j+1)/5,
                getPaddleY()+15-j*5
              );
            }
          }
          
          // ctx.moveTo($game.players[i].paddle.x, getPaddleY());
          // // We then go to the left (since negative X is left) by
          // // the paddle width ($game.players[i].paddle.width)
          // ctx.lineTo(
          //   $game.players[i].paddle.x - $game.players[i].paddle.width,
          //   getPaddleY()
          // );

        }
        ctx.stroke();
        ctx.closePath();
      }
      ctx.rotate((2 * Math.PI) / $game.sides);
    }
    ctx.lineWidth = 1;
  }

  function getPaddleY() {
    // Attempting to get the paddles to resize well, still not a great solution but handles about 85% of cases well
    if ($game.sides == 2) {
      return 175;
    } else if ($game.sides === 3) {
      return 82;
      //     if ($game.radius < 200) {
      //         return 200 - 450 / $game.sides - 10;
      //     } else {
      //         return $game.radius - 450 / $game.sides - 10;
      //     }
    } else if ($game.sides === 4) {
      return 119;
    } else if ($game.sides === 5) {
      return 136;
    } else if ($game.sides === 6) {
      return 146;
    } else if ($game.sides === 7) {
      return 152;
    } else if ($game.sides === 8) {
      return 157;
    } else if ($game.sides === 9) {
      return 159;
    } else if ($game.sides === 10) {
      return 161;
    } else if ($game.sides === 11) {
      return 161;
    } else if ($game.sides === 12) {
      return 164;
    }
    // else {
    //   return $game.radius - 100 + 8 * $game.sides;
    //   // $game.radius - 450 / $game.sides + $game.sides;
    // }
  }

  function moveBall() {
    for (var i = 0; i < $game.balls.length; i++) {
      $game.balls[i].x += $game.balls[i].dx;
      $game.balls[i].y += $game.balls[i].dy;
    }
  }

  function drawBall() {
    // If the ball is invisible (across all clients)
    for (var i = 0; i < $game.balls.length; i++) {
      if ($game.balls[i].visible) {
        ctx.beginPath();
        ctx.arc($game.balls[i].x, $game.balls[i].y, $game.balls[i].radius, 0, Math.PI * 2);
        ctx.fillStyle = "#0095DD";
        ctx.fill();
        ctx.closePath();
      }

      // If the pathShown power up is active for this client
      if (pathShown) {
        ctx.lineWidth = 3;
        ctx.beginPath();
        canvas_arrow(
          ctx, 
          $game.balls[i].x, 
          $game.balls[i].y, 
          $game.balls[i].x + $game.balls[i].dx*100, 
          $game.balls[i].y + $game.balls[i].dy*100);
        // ctx.moveTo($game.balls[i].x, $game.balls[i].y);
        // ctx.lineTo($game.balls[i].x + $game.balls[i].dx*100, $game.balls[i].y + $game.balls[i].dy*100)
        ctx.strokeStyle = "#0095DD";
        ctx.stroke();
        ctx.closePath();
      }
    }
  }

  // Draws an arrow to the canvas, used for path tracing/showing the path of the ball
  // Taken from : https://stackoverflow.com/questions/808826/draw-arrow-on-canvas-tag
  function canvas_arrow(context: CanvasRenderingContext2D, fromx: number, fromy: number, tox: number, toy: number) {
    var headlen = 10; // length of head in pixels
    var dx = tox - fromx;
    var dy = toy - fromy;
    var angle = Math.atan2(dy, dx);
    context.moveTo(fromx, fromy);
    context.lineTo(tox, toy);
    context.lineTo(tox - headlen * Math.cos(angle - Math.PI / 6), toy - headlen * Math.sin(angle - Math.PI / 6));
    context.moveTo(tox, toy);
    context.lineTo(tox - headlen * Math.cos(angle + Math.PI / 6), toy - headlen * Math.sin(angle + Math.PI / 6));
  }

  // Collision detection function, returns true or false
  function collisionDetect(ballIndex: number) {

    // For a two player game, all collision detection is done on one client (player 0)
    // Player 1 waits to receive an update from Player 0 to prevent overwriting and 
    // conflicting state between server and the two clients
    if ($game_info.sides === 2 && $game_info.my_player_number === 0) {
      if( ($game.balls[ballIndex].x - $game.balls[ballIndex].dx - $game.balls[ballIndex].radius) < -canvas.width/2 || 
        ($game.balls[ballIndex].x + $game.balls[ballIndex].dx + $game.balls[ballIndex].radius) > canvas.width/2){
          return true;
      }
    }

    const theta = (2 * Math.PI * $game_info.my_player_number) / $game.sides;
    const transformedBallX =
      $game.balls[ballIndex].x * Math.cos(theta) + $game.balls[ballIndex].y * Math.sin(theta);
    const transformedBallY =
      -$game.balls[ballIndex].x * Math.sin(theta) + $game.balls[ballIndex].y * Math.cos(theta);

    var topOfPaddle = getPaddleY() - Paddle.height / 2;
    var rightOfPaddle = $game.players[$game_info.my_player_number].paddle.x;
    var bottomOfPaddle = getPaddleY() + Paddle.height / 2;
    var leftOfPaddle =
      $game.players[$game_info.my_player_number].paddle.x -
      $game.players[$game_info.my_player_number].paddle.width;

    var topOfBall = transformedBallY - $game.balls[ballIndex].radius;
    var rightOfBall = transformedBallX + $game.balls[ballIndex].radius;
    var bottomOfBall = transformedBallY + $game.balls[ballIndex].radius;
    var leftOfBall = transformedBallX - $game.balls[ballIndex].radius;

    // The issue wasn't drawing, it was actually to do with the stored coordinates
    // For collision detection, we now transform the X and Y ball co'ords received
    // from the server (since the server ball co'ords are with respect to Player 0)
    // This is why collision detection was only working for Player 0: the server's
    // ball co'ords needed to be rotated to get the actual place where the ball is
    // drawn on the screen. Right now, we still are just drawing the server ball co'ords,
    // then rotating the canvas, then transforming the co'ords for collision detection.
    // To simplify, we could just transform the server co'ords right away, then
    // draw the ball to the screen without rotation! Let's talk about it
    // In hindsight, we maybe could have just transformed the paddle co'ords too
    // instead of rotating the canvas; not 100% sure but it may also work
    // For the coordinate rotation: https://en.wikipedia.org/wiki/Rotation_of_axes
    // ctx.beginPath();
    // ctx.moveTo(leftOfPaddle, topOfPaddle);
    // ctx.lineTo(rightOfPaddle, bottomOfPaddle);
    // ctx.strokeStyle = "rgb(0,0,255)";
    // ctx.stroke();
    // ctx.closePath();

    return (
      leftOfBall < rightOfPaddle &&
      topOfBall < bottomOfPaddle &&
      rightOfBall > leftOfPaddle &&
      bottomOfBall > topOfPaddle
    );
  }

  // Note: for 2-player games, all collision handling is done on one client (player 0)
  // and sent to the other client as an update
  // This is done to prevent the two clients from overwriting each other, 
  // causing the ball to never properly update dx and dy
  function handleCollision(ballIndex: number) {

    const theta = (2 * Math.PI * $game_info.my_player_number) / $game.sides;
    let angle = theta;
    const transformedBallX = $game.balls[ballIndex].x * Math.cos(theta) + $game.balls[ballIndex].y * Math.sin(theta);
    const transformedBallY = -$game.balls[ballIndex].x * Math.sin(theta) + $game.balls[ballIndex].y * Math.cos(theta);
    const transformedBalldX = $game.balls[ballIndex].dx * Math.cos(theta) + $game.balls[ballIndex].dy * Math.sin(theta);
    const transformedBalldY = -$game.balls[ballIndex].dx * Math.sin(theta) + $game.balls[ballIndex].dy * Math.cos(theta);
    
    // Handle Wall Collisions - 2 Player Game Only
    if ($game_info.sides === 2 && $game_info.my_player_number === 0 && ((transformedBallX - transformedBalldX - $game.balls[ballIndex].radius) < -canvas.width/2 || (transformedBallX + transformedBalldX + $game.balls[ballIndex].radius) > canvas.width/2)) {
      console.log("We are in wall collision detection, player 0");
      $game.balls[ballIndex].dx = -1 * ($game.balls[ballIndex].dx); // -1 to reverse the direction of the ball
      $game.balls[ballIndex].dy = $game.balls[ballIndex].dy; // dy remains the same, we are just bouncing off the wall
      moveBall();
      moveBall();
    } else if ($game.sides === 2 && $game_info.my_player_number === 1 && ((transformedBallX - transformedBalldX - $game.balls[ballIndex].radius) < -canvas.width/2 || (transformedBallX + transformedBalldX + $game.balls[ballIndex].radius) > canvas.width/2)){
              // If we are player 1 and the ball hits the wall/goes out of bounds, do not do anything - wait for update from player 0
      console.log("We are in wall collision detection, player 1");
    // Handle Regular Shape Paddle Collisions
    } else if ($game.players[$game_info.my_player_number].paddle.shape === Shape.Regular){
      console.log("We are in regular collision detection");

      // If the ball hits the left quarter of the paddle, make the ball go left
      if (
        transformedBallX <
        $game.players[$game_info.my_player_number].paddle.x -
          (3 * $game.players[$game_info.my_player_number].paddle.width) / 4
      ) {
        angle = theta + (-1 * Math.PI) / 4; // -45 degrees
      }
      // Else If the ball hits the right quarter of the paddle, make the ball go right
      else if (
        transformedBallX >
        $game.players[$game_info.my_player_number].paddle.x -
          $game.players[$game_info.my_player_number].paddle.width / 4
      ) {
        angle = theta + Math.PI / 4; // 45 degrees
      }
      // Else Angle = 0

      // Update X and Y velocity of the ball
      $game.balls[ballIndex].dy = -1 * $game.balls[ballIndex].velocity * Math.cos(angle); // -1 to reverse the direction of the ball
      $game.balls[ballIndex].dx = $game.balls[ballIndex].velocity * Math.sin(angle);
    
    } else if ($game.players[$game_info.my_player_number].paddle.shape === Shape.Bumpy){
      console.log("We are in bumpy collision detection");
      const randAngle = Math.floor(Math.random() * (120 + 1) -60);
      // Update X and Y velocity of the ball
      angle = theta + randAngle*Math.PI/180;
      $game.balls[ballIndex].dy = -1 * $game.balls[ballIndex].velocity * Math.cos(angle); // -1 to reverse the direction of the ball
      $game.balls[ballIndex].dx = $game.balls[ballIndex].velocity * Math.sin(angle);
    } else if ($game.players[$game_info.my_player_number].paddle.shape === Shape.CurvedOutwards){
      console.log("We are in curvedOutwards collision detection");
      const returnAngle = -60 + 120*(transformedBallX - $game.players[$game_info.my_player_number].paddle.x + $game.players[$game_info.my_player_number].paddle.width)/$game.players[$game_info.my_player_number].paddle.width;
      console.log("Return Angle: " + returnAngle);
      angle = theta + returnAngle*Math.PI/180;
      $game.balls[ballIndex].dy = -1 * $game.balls[ballIndex].velocity * Math.cos(angle); // -1 to reverse the direction of the ball
      $game.balls[ballIndex].dx = $game.balls[ballIndex].velocity * Math.sin(angle);
    } else if ($game.players[$game_info.my_player_number].paddle.shape === Shape.CurvedInwards){
      console.log("We are in curvedInwards collision detection");
      const returnAngle = +60 - 120*(transformedBallX - $game.players[$game_info.my_player_number].paddle.x + $game.players[$game_info.my_player_number].paddle.width)/$game.players[$game_info.my_player_number].paddle.width;
      console.log("Return Angle: " + returnAngle);
      angle = theta + returnAngle*Math.PI/180;
      $game.balls[ballIndex].dy = -1 * $game.balls[ballIndex].velocity * Math.cos(angle); // -1 to reverse the direction of the ball
      $game.balls[ballIndex].dx = $game.balls[ballIndex].velocity * Math.sin(angle);
    }

    if (!($game.sides === 2 && $game_info.my_player_number === 1 && ((transformedBallX - transformedBalldX - $game.balls[ballIndex].radius) < -canvas.width/2 || (transformedBallX + transformedBalldX + $game.balls[ballIndex].radius) > canvas.width/2))){
      sendUpdate("ball_update");
    }

    // Increase ball's velocity
    $game.balls[ballIndex].velocity += 0.2;
  }

  function gameOver(ballIndex: number) {
    const theta = (2 * Math.PI * $game_info.my_player_number) / $game.sides;
    const transformedBallY =
      -$game.balls[ballIndex].x * Math.sin(theta) + $game.balls[ballIndex].y * Math.cos(theta);
    const topOfBall = transformedBallY - $game.balls[ballIndex].radius;
    const bottomOfPaddle = getPaddleY() + Paddle.height / 2;
    return topOfBall > bottomOfPaddle;
  }

  function handleGameOver() {
    window.removeEventListener("keydown", handleKeyPresses);
    window.removeEventListener("keyup", handleKeyPresses);
    window.removeEventListener("blur", blurHandler);
    clearInterval(gameLoopRunning);
    clearInterval(distractingBackgroundInterval);

    if ($game_info.sides < 2) {
      // The current player has come second in the entire game
      return;
    } else {
      // The current player has been eliminated and other players will continue to battle it out,
      // sans the current player
      const payload: ClientSaysGameOver = {
        type: "game_over",
        lobby_id: $lobby_id,
        player_number: $game_info.my_player_number,
        user_id: $user_id,
      };
      $ws.send(JSON.stringify(payload));
    }
  }

  // Note that when calling animateText, the origin must be set to the center of the canvas
  // (ie. (x,y) = (canvas.width/2, canvas.height/2) )
  function animateText(text: string, duration: number) {
    ctx.font = "normal 22px SuperLegendBoy";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    var aI = setInterval(function () {
      drawText(text);
    }, duration / 100);
    animationInterval.push(aI);
  }

  function drawText(text: string) {
    textAlpha += 0.01;
    ctx.fillStyle = "rgba(255,69,0, " + textAlpha + ")"; // CSS: orangered, hex value is #ff4500
    ctx.fillText(text, 0, 0);
    if (Math.round(textAlpha * 100) / 100 == 1) {
      animationInterval.forEach(clearInterval);
      // clearInterval(animationInterval);
      clearScreenOriginCentered();
      textAlpha = 0;
      // ctx.setTransform(1, 0, 0, 1, 0, 0);
    }
  }

  function clearScreenOriginCentered() {
    ctx.translate((-1 * canvas.width) / 2, (-1 * canvas.height) / 2);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.translate(canvas.width / 2, canvas.height / 2);
  }

  // function drawTriangle() {
  //   startGame(3);
  // }

  // function drawSquare() {
  //   startGame(4);
  // }

  // function drawPentagon() {
  //   startGame(5);
  // }

  // function drawHexagon() {
  //   startGame(6);
  // }

  // function drawSeptagon() {
  //   startGame(7);
  // }

  // function drawOctagon() {
  //   startGame(8);
  // }

  // function drawNonagon() {
  //   startGame(9);
  // }

  // function drawDecagon() {
  //   startGame(10);
  // }

  // function drawHendecagon() {
  //   startGame(11);
  // }

  // function drawDodecagon() {
  //   startGame(12);
  // }

  const sendUpdate = (msg) => {
    const payload: ClientUpdate = {
      type: "client_update",
      player_id: $user_id,
      lobby_id: $lobby_id,
      player_number: $game_info.my_player_number,
      event: $game.jsonify(),
      message: msg,
    };
    $ws.send(JSON.stringify(payload));
  };

  var keyMap: any = {};
  function handleKeyPresses(event: any) {
    keyMap[event.keyCode] = event.type == "keydown";
    
    if (keyMap[37]) {
      if (leftArrowPressed === false){
        leftArrowPressed = true;
        $game.players[$game_info.my_player_number].paddle.moving_left = true;
        sendUpdate("paddle_press_left");
      }
    }
    else {
      if (leftArrowPressed === true) {
        leftArrowPressed = false;
        $game.players[$game_info.my_player_number].paddle.moving_left = false;
        sendUpdate("paddle_release_left");
      }
    }
    if (keyMap[39]) {
      if (rightArrowPressed === false){
        rightArrowPressed = true;
        $game.players[$game_info.my_player_number].paddle.moving_right = true;
        sendUpdate("paddle_press_right");
      }
    }
    else {
      if (rightArrowPressed === true){
        rightArrowPressed = false;
        $game.players[$game_info.my_player_number].paddle.moving_right = false;
        sendUpdate("paddle_release_right");
      }
    }
    if (keyMap[49]) {
      console.log("Pressed 1 " + $power_up_one_used);
      if (!$power_up_one_used) {
        $power_up_one_used = true;
        handlePowerup($power_ups_str[0]);
      }
    }
    else {
      // console.log("Key Let Go");
    }
    if (keyMap[50]) {
      console.log("Pressed 2");
      if (!$power_up_two_used) {
        $power_up_two_used = true;
        handlePowerup($power_ups_str[1]);
      }
    }
    else {
      // console.log("Key Let Go");
    }
    if (keyMap[51]) {
      console.log($power_ups_str);
      if (!$power_up_three_used) {
        $power_up_three_used = true;
        handlePowerup($power_ups_str[2]);
      }
    }
    else {
      // console.log("Key Let Go");
    }
  }

  // Activated when we press a key down
  // function keyDownHandler(event: any) {
  //   if (!leftArrowPressed && !rightArrowPressed) {
  //     switch (event.keyCode) {
  //       case 37: // Left arrow key
  //         leftArrowPressed = true;
  //         $game.players[$game_info.my_player_number].paddle.moving_left = true;
  //         sendUpdate("paddle_press_left");
  //         break;
  //       case 39: // Right arrow key
  //         rightArrowPressed = true;
  //         $game.players[$game_info.my_player_number].paddle.moving_right = true;
  //         sendUpdate("paddle_press_right");
  //         break;
  //       case 49: // 1
  //         console.log("Pressed 1 " + $power_up_one_used);
  //         if (!$power_up_one_used) {
  //           $power_up_one_used = true;
  //           handlePowerup($power_ups_str[0]);
  //         }
  //         break;
  //       case 50: // 2
  //         console.log("Pressed 2");
  //         if (!$power_up_two_used) {
  //           $power_up_two_used = true;
  //           handlePowerup($power_ups_str[1]);
  //         }
  //         break;
  //       case 51: // 3
  //         console.log($power_ups_str);
  //         if (!$power_up_three_used) {
  //           $power_up_three_used = true;
  //           handlePowerup($power_ups_str[2]);
  //         }
  //         break;
  //       // case 57: // 9
  //       //   console.log("9");
  //     }
  //   }
  // }

  // // Activated when we release the key
  // function keyUpHandler(event: any) {
  //   switch (event.keyCode) {
  //     case 37: // Left arrow key
  //       leftArrowPressed = false;
  //       $game.players[$game_info.my_player_number].paddle.moving_left = false;
  //       sendUpdate("paddle_release_left");
  //       break;
  //     case 39: // Right arrow key
  //       rightArrowPressed = false;
  //       console.log("In keyUp Handler: ");
  //       console.log(JSON.stringify($game));
  //       console.log(JSON.stringify($game.players[$game_info.my_player_number]));
  //       $game.players[$game_info.my_player_number].paddle.moving_right = false;
  //       sendUpdate("paddle_release_right");
  //       break;
  //     case 49: // 1
  //       console.log("Key Let Go");
  //     case 50: // 2
  //       console.log("Key Let Go");
  //     case 51: // 3
  //       console.log("Key Let Go");
  //     case 57: // 9
  //       console.log("Key Let Go");
  //   }
  // }

  // Activated when the window loses focus
  function blurHandler(event: any) {
    console.log("Game lost focus!");
    leftArrowPressed = false;
    rightArrowPressed = false;
    // reset player moving
    $game.players[$game_info.my_player_number].paddle.moving_left = false;
    $game.players[$game_info.my_player_number].paddle.moving_right = false;
    // reset key being pressed
    keyMap[37] = keyMap[39] = false;
    sendUpdate("lost_focus")
  }

  function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async function getXP(): number{
    console.log("We are in getXP(), client side");
    if (await (await $auth0Client).isAuthenticated()){
      console.log("We are authenticated, client side");
      console.log("The username we are sending in getXP: " + $user.username);
      const response = await fetch(SERVER_URL + "getxp/" + $user.username);
      console.log($user);
      const responseBody = await response.text();
      const tempXP = parseInt(responseBody);
      console.log("tempXP: " + tempXP);
      if(!isNaN(tempXP)){
        return tempXP;
      }
      return 0;
    }
  }

  function handlePowerup(powerup: PowerupStrings) {
    if (powerup === "bigger") {
      //console.log("We are in 'bigger'");
      //console.log("Paddle width: " + $game.players[$game_info.my_player_number].paddle.width);
      //console.log("Paddle widthMultiplier: " + Paddle.widthMultiplier);

      $game.players[$game_info.my_player_number].paddle.width =
        $game.players[$game_info.my_player_number].paddle.width *
        Paddle.widthMultiplier;
      $game.players[$game_info.my_player_number].paddle.x += (Paddle.widthMultiplier-1)/2;
      //console.log("New paddle width: " + $game.players[$game_info.my_player_number].paddle.width);
      sendUpdate("bigger");
      setTimeout(function () {
        console.log("New width, bigger PU being reset: " + $game.players[$game_info.my_player_number].paddle.regularWidth);
        $game.players[$game_info.my_player_number].paddle.width =
          $game.players[$game_info.my_player_number].paddle.regularWidth;
        $game.players[$game_info.my_player_number].paddle.x -= (Paddle.widthMultiplier-1)/2;
        sendUpdate("bigger");
      }, Paddle.changeWidthDuration);
    } else if (powerup === "smaller") {
      for (let i = 0; i < $game_info.sides; i++) {
        if (i !== $game_info.my_player_number) {
          $game.players[i].paddle.width =
            $game.players[i].paddle.width / Paddle.widthMultiplier;
        }
      }
      sendUpdate("smaller");
      setTimeout(function () {
        console.log("New width, smaller PU being reset: " + $game.players[$game_info.my_player_number].paddle.regularWidth);
        for (let i = 0; i < $game_info.sides; i++) {
          if (i !== $game_info.my_player_number) {
            $game.players[i].paddle.width =
              $game.players[$game_info.my_player_number].paddle.regularWidth;
          }
        }
        sendUpdate("smaller");
      }, Paddle.changeWidthDuration);
    } else if (powerup === "selfInvisible") {
      $game.players[$game_info.my_player_number].paddle.visible = false;
      sendUpdate("selfInvisible");
      setTimeout(function () {
        $game.players[$game_info.my_player_number].paddle.visible = true;
        sendUpdate("selfInvisible");
      }, Paddle.invisibleDuration);
    } else if (powerup === "othersInvisible") {
      for (let i = 0; i < $game_info.sides; i++) {
        if (i !== $game_info.my_player_number) {
          $game.players[i].paddle.visible = false;
        }
      }
      sendUpdate("othersInvisible");
      setTimeout(function () {
        for (let i = 0; i < $game_info.sides; i++) {
          if (i !== $game_info.my_player_number) {
            $game.players[i].paddle.visible = true;
          }
        }
        sendUpdate("othersInvisible");
      }, Paddle.invisibleDuration);
    } else if (powerup === "ballInvisible") {
      for (var i = 0; i < $game.balls.length; i++) {
        $game.balls[i].visible = false;
      }
      sendUpdate("ballInvisible");
      setTimeout(function () {
        for (var i = 0; i < $game.balls.length; i++) {
          $game.balls[i].visible = true;
        }
        sendUpdate("ballInvisible");
      }, Ball.invisibleDuration);
    } else if (powerup === "distracting") {
      
      let index = Math.floor(Math.random() * Object.entries(Color).length);
      console.log(index);
      $game.backgroundColor = Object.values(Color)[index];
      console.log(Object.values(Color)[index]);
      console.log($game.backgroundColor);
      sendUpdate("distracting");
      distractingBackgroundInterval = setInterval(function () {
        let index = Math.floor(Math.random() * Object.entries(Color).length);
        console.log(index);
        $game.backgroundColor = Object.values(Color)[index];
        console.log(Object.values(Color)[index]);
        console.log($game.backgroundColor);
        sendUpdate("distracting");
      }, 5000);

    } else if (powerup === "bumpy") {
      myShape = Shape.Bumpy;
      $game.players[$game_info.my_player_number].paddle.shape = Shape.Bumpy;
      sendUpdate("bumpy");
    } else if (powerup === "curvedInwards") {
      myShape = Shape.CurvedInwards;
      $game.players[$game_info.my_player_number].paddle.shape = Shape.CurvedInwards;
      sendUpdate("curvedInwards");
    } else if (powerup === "curvedOutwards") {
      myShape = Shape.CurvedOutwards;
      $game.players[$game_info.my_player_number].paddle.shape = Shape.CurvedOutwards;
      sendUpdate("curvedOutwards");
    } else if (powerup === "tracePath") {
      pathShown = true;
      setTimeout(function () {
        pathShown = false;
      }, Ball.pathDuration);
      
    } else if (powerup === "anotherBall") {
      sendUpdate("ball_update");
      sendUpdate("anotherBall");
    }
  }

  function playSound(id: string){
    const mySound = document.getElementById(id);   
    mySound.play();
    //document.getElementById("sound").innerHTML="<audio autoplay loop> <source src=\"/sounds/XP.wav\" type=\"audio/wav\">Your browser does not support the audio element.</audio>";
  }
</script>

<!-- <body onload="load()" onresize="getSize()"> -->
<body>
  <audio id="XP" volume="0.25">   
    <source src="/sounds/XP.wav" />   
  </audio>
  <audio id="You-Win" volume="0.25">   
    <source src="/sounds/You-Win.wav" />   
  </audio>
  <audio id="Game-Over" volume="0.25">   
    <source src="/sounds/Game-Over.wav" />   
  </audio>

  <!-- <iframe class="audio" loop autoplay controls style = "display:none;">
    <source src="/sounds/XP.wav" type="audio/wav"/>
  </iframe> -->

  <!-- <audio autoplay loop>
    <source src="/sounds/XP.wav" type="audio/wav">
    Your browser does not support the audio element.
  </audio> -->
  <h1 id="header" style="background-color: #353839;">PolyPong</h1>
  <hr />
  {#await $auth0Client then client}
    {#await client.isAuthenticated() then isauthenticated}
      {#if isauthenticated}
        <!-- <div>hey you're authenticated</div> -->
      {/if}
    {/await}
  {/await}

  <canvas
    id="drawing"
    bind:this={canvas}
    width="800"
    height="800"
    style="border:1px solid rgb(255,255,255)"
  />

  <br />


  <p>Inventory:</p>

  {#if !$power_up_one_used}
    <p>Press 1 to use: {$power_ups_str_long[0]}</p>
  {/if}
  <!-- <p>Note this does not currently update when the power up is used</p>-->
  {#if !$power_up_two_used}
    <p>Press 2 to use: {$power_ups_str_long[1]}</p>
  {/if}
  {#if !$power_up_three_used}
    <p>Press 3 to use: {$power_ups_str_long[2]}</p>
  {/if}

  {#if $power_up_one_used && $power_up_two_used && $power_up_three_used}
    <p>No Powerups Remaining</p>
  {/if}

  <!-- <p>Draw a:</p>

  <div>
    <button id="triangle" class="button button8" on:click={drawTriangle}
      >Triangle</button
    >
    <button id="square" class="button button8" on:click={drawSquare}
      >Square</button
    >
    <button id="pentagon" class="button button8" on:click={drawPentagon}
      >Pentagon</button
    >
    <button id="hexagon" class="button button8" on:click={drawHexagon}
      >Hexagon</button
    >
  </div>
  <div>
    <button id="septagon" class="button button8" on:click={drawSeptagon}
      >Septagon</button
    >
    <button id="octagon" class="button button8" on:click={drawOctagon}
      >Octagon</button
    >
    <button id="nonagon" class="button button8" on:click={drawNonagon}
      >Nonagon</button
    >
    <button id="decagon" class="button button8" on:click={drawDecagon}
      >Decagon</button
    >
  </div>
  <div>
    <button id="hendecagon" class="button button8" on:click={drawHendecagon}
      >Hendecagon</button
    >
    <button id="dodecagon" class="button button8" on:click={drawDodecagon}
      >Dodecagon</button
    >
  </div> -->
</body>

<!-- <body onload="load()" onresize="getSize()"> -->
<style>
  @font-face {
    font-family: SuperLegendBoy;
    src: url("/fonts/SuperLegendBoy-4w8Y.ttf");
  }

  /* html, body {
    margin: 0 !important;
    padding: 0 !important;
} */

  h1 {
    font-family: SuperLegendBoy;
    text-align: center;
    color: white;
    background-color: #353839;
  }

  body {
    font-family: SuperLegendBoy;
    font-size: 22px;
    text-align: center;
    color: white;
    background-color: #353839;
  }

  p {
    font-family: SuperLegendBoy;
    text-align: center;
    font-size: 22px;
  }

  .button {
    font-family: SuperLegendBoy;
    border: 2px solid #ffffff;
    height: auto;
    color: white;
    padding: 15px 15px;
    text-align: center;
    text-decoration: none;
    display: inline-block;
    font-size: 22px;
    margin: 10px 0px;
    cursor: pointer;
    background-color: #353839;
    width: 20%;
    margin-left: auto;
    margin-right: auto;
  }

  .button8 {
    color: white;
    background-color: #353839;
    border: 2px solid white;
  }
  .button8:hover {
    background-color: white;
    color: #353839;
  }

  .label1 {
    padding: 150px 120px;
  }

  .label2 {
    padding: 150px 150px;
  }

  .input {
    font-family: SuperLegendBoy;
    height: auto;
    width: 50%;
    padding: 15px 0px;
    text-align: center;
    border: 2px solid white;
    background-color: #353839;
    font-size: 22px;
    margin: 10px 0px;
  }

  input:focus {
    color: white;
  }
</style>
