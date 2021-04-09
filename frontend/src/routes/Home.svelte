<script>
  import auth from "../authService";
  import { user, auth0Client, popupOpen, ws } from "../store";

  import { router } from "tinro";
  import type { CheckExists } from "@polypong/polypong-common";
  import { onMount } from "svelte";

  async function logIn() {
    auth.loginWithRedirect(await $auth0Client); // Do not pass in null in the options field or the code will break
  }

  onMount(() => {
    // loggedInOrRegister();
  });
</script>

<body>
  <h1>PolyPong</h1>

  <hr />

  <div>
    <a href="/lobby">
      <button class="button button2" 
        on:click={async () => {
          const payload = {
            type: "create_lobby",
          };
          $ws.send(JSON.stringify(payload));
          console.log("Attempting to create lobby");
        }}
      >Create Private Game</button>
    </a>

    <a href="/lobbySelection">
      <button class="button button3">Join Public Game</button>
    </a>
 
  </div>



  {#await $auth0Client then client}
    {#await client.isAuthenticated() then loggedin}
      {#if loggedin}
        <a href="/stats">
          <button class="button button2">My Stats and Leaderboard</button>
        </a>
        <a href="/settings">
          <button class="button button3">Settings</button>
        </a>
      {:else}
        <div>
          <button class="button button1" on:click={logIn}>Sign Up/Log In</button>
        </div>
      {/if}
    {/await}
  {/await}

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
