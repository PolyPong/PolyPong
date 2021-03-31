<script lang="ts">
    import { onDestroy, onMount, afterUpdate } from "svelte";
    import { v4 } from "uuid";
    import type { JoinGamePayload, StartGameRequest } from "@polypong/polypong-common";
    import type { ServerEvent, ClientAction } from "@polypong/polypong-common";
    import {lobby_id, user_id, ws, joinGame} from "../store";
  

    let lobby_input: string;
    user_id.set(v4());
    afterUpdate(() => console.log($lobby_id))

   

    onMount(async () => {
        
        // setInterval(() => {
        //     if (!ws) {
        //         console.log("ws not ready yet");
        //         return;
        //     }
        //     if (ws.readyState === WebSocket.CLOSED) {
        //         console.log("ws is closed");
        //         return;
        //     }
        //     ws.send(`hello from ${user_id}`);

        //     console.log("sent message");
        // }, 5000);
    });

    const joinGameButton = (input: string | undefined) => {
        if (!$ws) {
            return;
        }
        joinGame(input, $user_id);        
    };

    const startGame = () => {
        console.log("We are sending a start_game request on the client")
        const payload: StartGameRequest = {
            type: "start_game",
            lobby_id: $lobby_id,
        }
        $ws.send(JSON.stringify(payload));
    };
</script>

<body>
    {#if !!$lobby_id}
        <div>here's the lobby id: {$lobby_id}</div>
        <button on:click={startGame}>Start Game</button>
    {:else}
        <button
            on:click={async () => {
                const payload = {
                    type: "create_lobby",
                };
                $ws.send(JSON.stringify(payload));
                console.log("attempting to create lobby");
            }}
        >
            Create Lobby
        </button>

        <input type="text" bind:value={lobby_input} />
        <button
            on:click={() => {
                joinGameButton(lobby_input);
            }}
        >
            join game
        </button>
    {/if}
    <h1>PolyPong</h1>
    <hr />
    <h2>Lobby</h2>

    <ol>
        <div style="float: left; width: 40%;">
            <li class="alignleft" id="playerOne">Arun</li>
            <li class="alignright" style="list-style-type: none">8888</li>
            <br />
            <li class="alignleft" value="2" id="playerTwo">Josh</li>
            <li class="alignright" style="list-style-type: none">7777</li>
            <br />
            <li class="alignleft" value="3" id="playerThree">Micheal</li>
            <li class="alignright" style="list-style-type: none">1234</li>
            <br />
            <li class="alignleft" value="4" id="playerFour">asdf</li>
            <li class="alignright" style="list-style-type: none">1000</li>
            <br />
            <li class="alignleft" value="5" id="playerFive">qwer</li>
            <li class="alignright" style="list-style-type: none">1200</li>
            <br />
            <li class="alignleft" value="6" id="playerSix">ABCD</li>
            <li class="alignright" style="list-style-type: none">1233</li>
            <br />
        </div>
        <div style="float: right; width: 40%;">
            <li class="alignleft" value="7" id="playerSeven">zazz</li>
            <li class="alignright" style="list-style-type: none">999</li>
            <br />
            <li class="alignleft" value="8" id="playerEight">emdw</li>
            <li class="alignright" style="list-style-type: none">787</li>
            <br />
            <li class="alignleft" value="9" id="playerNine">bmus</li>
            <li class="alignright" style="list-style-type: none">757</li>
            <br />
            <li class="alignleft" value="10" id="playerTen">Waiting...</li>
            <li class="alignright" style="list-style-type: none" />
            <br />
            <li class="alignleft" value="11" id="playerEleven" />
            <li class="alignright" style="list-style-type: none" />
            <br />
            <li class="alignleft" value="12" id="playerTwelve" />
            <li class="alignright" style="list-style-type: none" />
            <br />
        </div>
    </ol>

    <br />
    <br />
    <br />
    <br />
    <br />
    <br />
    <br />

    <hr />

    <br />

    <p>Link to Join: <u>https://polypong.ca/717263</u></p>

    <br />

    <div>
        <button class="button button4" style="vertical-align: middle;"
            >Copy Link to Invite Friends</button
        >
        <a href="/login">
            <!-- This assumes the user is logged in -->
            <button class="button button4" style="vertical-align: middle;"
                >Leave Game</button
            >
        </a>
    </div>
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

    ol {
        margin: 22px;
        font-size: 22px;
        text-align: left;
    }

    .button {
        font-family: SuperLegendBoy;
        border: 2px solid #ffffff;
        height: 100px;
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

    .button:hover {
        background-color: #ffffff; /* White */
        color: #353839;
    }

    .button4 {
        width: 20%;
        margin-left: auto;
        margin-right: auto;
    }

    .alignleft {
        float: left;
    }
    .alignright {
        float: right;
    }
</style>
