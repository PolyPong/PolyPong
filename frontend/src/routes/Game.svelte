<script lang="typescript">
    import {
        isAuthenticated,
        game_info,
        ws,
        user_id,
        lobby_id,
        game,
    } from "../store";
    import { onMount, tick } from "svelte";
    import { Paddle } from "@polypong/polypong-common";
    import type {
        ClientUpdate,
        KeyDownEvent,
        KeyUpEvent,
    } from "@polypong/polypong-common";
    import { GameClient } from "../Game";
    let w: number;
    let h: number;
    let canvas: HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D;
    let leftArrowPressed = false;
    let rightArrowPressed = false;

    const paddleCoverageRatio: number = 1 / 4;
    const ballScaleFactor: number = 1 / 30;
    // const frameRate = 1000/60;  // 60 FPS
    const frameRate = 1000 / 20;

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
        startGame($game_info.sides, $game_info.my_player_number);
        console.log($game_info);
    });

    function load() {
        w = document.documentElement.clientWidth;
        h = document.documentElement.clientHeight;
        canvas = document.getElementById("drawing") as HTMLCanvasElement;

        canvas.width = w - 100;
        canvas.height = h - 150;
        ctx = canvas.getContext("2d")! as CanvasRenderingContext2D;
    }

    function startGame(sides: number, player_number: number) {
        // Create new games with 'sides' number of players
        $game = new GameClient(sides);
        // Starts the game loop
        setInterval(gameLoop, frameRate);
    }

    function gameLoop() {
        adjustSize(); // For when users change the size of their window, the game board and the paddles change size
        update(); // For updating the state of the game
        render(); // For rendering the updated state of the game (ie. clears the screen and draws the new state onto the canvas)
    }

    // Draw the current game board or polygon according to the size of the client's window
    // Also adjust the size of paddles based on the length of each side
    // (currently, each paddle is one quarter of the side length)
    function adjustSize() {
        w = document.documentElement.clientWidth;
        h = document.documentElement.clientHeight;
        canvas.width = w - 100;
        canvas.height = h - 150;

        drawPolygon((h - 200) / 2, (w - 150) / 2, $game.sides, 255, 255, 255);

        // Get the length of each side
        $game.sideLength = 2 * $game.radius * Math.sin(Math.PI / $game.sides);

        // Set the width of each paddle to be a quarter of the side length
        for (var i = 0; i < $game.players.length; i++) {
            $game.players[i].paddle.width =
                $game.sideLength * paddleCoverageRatio;
            // TODO: Need to handle if expanded paddle/shrunk paddle is applied here
        }

        // TODO adjust the ball size based on $game.radius
        $game.ball.radius = $game.radius * ballScaleFactor;
    }

    // Update the state of the game, using what the server sends us
    function update() {
        // Handles paddle movement side-to-side using the left and right arrow keys,
        // only lets the paddle move along the length of its respective side (bounded by the side length)
        if (
            leftArrowPressed &&
            $game.players[$game_info.my_player_number].paddle.x -
                $game.players[$game_info.my_player_number].paddle.width >
                -$game.sideLength / 2
        ) {
            $game.players[$game_info.my_player_number].paddle.x -=
                Paddle.velocity;
        } else if (
            rightArrowPressed &&
            $game.players[$game_info.my_player_number].paddle.x <
                $game.sideLength / 2
        ) {
            $game.players[$game_info.my_player_number].paddle.x +=
                Paddle.velocity;
        }
        moveBall();

        if (collisionDetect()) {
            handleCollision();
        }
    }

    // Re-render the game according to the new state
    function render() {
        //Move the origin to the exact center of the canvas
        ctx.translate(canvas.width / 2, canvas.height / 2);

        // Rotate so that the player which has '$game_info.my_player_number' number is at the bottom
        // Need to rotate BEFORE paddles are drawn to the screen, need to rotate around center of canvas
        ctx.rotate((-2 * Math.PI * $game_info.my_player_number) / $game.sides);
        drawPaddles();
        // Undo the spell we cast
        ctx.rotate((2 * Math.PI * $game_info.my_player_number) / $game.sides);

        // Later on, when the ball information is coming in from the server, we will want to include
        // drawBall() in between the two rotations. For now, the ball information is not rotated because
        // right now the ball information is from player 0's perspective, not from player playerNumber's perspective

        // TLDR: drawBall() stays outside the rotations until we are synchronizing ball information across clients

        drawBall();
    }

    function drawPolygon(
        shapeHeight: number,
        shapeWidth: number,
        sides: number,
        red: string | number,
        green: string | number,
        blue: string | number
    ) {
        // Determine whether height or width is the limiting factor on the screen right now
        shapeHeight > shapeWidth
            ? ($game.radius = shapeWidth)
            : ($game.radius = shapeHeight);

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
        // for(let i = 3; i <= 12; i++){
        //   console.log("Number of Sides: " + i + " Rotation Angle: " + (360/i)*((i+2)%4 / 4));
        //   //console.log("Rotation Angle: "(360/i)*((sides+2)%4 / 4));
        // }
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
            if ($game.radius < 200) {
                return 200 - 450 / $game.sides - 10;
            } else {
                return $game.radius - 450 / $game.sides - 10;
            }
        } else {
            return $game.radius - 450 / $game.sides + $game.sides;
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

    // collision Detect function
    function collisionDetect() {
        // returns true or false
        console.log("Player number: " + $game_info.my_player_number);
        var top = getPaddleY() - Paddle.height / 2;
        var right = $game.players[$game_info.my_player_number].paddle.x;
        var bottom = getPaddleY() + Paddle.height / 2;
        var left =
            $game.players[$game_info.my_player_number].paddle.x -
            $game.players[$game_info.my_player_number].paddle.width;

        var topOfBall = $game.ball.y - $game.ball.radius;
        var rightOfBall = $game.ball.x + $game.ball.radius;
        var bottomOfBall = $game.ball.y + $game.ball.radius;
        var leftOfBall = $game.ball.x - $game.ball.radius;

        return (
            leftOfBall < right &&
            topOfBall < bottom &&
            rightOfBall > left &&
            bottomOfBall > top
        );
    }

    function handleCollision() {
        var angle = 0;
        // If the ball hits the left quarter of the paddle, make the ball go left
        if (
            $game.ball.x <
            $game.players[$game_info.my_player_number].paddle.x -
                (3 * $game.players[$game_info.my_player_number].paddle.width) /
                    4
        ) {
            angle = (-1 * Math.PI) / 4; // -45 degrees
        }
        // Else If the ball hits the right quarter of the paddle, make the ball go right
        else if (
            $game.ball.x >
            $game.players[$game_info.my_player_number].paddle.x -
                $game.players[$game_info.my_player_number].paddle.width / 4
        ) {
            angle = Math.PI / 4; // 45 degrees
        }
        // Else Angle = 0

        // Update X and Y velocity of the ball
        $game.ball.dy = -1 * $game.ball.velocity * Math.cos(angle); // -1 to reverse the direction of the ball
        $game.ball.dx = $game.ball.velocity * Math.sin(angle);

        // Increase ball's velocity (optional)
        $game.ball.velocity += 0.2;
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

    const sendUpdate = () => {
        const payload: ClientUpdate = {
            type: "client_update",
            player_id: $user_id,
            lobby_id: $lobby_id,
            player_number: $game_info.my_player_number,
            event: $game,
        };
        $ws.send(JSON.stringify(payload));
    };

    // Activated when we press a key down
    function keyDownHandler(event: any) {
        switch (event.keyCode) {
            case 37: // Left arrow key
                leftArrowPressed = true;
                sendUpdate();
                break;
            case 39: // Right arrow key
                rightArrowPressed = true;
                sendUpdate();
                break;
        }
    }

    // Activated when we release the key
    function keyUpHandler(event) {
        switch (event.keyCode) {
            case 37: // Left arrow key
                leftArrowPressed = false;
                sendUpdate();
                break;
            case 39: // Right arrow key
                rightArrowPressed = false;
                sendUpdate();
                break;
        }
    }
</script>

<!-- <body onload="load()" onresize="getSize()"> -->
<body>
    <h1 id="header" style="background-color: #353839;">PolyPong</h1>
    <hr />
    {#if $isAuthenticated}
        <div>hey you're authenticated</div>
    {/if}
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
