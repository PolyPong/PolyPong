<script `lang="typescript"`>
    import { isAuthenticated } from "../store";

    import { onMount, tick } from "svelte";


    class Lobby {
        gameLink: string;
        players: Player[];

        constructor(players: Player[], gameLink: string) {
            this.players = players;
            this.gameLink = gameLink;
        }
    }

    class Game { 
        numPlayers: number;
        ballVisible: boolean;
        numBalls: number;
        backgroundColor: number;
        activePowerups: Powerup[];
        players: Player[];

        constructor(
            numPlayers: number, 
            ballVisible: boolean, 
            numBalls: number, 
            backgroundColor: number,
            activePowerups: Powerup[], 
            players: Player[]) {
                this.numPlayers = numPlayers;
                this.ballVisible = ballVisible;
                this.numBalls = numBalls;
                this.backgroundColor = backgroundColor;
                this.activePowerups = activePowerups;
                this.players = players;
            }

        // update(messageFromServer){  // array of updated positions for each players, optional array of powers ups, what kind of powerups and initiated by who, optional event of this player died (or something)
        //     paddles[playerX].update(messageFromServer.powerup)
        // }
    }

    enum Shape {
        Regular = 0,
        CurvedInwards,
        CurvedOutwards,
        Bumpy
    }

    enum Color {
        White,
        Red,
        Green,
        Blue
    }

    class Paddle {
        x: number;
        y: number;
        length: number;
        angle: number;
        invisible: boolean;
        shape: Shape;
        paddleColor: number;

        constructor(
            x: number,
            y: number,
            length: number,
            angle: number,
            invisible: boolean,
            shape: Shape,
            paddleColor: Color) {
                this.x = x;
                this.y = y;
                this.length = length;
                this.angle = angle;
                this.invisible = invisible;
                this.shape = shape;
                this.paddleColor = paddleColor;
            }
    }

    class Player {
        username: string;
        email: string;
        paddle: Paddle;
        inventory: Powerup[];
        xp: number;

        constructor(
            username: string,
            email: string,
            paddle: Paddle,
            inventory: Powerup[],
            xp: number) {
                this.username = username;
                this.email = email;
                this.paddle = paddle;
                this.inventory = inventory;
                this.xp = xp;
        }

        // Does a player contain a paddle? Does skin/paddle color belong to player or to paddle?
        // Answer: Skin color currently belongs to the paddle
        // misc. stats (win/loss, games won, etc.)
    }

    interface Powerup {
        applyPowerup(): void;
    }

    class ExpandedPaddle implements Powerup {
        applyPowerup() {
            return;
        }
    }

    class ShrinkPaddle implements Powerup {
        applyPowerup() {
            return;
        }
    }

    class MakeSelfInvisible implements Powerup {
        applyPowerup() {
            return;
        }
    }

    class MakeOthersInvisible implements Powerup {
        applyPowerup() {
            return;
        }
    }

    class MakeBallInvisible implements Powerup {
        applyPowerup() {
            return;
        }
    }

    class MakePaddleCurveOutwards implements Powerup {
        applyPowerup() {
            return;
        }
    }

    class MakePaddleCurveInwards implements Powerup {
        applyPowerup() {
            return;
        }
    }

    class MakePaddleBumpy implements Powerup {
        applyPowerup() {
            return;
        }
    }

    class SetBackgroundColor implements Powerup {
        applyPowerup() {
            return;
        }
    }

    class SplitPaddle implements Powerup {
        applyPowerup() {
            return;
        }
    }

    class AddBall implements Powerup {
        applyPowerup() {
            return;
        }
    }

    class CatchAndAim implements Powerup {
        applyPowerup() {
            return;
        }
    }

    class Bomb implements Powerup {
        applyPowerup() {
            return;
        }
    }

    class TraceBallPath implements Powerup {
        applyPowerup() {
            return;
        }
    }


    onMount(async () => {
        load();
        await tick();
        getSize();
        render();
    });

    var canvas: HTMLCanvasElement;
    var ctx: CanvasRenderingContext2D;
    var w: number = 0;
    var h: number = 0;
    var radius: number = 400;
    var currentShape: number = 0;

    function load() {
        w = document.documentElement.clientWidth;
        h = document.documentElement.clientHeight;
        canvas = document.getElementById("drawing");
        canvas.width = w - 100;
        canvas.height = h - 150;
        ctx = canvas.getContext("2d")!;
    }

    function getSize() {
        let temp = ctx.getImageData(0, 0, w, h);
        w = document.documentElement.clientWidth;
        h = document.documentElement.clientHeight;
        canvas = document.getElementById("drawing");
        canvas.width = w - 100;
        canvas.height = h - 150;
    }

    function render() {
        if (currentShape == 0){

        } else {
            drawPolygon((h - 200) / 2, (w - 150) / 2, currentShape, 255, 255, 255);
            // drawPolygon((h-250)/2, (w-200)/2, currentShape, 255, 255, 255);
        }
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
            ? (radius = shapeWidth)
            : (radius = shapeHeight);

        // Set the currentShape equal to the sides of the shape we are drawing
        currentShape = sides;
        // Clear the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        //
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((rotationAngle(sides) * Math.PI) / 180); // Rotate the canvas so that the bottom side of every shape is flat
        let a = (2 * Math.PI) / sides;
        ctx.beginPath(); // Begin the path
        ctx.moveTo(radius, 0); // Move the "pencil" to the (radius, 0) on the unit circle
        for (let i = 1; i < sides; i++) {
            // Draw a line to each of the points on the circle
            ctx.lineTo(radius * Math.cos(a * i), radius * Math.sin(a * i));
        }
        ctx.closePath();
        ctx.lineWidth = 1;
        ctx.strokeStyle = "rgba(" + red + ", " + green + ", " + blue + ", 1.0)";
        ctx.fillStyle = "rgba(0,0,0,0)"; // alpha
        ctx.fill();
        ctx.stroke();
        ctx.translate((-1 * canvas.width) / 2, (-1 * canvas.height) / 2);
        //ctx.rotate(-1*180/sides * (Math.PI / 180));
        ctx.setTransform(1, 0, 0, 1, 0, 0);
    }

    // 3 Sides = 120 degrees = 30 degrees
    // 4 Sides = 90 degrees = 45 degrees
    // 5 Sides = 72 degrees = 54 degrees
    // 6 Sides = 60 degrees = 60 degrees/0 degrees
    // 7 Sides = 51.428571429 degrees = 51.428571429/4 degrees
    // 8 Sides = 45 degrees = 22.5 degrees
    // 9 Sides = 40 degrees = 30 degrees
    // 10 Sides = 36 degrees = 0 degrees
    // 11 Sides = 32.727272727 degrees = 32.727272727/4 degrees
    // 12 Sides = 30 degrees = 15 degrees

    function rotationAngle(sides: number) {
        return (360 / sides) * (((sides + 2) % 4) / 4);
        // for(let i = 3; i <= 12; i++){
        //   console.log("Number of Sides: " + i + " Rotation Angle: " + (360/i)*((i+2)%4 / 4));
        //   //console.log("Rotation Angle: "(360/i)*((sides+2)%4 / 4));
        // }
    }

    function drawTriangle() {
        console.log("Yo!" + (h - 200));

        drawPolygon((h - 200) / 2, (w - 150) / 2, 3, 255, 255, 255);
    }

    function drawSquare() {
        console.log("Yo! " + h);
        drawPolygon((h - 200) / 2, (w - 150) / 2, 4, 255, 255, 255);
    }

    function drawPentagon() {
        console.log("Yo!");
        drawPolygon((h - 200) / 2, (w - 150) / 2, 5, 255, 255, 255);
    }

    function drawHexagon() {
        console.log("Yo!");
        drawPolygon((h - 200) / 2, (w - 150) / 2, 6, 255, 255, 255);
    }

    function drawSeptagon() {
        console.log("Yo!");
        drawPolygon((h - 200) / 2, (w - 150) / 2, 7, 255, 255, 255);
    }

    function drawOctagon() {
        console.log("Yo!");
        drawPolygon((h - 200) / 2, (w - 150) / 2, 8, 255, 255, 255);
    }

    function drawNonagon() {
        console.log("Yo!");
        drawPolygon((h - 200) / 2, (w - 150) / 2, 9, 255, 255, 255);
    }

    function drawDecagon() {
        console.log("Yo!");
        drawPolygon((h - 200) / 2, (w - 150) / 2, 10, 255, 255, 255);
    }

    function drawHendecagon() {
        console.log("Yo!");
        drawPolygon((h - 200) / 2, (w - 150) / 2, 11, 255, 255, 255);
    }

    function drawDodecagon() {
        console.log("Yo!");
        drawPolygon((h - 200) / 2, (w - 150) / 2, 12, 255, 255, 255);
    }


    // function gameLoop(){
    //     // update() function here
    //     update();
    //     // render() function here
    //     render();
    // }

    function paddles() {
        //   var canvas = document.getElementById("canvas");
        // var ctx = canvas.getContext("2d");
        //
        // var radius = 250;
        //
        //
        // /* radius*Math.cos(a*i), radius*Math.sin(a*i) */
        //
        // /* Math.PI/8 */
        //
        // ctx.translate(canvas.width/2, canvas.height/2)
        // ctx.rotate(45 * Math.PI / 180);
        //
        // ctx.beginPath();
        // ctx.strokeStyle="green";
        // ctx.moveTo(125, 501)
        // ctx.lineTo(250, 501)
        // ctx.stroke();
        //
        // ctx.beginPath();
        // ctx.strokeStyle="green";
        // ctx.moveTo(radius*Math.cos(Math.PI/8), radius*Math.sin(Math.PI/8))
        // ctx.lineTo(radius*Math.cos(3*Math.PI/8), radius*Math.sin(3*Math.PI/8))
        // ctx.stroke();
        //
        // ctx.beginPath();
        // ctx.strokeStyle="green";
        // ctx.moveTo(radius*Math.cos(5*Math.PI/8), radius*Math.sin(5*Math.PI/8))
        // ctx.lineTo(radius*Math.cos(7*Math.PI/8), radius*Math.sin(7*Math.PI/8))
        // ctx.stroke();
        //
        // ctx.beginPath();
        // ctx.strokeStyle="green";
        // ctx.moveTo(radius*Math.cos(9*Math.PI/8), radius*Math.sin(9*Math.PI/8))
        // ctx.lineTo(radius*Math.cos(11*Math.PI/8), radius*Math.sin(11*Math.PI/8))
        // ctx.stroke();
        //
        // ctx.beginPath();
        // ctx.strokeStyle="green";
        // ctx.moveTo(radius*Math.cos(13*Math.PI/8), radius*Math.sin(13*Math.PI/8))
        // ctx.lineTo(radius*Math.cos(15*Math.PI/8), radius*Math.sin(15*Math.PI/8))
        // ctx.stroke();
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
