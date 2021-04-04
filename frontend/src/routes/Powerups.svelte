<script>
    import type { PowerupStrings } from "@polypong/polypong-common";

    let powerUpsSelected: PowerupStrings[] = [];
    let skinSelected = "white";

    function highlightPowerUps(idOfElement: any) {
        var id = document.getElementById(idOfElement);
        if (
            id && id.style.backgroundColor ==
                document.getElementById("header")!.style.backgroundColor &&
            powerUpsSelected.length < 3
        ) {
            id.style.backgroundColor = "#FFFFFF";
            id.style.color = "#353839";
            powerUpsSelected.push(idOfElement);
        } else if (id){
            id!.style.backgroundColor = "#353839";
            id!.style.color = "#FFFFFF";

            for (const powerUp of powerUpsSelected) {
                if (powerUpsSelected[powerUp] == idOfElement) {
                    powerUpsSelected.splice(powerUp, 1);
                }
            }
        }
    }

    function highlightSkins(idOfSkin: string) {
        if (idOfSkin == skinSelected) {
            return true;
        } else if (idOfSkin == "white") {
            document.getElementById(skinSelected)!.style.backgroundColor =
                "#353839";
            document.getElementById(skinSelected)!.style.color = skinSelected;
            document.getElementById(idOfSkin)!.style.backgroundColor = idOfSkin;
            document.getElementById(idOfSkin)!.style.color = "#353839";
            skinSelected = idOfSkin;
        } else {
            document.getElementById(skinSelected)!.style.backgroundColor =
                "#353839";
            document.getElementById(skinSelected)!.style.color = skinSelected;
            document.getElementById(idOfSkin)!.style.backgroundColor = idOfSkin;
            document.getElementById(idOfSkin)!.style.color = "#FFFFFF";
            skinSelected = idOfSkin;
        }
    }
</script>

<body>
    <h1 id="header" style="background-color: #353839;">PolyPong</h1>

    <hr />
    <h2>Choose 3 Powerups</h2>
    <br />

    <div>
        <button class="button" style="background-color: #353839; width: 25%;" id="bigger"
            on:click={() => highlightPowerUps("bigger")}
        >
            <img src="/images/Bigger_Paddle.png" width="90" height="90" />
            <p>Bigger Paddle</p>
        </button>

        <button class="button" style="background-color: #353839; width: 25%;" id="smaller"
            on:click={() => highlightPowerUps("smaller")}
        >
            <img src="/images/Smaller_Paddle.png" width="90" height="90" />
            <p>Smaller Paddle</p>
        </button>

        <button class="button" style="background-color: #353839; width: 25%;" id="curved"
            on:click={() => highlightPowerUps("curved")}
        >
            <img src="/images/Curved_Paddle.png" width="90" height="90" />
            <p>Curved Paddle</p>
        </button>
    </div>

    <div>
        <button class="button" style="background-color: #353839; width: 25%;" id="invisible"
            on:click={() => highlightPowerUps("invisible")}
        >
            <img src="/images/Invisible_Paddle.png" width="90" height="90" />
            <p>Invisible Paddle<br /><br /></p>
        </button>

        <button class="button" style="background-color: #353839; width: 25%;" id="split"
            on:click={() => highlightPowerUps("split")}
        >
            <img src="/images/Split_Paddle.png" width="90" height="90" />
            <p>Split Paddle<br /><br /></p>
        </button>

        <button class="button" style="background-color: #353839; width: 25%;" id="distracting"
            on:click={() => highlightPowerUps("distracting")}
        >
            <img src="/images/Distracting_Background.png" width="90" height="90"/>
            <p>Distracting Background</p>
        </button>
    </div>

    <div>
        <button class="button" style="background-color: #353839; width: 25%;" id="anotherBall"
            on:click={() => highlightPowerUps("anotherBall")}
        >
            <img src="/images/Add_a_Ball_into_the_Mix.png" width="90" height="90"/>
            <p>Add a Ball into the Mix</p>
        </button>

        <button class="button" style="background-color: #353839; width: 25%;" id="changeShape"
            on:click={() => highlightPowerUps("changeShape")}
        >
            <img src="/images/Change_Ball_Shape_-_Star.png" width="90" height="90"/>
            <p>Change Ball Shape - Star</p>
        </button>

        <button class="button" style="background-color: #353839; width: 25%;" id="bomb"
            on:click={() => highlightPowerUps("bomb")}
        >
            <img src="/images/Bomb.png" width="90" height="90" />
            <p>Bomb<br /><br /></p>
        </button>
    </div>

    <div>
        <button class="button" style="background-color: #353839; width: 25%;" id="catchAndAim"
            on:click={() => highlightPowerUps("catchAndAim")}
        >
            <img src="/images/Catch_And Aim.png" width="90" height="90" />
            <p>Catch And Aim</p>
        </button>
    </div>

    <br />
    <hr />
    <br />
    <p>Change Skin:</p>
    <br />

    <div>
        <button
            class="button button4"
            id="white"
            style="vertical-align: middle;"
            on:click={() => highlightSkins("white")}>Default</button
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

    <a href="Gameplay.html">
        <button class="button button9" style="vertical-align: middle;"
            >Let's Play!</button
        >
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
        margin: 5px 5px;
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

    .button9:hover {
        color: #000000;
        background-color: #ffffff;
    }
</style>
