<body>
    <h1>PolyPong</h1>

    <hr />

    <div>
        <a href="/lobby">
            <button class="button button1">Play As Guest</button>
        </a>
    </div>
    <div>
        <a href="/signup">
            <button class="button button2">Sign Up</button>
        </a>
        <a href="/login">
            <button class="button button3">Log In</button>
        </a>
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

    .button1 {
        width: 100%;
    }

    .button2 {
        width: 49%;
    }

    .button3 {
        width: 49%;
        float: right;
    }

    .button:hover {
        background-color: #ffffff; /* White */
        color: #353839;
    }
</style>
