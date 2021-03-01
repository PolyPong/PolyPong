<script lang="typescript">
    import { isAuthenticated } from "../store";
    import { onMount, tick } from "svelte";
    import * as Game from "../Game"

    var w: number;
    var h: number;
    var canvas: HTMLCanvasElement;
    var ctx: CanvasRenderingContext2D;
    var game: Game.Game;
    var leftArrowPressed = false;
    var rightArrowPressed = false;
    // var game = new Game.Game(400, 4, true, 1, 0, [], [])
    // var player1Paddle = new Game.Paddle(getPlayerInitialX(4, 1), getPlayerInitialY(4, 1), 100, 0, false, Game.Shape.Regular, Game.Color.Red);
    // var player1 = new Game.Player("GG", "GG", player1Paddle, [], 0)
    // var player2Paddle = new Game.Paddle(getPlayerInitialX(4, 2), getPlayerInitialY(4, 2), 100, 0, false, Game.Shape.Regular, Game.Color.Red);
    // var player2 = new Game.Player("GG", "GG", player1Paddle, [], 0)
    // game.players = [player1, player2]

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
        // await tick();
    })

    function load() {
        w = document.documentElement.clientWidth;
        h = document.documentElement.clientHeight;
        canvas = document.getElementById("drawing") as HTMLCanvasElement;

        canvas.width = w - 100;
        canvas.height = h - 150;
        ctx = canvas.getContext("2d")! as CanvasRenderingContext2D;
    }

    function startGame(sides: number) {
        // Create new games with 'sides' number of players
        game = new Game.Game(sides);


        // Set the width of paddles accordingly
        console.log("radius:" + game.radius);
        // Game.Paddle.width = 450/sides - game.radius;
        Game.Paddle.width = game.radius/game.sides;
        // 450/sides or game.radius/3;

        setInterval(gameLoop, 1000/60)
    }

    function gameLoop() {
        adjustSize();
        update();
        render();
    }

    // Draw the current game board or polygon according to the size of the client's window
    function adjustSize() {
        w = document.documentElement.clientWidth;
        h = document.documentElement.clientHeight;
        canvas.width = w - 100;
        canvas.height = h - 150;
        drawPolygon((h - 200) / 2, (w - 150) / 2, game.sides, 255, 255, 255);
    }

    // Update the state of the game, using what the server sends us
    function update() {
        if (leftArrowPressed){ //&& user.y > 0) {
            game.players[0].paddle.x -= Game.Paddle.velocity;
        } else if (rightArrowPressed) { // downArrowPressed && (user.y < canvas.height - user.height)) {
            game.players[0].paddle.x += Game.Paddle.velocity;
        }
    }

    // Re-render the game according to the new state
    function render() {
        drawPaddles();
    }

    function drawPolygon(shapeHeight: number, shapeWidth: number, sides: number, red: string | number, green: string | number, blue: string | number) {
        
        // Determine whether height or width is the limiting factor on the screen right now
        shapeHeight > shapeWidth
            ? (game.radius = shapeWidth)
            : (game.radius = shapeHeight);

        
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
        ctx.moveTo(game.radius, 0); // Move the "pencil" to the (radius, 0) on the unit circle
        for (let i = 1; i < sides; i++) {
            // Draw a line to each of the points on the circle
            ctx.lineTo(game.radius * Math.cos(a * i), game.radius * Math.sin(a * i));
        }
        ctx.closePath();

        ctx.strokeStyle = "rgba(" + red + ", " + green + ", " + blue + ", 1.0)";
        ctx.stroke();
        // ctx.fillStyle = "rgba(0,0,0,0)"; // alpha
        // ctx.fill();

        ctx.translate((-1 * canvas.width) / 2, (-1 * canvas.height) / 2);
        //ctx.rotate(-1*180/sides * (Math.PI / 180));
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
        //Move the origin to the exact center of the canvas
        ctx.translate(canvas.width / 2, canvas.height / 2);

        ctx.beginPath()
        ctx.lineWidth = Game.Paddle.height;

        for (var i = 0; i < game.sides; i++){
            // In place of 0, we need game.players[i].paddle.x
            ctx.moveTo(game.players[i].paddle.x, getPaddleY());
            ctx.lineTo(game.players[i].paddle.x-Game.Paddle.width, getPaddleY());
            ctx.stroke();
            ctx.rotate(2 * Math.PI / game.sides);
        }

        ctx.lineWidth = 1;
        ctx.closePath();
    }

    function getPaddleY(){
        console.log("Radius: " + game.radius)
        if (game.sides == 3) {
            if (game.radius < 200) {
                return 200 - 450/game.sides - 10;
            } else {
                return game.radius - 450/game.sides - 10;
            }
        } else {
            return game.radius - 450/game.sides + game.sides;
        }
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

    /* moving Paddles */
    // add an eventListener to browser window
    window.addEventListener('keydown', keyDownHandler);
    window.addEventListener('keyup', keyUpHandler);

    // gets activated when we press down a key
    function keyDownHandler(event) {
        // get the keyCode
        switch (event.keyCode) {
            // "left arrow" key
            case 37:
            // set upArrowPressed = true
            leftArrowPressed = true;
            break;
            // "down arrow" key
            case 39:
            rightArrowPressed = true;
            break;
        }
    }

    // gets activated when we release the key
    function keyUpHandler(event) {
        // get the keyCode
        switch (event.keyCode) {
            // "left arraow" key
            case 37:
            leftArrowPressed = false;
            break;
            // "right arrow" key
            case 39:
            rightArrowPressed = false;
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
