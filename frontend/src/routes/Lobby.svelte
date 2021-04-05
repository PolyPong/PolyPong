<script lang="ts">
  import { onDestroy, onMount, afterUpdate } from "svelte";
  import { v4 } from "uuid";
  import {
    AddBall,
    Bomb,
    CatchAndAim,
    // ChangeBallShape,
    ExpandedPaddle,
    MakePaddleCurveInwards,
    MakeSelfInvisible,
    SetBackgroundColor,
    ShrinkPaddle,
    SplitPaddle,
  } from "@polypong/polypong-common";
  import type { PowerupStrings } from "@polypong/polypong-common";
  import type {
    JoinGamePayload,
    StartGameRequest,
    LobbyClientReady,
  } from "@polypong/polypong-common";
  import type { ServerEvent, ClientAction } from "@polypong/polypong-common";
  import {
    lobby_id,
    user_id,
    ws,
    joinGame,
    power_ups_str,
    power_up_one_used,
    power_up_two_used,
    power_up_three_used,
  } from "../store";

  const SERVER_URL =
    import.meta.env.MODE === "production"
      ? "https://polypong.ca/#/"
      : "http://localhost:3000/#/";

  export let id: string;
  let lobby_input: string;
  let powerUpsStr: any[] = [];
  let client_ready: boolean = false;

  let expandedPaddleButton: HTMLElement;
  let copyLink: HTMLTextAreaElement;

  user_id.set(v4());
  afterUpdate(() => console.log($lobby_id));

  onMount(async () => {
    if (id) {
      setTimeout(() => {
        joinGame(id, $user_id);
        lobby_input = id;
        console.log("hm", id);
      }, 1000);
    }
  });

  const joinGameButton = (input: string | undefined) => {
    if (!$ws) {
      return;
    }
    joinGame(input, $user_id);
  };

  const startGame = () => {
    console.log("We are sending a start_game request on the client");
    const payload: StartGameRequest = {
      type: "start_game",
      lobby_id: $lobby_id,
    };
    $ws.send(JSON.stringify(payload));
  };

  function highlightPowerUps(idOfElement: any) {
    // expandedPaddleButton.style =
    var id = document.getElementById(idOfElement);
    if (
      id &&
      id.style.backgroundColor ===
        document.getElementById("header")!.style.backgroundColor &&
      powerUpsStr.length < 3
    ) {
      id.style.backgroundColor = "#FFFFFF";
      id.style.color = "#353839";
      powerUpsStr.push(idOfElement);
    } else if (id) {
      id!.style.backgroundColor = "#353839";
      id!.style.color = "#FFFFFF";

      for (const powerUp of powerUpsStr) {
        if (powerUp === idOfElement) {
          console.log(powerUp);
          powerUpsStr.splice(powerUpsStr.indexOf(powerUp), 1);
        }
      }
    }
  }

  function clientReady() {
    console.log("We are sending a lobby_client_ready request on the client");

    power_ups_str.set(powerUpsStr);
    if (powerUpsStr.length > 0) {
      power_up_one_used.set(false);
    }
    if (powerUpsStr.length > 1) {
      power_up_two_used.set(false);
    }
    if (powerUpsStr.length > 2) {
      power_up_three_used.set(false);
    }

    const payload: LobbyClientReady = {
      type: "lobby_client_ready",
      lobby_id: $lobby_id,
      user_id: $user_id,
    };
    $ws.send(JSON.stringify(payload));

    client_ready = true;
    console.log(powerUpsStr);
  }
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
  <h1 id="header" style="background-color: #353839;">PolyPong</h1>
  <hr />
  <h2>Lobby</h2>

  <hr />

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

  <div>
    <p>Link to join:</p>
    <textarea readonly bind:this={copyLink}>
      {SERVER_URL + "lobby/" + $lobby_id}
    </textarea>
    <button
      on:click={() => {
        copyLink.select();
        document.execCommand("copy");
      }}
    >
      Copy to clipboard
    </button>
  </div>

  <button class="button button4" style="vertical-align: middle;">
    Copy Link to Invite Friends
  </button>

  {#if !client_ready}
    <hr />
    <h2>Choose 3 Powerups:</h2>
    <br />

    <div>
      <button
        class="powerUpButton"
        style="background-color: #353839; width: 25%;"
        id="bigger"
        bind:this={expandedPaddleButton}
        on:click={() => highlightPowerUps("bigger")}
      >
        <img src="/images/Bigger_Paddle.png" width="90" height="90" />
        <p>Bigger Paddle</p>
      </button>

      <button
        class="powerUpButton"
        style="background-color: #353839; width: 25%;"
        id="smaller"
        on:click={() => highlightPowerUps("smaller")}
      >
        <img src="/images/Smaller_Paddle.png" width="90" height="90" />
        <p>Smaller Paddle</p>
      </button>

      <button
        class="powerUpButton"
        style="background-color: #353839; width: 25%;"
        id="curved"
        on:click={() => highlightPowerUps("curved")}
      >
        <img src="/images/Curved_Paddle.png" width="90" height="90" />
        <p>Curved Paddle</p>
      </button>
    </div>

    <div>
      <button
        class="powerUpButton"
        style="background-color: #353839; width: 25%;"
        id="selfInvisible"
        on:click={() => highlightPowerUps("selfInvisible")}
      >
        <img src="/images/Invisible_Paddle.png" width="90" height="90" />
        <p>Invisible Paddle, Self<br /><br /></p>
      </button>

      <button
        class="powerUpButton"
        style="background-color: #353839; width: 25%;"
        id="othersInvisible"
        on:click={() => highlightPowerUps("othersInvisible")}
      >
        <img src="/images/Invisible_Paddle.png" width="90" height="90" />
        <p>Invisible Paddle, Others<br /><br /></p>
      </button>

      <button
        class="powerUpButton"
        style="background-color: #353839; width: 25%;"
        id="ballInvisible"
        on:click={() => highlightPowerUps("ballInvisible")}
      >
        <img src="/images/Invisible_Paddle.png" width="90" height="90" />
        <p>Invisible Ball<br /><br /></p>
      </button>
    </div>

    <div>
      <button
        class="powerUpButton"
        style="background-color: #353839; width: 25%;"
        id="anotherBall"
        on:click={() => highlightPowerUps("anotherBall")}
      >
        <img src="/images/Add_a_Ball_into_the_Mix.png" width="90" height="90" />
        <p>Add a Ball into the Mix</p>
      </button>

      <button
        class="powerUpButton"
        style="background-color: #353839; width: 25%;"
        id="changeShape"
        on:click={() => highlightPowerUps("changeShape")}
      >
        <img
          src="/images/Change_Ball_Shape_-_Star.png"
          width="90"
          height="90"
        />
        <p>Change Ball Shape - Star</p>
      </button>

      <button
        class="powerUpButton"
        style="background-color: #353839; width: 25%;"
        id="bomb"
        on:click={() => highlightPowerUps("bomb")}
      >
        <img src="/images/Bomb.png" width="90" height="90" />
        <p>Bomb<br /><br /></p>
      </button>
    </div>

    <div>
      <button
        class="powerUpButton"
        style="background-color: #353839; width: 25%;"
        id="catchAndAim"
        on:click={() => highlightPowerUps("catchAndAim")}
      >
        <img src="/images/Catch_And_Aim.png" width="90" height="90" />
        <p>Catch And Aim</p>
      </button>

      <button
        class="powerUpButton"
        style="background-color: #353839; width: 25%;"
        id="distracting"
        on:click={() => highlightPowerUps("distracting")}
      >
        <img src="/images/Distracting_Background.png" width="90" height="90" />
        <p>Distracting Background</p>
      </button>

      <button
        class="powerUpButton"
        style="background-color: #353839; width: 25%;"
        id="split"
        on:click={() => highlightPowerUps("split")}
      >
        <img src="/images/Split_Paddle.png" width="90" height="90" />
        <p>Split Paddle<br /><br /></p>
      </button>
    </div>

    <br />
    <hr />

    <p>
      When you are ready and have your powerups selected, click the button
      below:
    </p>
    <button
      class="button button9"
      style="vertical-align: middle;"
      on:click={() => clientReady()}
    >
      Let's Play!
    </button>
  {:else}
    <br />
    <hr />
    <p>Great! Waiting for other players...</p>
  {/if}
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
    height: 70px;
    color: white;
    padding: 15px 15px;
    text-align: center;
    text-decoration: none;
    vertical-align: middle;
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
    width: 50%;
    margin-left: auto;
    margin-right: auto;
  }

  .alignleft {
    float: left;
  }
  .alignright {
    float: right;
  }

  .powerUpButton {
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
</style>
