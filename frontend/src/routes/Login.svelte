<body>
    <h1>PolyPong</h1>
    <hr />
    <div>
        <div>
            <a href="/lobby">
                <button class="button button2">Create Room</button>
            </a>
            <a href="/lobby">
                <button class="button button3">Join Random Game</button>
            </a>
        </div>
        <div>
            <a href="/stats">
                <button class="button button2">My Stats and Leaderboard</button>
            </a>
            <a href="/stats">
                <button class="button button3">Settings</button>
            </a>
        </div>
    </div>

    <hr />
</body>

<style>
    @font-face {
        font-family: SuperLegendBoy;
        src: url("/fonts/SuperLegendBoy-4w8Y.ttf");
    }

    h1 {
        font-family: SuperLegendBoy;
        text-align: center;
        color: white;
        background-color: #353839;
    }

    body {
        font-family: SuperLegendBoy;
        background-color: #353839;
    }

    .button {
        font-family: SuperLegendBoy;
        border: 2px solid #ffffff;
        height: 200px;
        color: white;
        padding: 15px 15px;
        text-align: center;
        text-decoration: none;
        display: inline-block;
        font-size: 22px;
        margin: 10px 0px;
        cursor: pointer;
        background-color: #353839;
    }

    .button2 {
        width: 49%;
    }

    .button3 {
        width: 49%;
        float: right;
    }

    .button:hover {
        background-color: #ffffff; /* Green */
        color: #353839;
    }
</style>
