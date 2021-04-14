<script lang="ts">
  import { onDestroy, onMount, afterUpdate } from "svelte";
  import { Route, router, meta } from "tinro";
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
    power_ups_str_long,
    power_up_one_used,
    power_up_two_used,
    power_up_three_used,
    usernames,
    auth0Client,
    user,
  } from "../store";

  const SERVER_URL =
    import.meta.env.MODE === "production"
      ? "https://polyserver.polypong.ca:8443/"
      : "http://localhost:5000/";

  const WEBSITE_URL =
    import.meta.env.MODE === "production"
      ? "https://polypong.ca/#/"
      : "http://localhost:3000/#/";

  export let id: string;
  let lobby_input: string;
  let powerUpsStr: any[] = [];
  let allPowerUpNamesShort: string[] = ["bigger", "smaller", "bumpy", "curvedInwards", "curvedOutwards", "selfInvisible", "othersInvisible", "ballInvisible", "anotherBall", "distracting", "tracePath"];
  let allPowerUpNamesLong: string[] = ["Bigger Paddle", "Smaller Paddle", "Bumpy Paddle", "Curved Inwards", "Curved Outwards", "Invisible Paddle, Self", "Invisible Paddle, Others", "Invisible Ball", "Add Ball", "Distracting Background", "Trace Ball Path"];

  let client_ready: boolean = false;

  let expandedPaddleButton: HTMLElement;
  let copyLink: HTMLTextAreaElement;

  afterUpdate(() => console.log($lobby_id));

  onMount(async () => {

    console.log("We are in onMount");
    if (await (await $auth0Client).isAuthenticated()) {
      console.log("The user is autheticated");
      await (await $auth0Client).getTokenSilently();
    }

    // createclient should do this part automatically
    // await auth0Client.getTokenSilently();
    user.set(await (await $auth0Client).getUser());
    await getUsername();



    if (id) {
      setTimeout(() => {
        joinGame(id, $user_id);
        lobby_input = id;
        console.log("hm", id);
      }, 1000);
    }
  });

  async function getUsername() {
    if (await (await $auth0Client).isAuthenticated()) {
      const token = await (await $auth0Client).getTokenSilently();

      const res = await fetch(SERVER_URL + "whatismyname", {
        method: "GET",
        headers: {
          Authorization: token,
        },
      });
      if (res.status === 204) {
        router.goto("/signup");
        return;
      }

      if (res.status === 200) {
        $user.username = await res.text();
        console.log("In getUsername: " + $user.username);
      }
    } else {
      // Not authenticated so we stay on this page
    }
  }

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

  function highlightPowerUps(idOfElement: string) {
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

    let powerUpNamesLong: string[] = []
    for (const powerUp of powerUpsStr){
      powerUpNamesLong.push(allPowerUpNamesLong[allPowerUpNamesShort.indexOf(powerUp)]);
    }
    power_ups_str_long.set(powerUpNamesLong);
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
  <!-- {#if !!$lobby_id}
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
  {/if} -->
  <h1 id="header" style="background-color: #353839;">PolyPong</h1>
  <hr />
  <h2>Lobby</h2>

  <hr />

  <h3>Current Players:</h3>

  <!-- {#each $usernames as [username, xp], index ([username,xp])}
    {#if index < 6}
      <div style="float: left; width: 40%;">
        <div style="text-align: left">
          {index}. {username}
          <span style="float:right;">{xp}</span>
        </div>
      </div>
    {:else}
      <div style="float: right; width: 40%;">
        <div style="text-align: left">
          {index}. {username}
          <span style="float:right;">{xp}</span>
        </div>
      </div>
    {/if}
  {/each} -->


  {#if $usernames.length > 6}
    <ol>
      <div style="float: left; width: 40%;">
        <li class="alignleft" style="list-style-type: none">Username</li>
        <li class="alignright" style="list-style-type: none">XP</li>
        <br/>
        <br/>
        {#each $usernames as [username, xp], index}
          {#if index < 6}
            <li class="alignleft" value={index+1}>{username}</li>
            <li class="alignright" style="list-style-type: none">{xp}</li>
            <br />
            {#if (index+1) == $usernames.length}
              <li class="alignleft" value={index+1}>Waiting...</li>
              <br />
            {/if}
          {/if} 
        {/each}
      </div>
    </ol>

    <ol>
      <div style="float: right; width: 40%;">
        <!-- {#if $usernames.length >= 6} -->
          <li class="alignleft" style="list-style-type: none">Username</li>
          <li class="alignright" style="list-style-type: none">XP</li>
          <br/>
          <br/>
          {#each $usernames as [username, xp], index}
            {#if index >= 6}
              <li class="alignleft" value={index+1}>{username}</li>
              <li class="alignright" style="list-style-type: none">{xp}</li>
              <br />
              {#if index < 11}
                {#if (index+1) == $usernames.length}
                  <li class="alignleft" value={index+2}>Waiting...</li>
                  <br />
                {/if}
              {/if}
            {/if} 
          {/each}
        <!-- {/if} -->
      </div>
    </ol>
  {:else}
    <ol>
      <div style="margin: auto; width: 50%;">
        <li class="alignleft" style="list-style-type: none">Username</li>
        <li class="alignright" style="list-style-type: none">XP</li>
        <br/>
        <br/>
        {#each $usernames as [username, xp], index}
          {#if index < 6}
            <li class="alignleft" value={index+1}>{username}</li>
            <li class="alignright" style="list-style-type: none">{xp}</li>
            <br />
          {/if} 
          {#if (index+1) == $usernames.length}
            <li class="alignleft" value={index+2}>Waiting...</li>
            <br />
          {/if}
        {/each}
      </div>
    </ol>
  {/if}

  <br />
  <br />
  <br />
  <br />
  <br />
  <br />
  <br />
  <br />

  <div>
    <p>Link to join the lobby you are in:</p>
    <textarea class="text-area" rows="1" readonly bind:this={copyLink}>{WEBSITE_URL + "lobby/" + $lobby_id}</textarea>
    <p style="text-decoration: underline;">{WEBSITE_URL + "lobby/" + $lobby_id}</p>
    <button class="button button4"
      on:click={() => {
        copyLink.select();
        document.execCommand("copy");
      }}
    >
      Copy Link to Clipboard to Invite Friends
    </button>

    <!-- {#if !!$lobby_id}
      <p style="font-size: 10px;">(Lobby ID: {$lobby_id})</p>
    {/if} -->
  </div>

  <br>
  

  <!-- <button class="button button4" style="vertical-align: middle;">
    Copy Link to Invite Friends
  </button> -->

  {#if !client_ready}
    <hr />
    <br>
    <h2>Choose 3 Powerups:</h2>
    <br />

    <div class="grid-container">
      {#each allPowerUpNamesShort as powerUpName, index}
        <button class="powerUpButton grid-item" id="{powerUpName}"
          on:click={() => highlightPowerUps(powerUpName)}
        >
          <img src="/images/{powerUpName}.png" width="90" height="90" />
          <p>{allPowerUpNamesLong[index]}</p>
        </button>
          
      {/each}
    </div>

    <br />
    <hr />

    {#if $usernames.length > 1}
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
      <p>Waiting for one more player to join the lobby...</p>
    {/if}
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

  .text-area {
    font-family: SuperLegendBoy;
    text-align: left;
    font-size: 22px;
    color: white;
    background-color: #353839;
    border: none;
    resize: none;
    height:0;
    position: absolute;
    z-index: -1;
    width:0;
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
    width: 70%;
    margin-left: auto;
    margin-right: auto;
  }

  .alignleft {
    float: left;
  }
  .alignright {
    float: right;
  }

  /* .powerUpButton {
    font-family: SuperLegendBoy;
    border: 2px solid #ffffff;
    height: 300px;
    color: white;
    padding: 15px 15px;
    text-align: center;
    text-decoration: none;
    display: inline-block;
    font-size: 20px;
    margin: 5px 5px;
    cursor: pointer;
    width: 100%;
    background-color: #353839;
    margin-left: auto;
    margin-right: auto;
  } */

  .powerUpButton {
    font-family: SuperLegendBoy;
    border: 2px solid #ffffff;
    height: 300px;
    color: white;
    text-align: center;
    display: inline-block;
    font-size: 20px;
    cursor: pointer;
    background-color: #353839;
  }

  .grid-container {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        grid-gap: 25px;        
  }
</style>
