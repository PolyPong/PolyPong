<script lang="typescript">
  import {
    game_info,
    ws,
    user_id,
    lobby_id,
    game,
    game_active,
    all_clients_ready,
    stop_game_loop,
    loss_info,
    auth0Client,
  } from "../store";
  import { onMount, tick } from "svelte";
  import { Ball, Paddle } from "@polypong/polypong-common";
  import type {
    ClientUpdate,
    KeyDownEvent,
    KeyUpEvent,
    ClientReady,
    ClientSaysGameOver,
    ClientStopped,
    GameWon,
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
  let textAlpha: number = 0;

  const paddleCoverageRatio: number = 1 / 4;
  const ballScaleFactor: number = 1 / 30;
  // const frameRate = 1000/60;  // 60 FPS
  const frameRate = 1000 / 60;

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

  async function load() {
    w = document.documentElement.clientWidth;
    h = document.documentElement.clientHeight;
    canvas = document.getElementById("drawing") as HTMLCanvasElement;

    // canvas.width = w - 100;
    // canvas.height = h - 150;
    canvas.width = 400;
    canvas.height = 400;
    ctx = canvas.getContext("2d")! as CanvasRenderingContext2D;

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
      }
      await tick();
    }, 50);

    serverSaysStopGameInterval = setInterval(async () => {
      if ($stop_game_loop) {
        $stop_game_loop = false;

        clearInterval(gameLoopRunning);
        // animateText("Player " + $loss_info.player_number + ", " + $loss_info.user_id + ", has lost", 8000);
        // await sleep(8000);

        if ($game_info.sides === 2) {
          clearScreenOriginCentered();
          animateText("You Win!", 8000);
          // clearInterval(gameActiveInterval);
          await sleep(8000);
          if (await (await $auth0Client).isAuthenticated()) {
            router.goto("/login");
          }
          router.goto("/home");
        }

        const payload: ClientStopped = {
          type: "client_stopped",
          lobby_id: $lobby_id,
        };
        $ws.send(JSON.stringify(payload));
        ctx.translate((-1 * canvas.width) / 2, (-1 * canvas.height) / 2);
      }
      await tick();
    }, 50);
  }

  function startGame(sides: number, player_number: number, ball: Ball) {
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
    // ctx.scale(w/canvas.width, h/canvas.height)

    $game.radius = 175; // Set the radius of the game

    // Get the length of each side
    $game.sideLength = 2 * $game.radius * Math.sin(Math.PI / $game.sides);

    // Set the width of each paddle to be a quarter of the side length
    for (var i = 0; i < $game.players.length; i++) {
      $game.players[i].paddle.width = $game.sideLength * paddleCoverageRatio;
      // TODO: Need to handle if expanded paddle/shrunk paddle is applied here
    }

    // TODO adjust the ball size based on $game.radius
    $game.ball.radius = $game.radius * ballScaleFactor;
  }

  export function gameLoop() {
    update(); // For updating the state of the game
    render(); // For rendering the updated state of the game (ie. clears the screen and draws the new state onto the canvas)
  }

  // Update the state of the game, using what the server sends us
  function update() {
    // Handles paddle movement side-to-side using the left and right arrow keys,
    // only lets the paddle move along the length of its respective side (bounded by the side length)
    if (
      leftArrowPressed &&
      $game.players[$game_info.my_player_number].paddle.x -
        $game.players[$game_info.my_player_number].paddle.width -
        Paddle.velocity >
        -$game.sideLength / 2
    ) {
      $game.players[$game_info.my_player_number].paddle.x -= Paddle.velocity;
    } else if (
      rightArrowPressed &&
      $game.players[$game_info.my_player_number].paddle.x + Paddle.velocity <
        $game.sideLength / 2
    ) {
      $game.players[$game_info.my_player_number].paddle.x += Paddle.velocity;
    }

    // simulate other players movement
    for (var i = 0; i < $game.players.length; i++) {
      // skip updating self since already handled above
      if (i == $game_info.my_player_number) continue;

      // let paddle = $game.players[i].paddle;
      if ($game.players[i].paddle.moving) {
        // moving right
        if ($game.players[i].paddle.direction) {
          // constrain movement to length of side
          if (
            $game.players[i].paddle.x + Paddle.velocity <
            $game.sideLength / 2
          ) {
            $game.players[i].paddle.x += Paddle.velocity;
          }
        }
        // moving left
        else {
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
    }

    moveBall();

    if (collisionDetect()) {
      handleCollision();
    }

    if (gameOver()) {
      handleGameOver();
    }
  }

  // Re-render the game according to the new state
  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

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
    if (gameOver()) {
      drawGameOver();
    }
  }

  async function drawGameOver() {
    clearScreenOriginCentered();
    animateText("Game Over", 8000);
    await sleep(8000);
    if (await (await $auth0Client).isAuthenticated()) {
      router.goto("/login");
    }
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

    // For changing the background color of just the game board/within the polygon
    ctx.fillStyle = $game.backgroundColor; // See $game.ts, default color is set to the same color as rest of board
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
      ctx.beginPath();
      ctx.strokeStyle = $game.players[i].paddle.paddleColor;

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
      ctx.stroke();
      ctx.closePath();
      ctx.rotate((2 * Math.PI) / $game.sides);
    }
    ctx.lineWidth = 1;
  }

  function getPaddleY() {
    // Attempting to get the paddles to resize well, still not a great solution but handles about 85% of cases well
    if ($game.sides == 3) {
      return $game.radius - 98 + 5 * $game.sides;
      //     if ($game.radius < 200) {
      //         return 200 - 450 / $game.sides - 10;
      //     } else {
      //         return $game.radius - 450 / $game.sides - 10;
      //     }
    } else {
      return $game.radius - 100 + 8 * $game.sides;
      // $game.radius - 450 / $game.sides + $game.sides;
    }
  }

  function moveBall() {
    $game.ball.x += $game.ball.dx;
    $game.ball.y += $game.ball.dy;
  }

  function drawBall() {
    ctx.beginPath();
    ctx.arc($game.ball.x, $game.ball.y, $game.ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = "#0095DD";
    ctx.fill();
    ctx.closePath();
  }

  // Collision detection function, returns true or false
  function collisionDetect() {
    const theta = (2 * Math.PI * $game_info.my_player_number) / $game.sides;
    const transformedBallX =
      $game.ball.x * Math.cos(theta) + $game.ball.y * Math.sin(theta);
    const transformedBallY =
      -$game.ball.x * Math.sin(theta) + $game.ball.y * Math.cos(theta);

    var topOfPaddle = getPaddleY() - Paddle.height / 2;
    var rightOfPaddle = $game.players[$game_info.my_player_number].paddle.x;
    var bottomOfPaddle = getPaddleY() + Paddle.height / 2;
    var leftOfPaddle =
      $game.players[$game_info.my_player_number].paddle.x -
      $game.players[$game_info.my_player_number].paddle.width;

    var topOfBall = transformedBallY - $game.ball.radius;
    var rightOfBall = transformedBallX + $game.ball.radius;
    var bottomOfBall = transformedBallY + $game.ball.radius;
    var leftOfBall = transformedBallX - $game.ball.radius;

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

  function handleCollision() {
    const theta = (2 * Math.PI * $game_info.my_player_number) / $game.sides;
    let angle = theta;
    const transformedBallX =
      $game.ball.x * Math.cos(theta) + $game.ball.y * Math.sin(theta);
    const transformedBallY =
      -$game.ball.x * Math.sin(theta) + $game.ball.y * Math.cos(theta);

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
    let dy = -1 * $game.ball.velocity * Math.cos(angle); // -1 to reverse the direction of the ball
    let dx = $game.ball.velocity * Math.sin(angle);

    // console.log("Dy on server: " + dy);
    // console.log("Dx on server: " + dx);

    // $game.ball.dy = -1 * $game.ball.velocity * Math.cos(angle); // -1 to reverse the direction of the ball
    // $game.ball.dx = $game.ball.velocity * Math.sin(angle);

    // $game.ball.dy = -$game.ball.dy; // -1 to reverse the direction of the ball
    // $game.ball.dx = -$game.ball.dx;
    $game.ball.dy = -1 * $game.ball.velocity * Math.cos(angle); // -1 to reverse the direction of the ball
    $game.ball.dx = $game.ball.velocity * Math.sin(angle);

    const payload: ClientUpdate = {
      type: "client_update",
      event: $game.jsonify(),
      player_number: $game_info.my_player_number,
      lobby_id: $lobby_id,
      player_id: $user_id,
      message: "ball_update",
    };
    $ws.send(JSON.stringify(payload));

    // Increase ball's velocity (optional)
    // $game.ball.dy = -dx*Math.sin(theta) + dy*Math.cos(theta);
    // $game.ball.dx = dx*Math.cos(theta) + dy*Math.sin(theta);

    // console.log("Transformed Dy: " + $game.ball.dy);
    // console.log("Transformed Dx: " + $game.ball.dx);

    $game.ball.velocity += 0.2;
  }

  function gameOver() {
    const theta = (2 * Math.PI * $game_info.my_player_number) / $game.sides;
    const transformedBallY =
      -$game.ball.x * Math.sin(theta) + $game.ball.y * Math.cos(theta);
    const topOfBall = transformedBallY - $game.ball.radius;
    const bottomOfPaddle = getPaddleY() + Paddle.height / 2;
    return topOfBall > bottomOfPaddle;
  }

  function handleGameOver() {
    clearInterval(gameLoopRunning);

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
    console.log("We are setting the animation interval: " + aI);
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

  function drawTriangle() {
    startGame(3);
  }

  function drawSquare() {
    startGame(4);
  }

  function drawPentagon() {
    startGame(5);
  }

  function drawHexagon() {
    startGame(6);
  }

  function drawSeptagon() {
    startGame(7);
  }

  function drawOctagon() {
    startGame(8);
  }

  function drawNonagon() {
    startGame(9);
  }

  function drawDecagon() {
    startGame(10);
  }

  function drawHendecagon() {
    startGame(11);
  }

  function drawDodecagon() {
    startGame(12);
  }

  // Adding an EventListener to window to listen for keys being pressed
  window.addEventListener("keydown", keyDownHandler);
  window.addEventListener("keyup", keyUpHandler);

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

  // Activated when we press a key down
  function keyDownHandler(event: any) {
    if (!leftArrowPressed && !rightArrowPressed) {
      switch (event.keyCode) {
        case 37: // Left arrow key
          leftArrowPressed = true;
          $game.players[$game_info.my_player_number].paddle.moving = true;
          $game.players[$game_info.my_player_number].paddle.direction = false;
          sendUpdate("paddle_press_left");
          break;
        case 39: // Right arrow key
          rightArrowPressed = true;
          $game.players[$game_info.my_player_number].paddle.moving = true;
          $game.players[$game_info.my_player_number].paddle.direction = true;
          sendUpdate("paddle_press_right");
          break;
      }
    }
  }

  // Activated when we release the key
  function keyUpHandler(event: any) {
    switch (event.keyCode) {
      case 37: // Left arrow key
        leftArrowPressed = false;
        $game.players[$game_info.my_player_number].paddle.moving = false;
        sendUpdate("paddle_release_left");
        break;
      case 39: // Right arrow key
        rightArrowPressed = false;
        $game.players[$game_info.my_player_number].paddle.moving = false;
        sendUpdate("paddle_release_right");
        break;
    }
  }

  function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
</script>

<!-- <body onload="load()" onresize="getSize()"> -->
<body>
  <h1 id="header" style="background-color: #353839;">PolyPong</h1>
  <hr />
  {#await $auth0Client then client}
    {#await client.isAuthenticated() then isauthenticated}
      {#if isauthenticated}
        <div>hey you're authenticated</div>
      {/if}
    {/await}
  {/await}
  <a href="/">go to /</a>

  <canvas
    id="drawing"
    width="800"
    height="800"
    style="border:1px solid rgb(255,255,255)"
  />

  <br />

  <p>Draw a:</p>

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
  </div>
</body>

<!-- <body onload="load()" onresize="getSize()"> -->
<style>
  @font-face {
    font-family: SuperLegendBoy;
    src: url("SuperLegendBoy-4w8Y.ttf");
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
