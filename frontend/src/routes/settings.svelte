<script>
    let skinSelected = "white";

    function highlightSkins(idOfSkin) {
        if (idOfSkin == skinSelected) {
            return true;
        } else if (idOfSkin == "white") {
            document.getElementById(skinSelected).style.backgroundColor =
                "#353839";
            document.getElementById(skinSelected).style.color = skinSelected;
            document.getElementById(idOfSkin).style.backgroundColor = idOfSkin;
            document.getElementById(idOfSkin).style.color = "#353839";
            skinSelected = idOfSkin;
        } else {
            document.getElementById(skinSelected).style.backgroundColor =
                "#353839";
            document.getElementById(skinSelected).style.color = skinSelected;
            document.getElementById(idOfSkin).style.backgroundColor = idOfSkin;
            document.getElementById(idOfSkin).style.color = "#FFFFFF";
            skinSelected = idOfSkin;
        }
    }
</script>

<body>
    <h1 id="header" style="background-color: #353839;">PolyPong</h1>
    <hr />
    <br />
    <p>Selected Skin:</p>

    <div>
        <button
            class="button button4"
            id="white"
            style="vertical-align: middle;"
            on:click={highlightSkins("white")}>Default</button
        >
        <button
            class="button button5"
            id="red"
            style="vertical-align: middle;"
            on:click={() => highlightSkins("red")}>Red</button
        >
        <button
            class="button button6"
            id="blue"
            style="vertical-align: middle;"
            on:click={() => highlightSkins("blue")}>Blue</button
        >
        <button
            class="button button7"
            id="orange"
            style="vertical-align: middle;"
            on:click={() => highlightSkins("orange")}>Orange</button
        >
    </div>

    <br />
    <hr />
    <br />

    <p>Change Email:</p>

    <label for="email">Current Email:</label>
    <input type="text" class="input" id="email" name="email" /><br /><br />

    <a href="/login">
        <!-- This assumes the user is logged in -->
        <button class="button button8">Home</button>
    </a>
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

    .button4 {
        color: #353839;
        background-color: white;
        border: 2px solid white;
    }
    .button4:hover {
        background-color: white;
        color: #353839;
    }

    .button5 {
        color: red;
        border: 2px solid red;
    }
    .button5:hover {
        background-color: red;
        color: white;
    }

    .button6 {
        color: blue;
        border: 2px solid blue;
    }
    .button6:hover {
        background-color: blue;
        color: white;
    }

    .button7 {
        color: orange;
        border: 2px solid orange;
    }
    .button7:hover {
        background-color: orange;
        color: white;
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
