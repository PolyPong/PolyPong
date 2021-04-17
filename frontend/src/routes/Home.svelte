<script>
  import auth from "../authService";
  import { user, auth0Client, ws } from "../store";

  import { router } from "tinro";
  import { onMount } from "svelte";

  const SERVER_URL =
    import.meta.env.MODE === "production"
      ? "https://polyserver.polypong.ca:8443/"
      : "http://localhost:8443/";

  // FR1 User Login
  async function logIn() {
    auth.loginWithRedirect(await $auth0Client); // Do not pass in null in the options field or the code will break
  }

  onMount(async () => {
    await getUsername();
  });

  // FR1 User Login
  // FR5 Join Game
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

</script>

<body>
  <h1>PolyPong</h1>

  <hr />

  <!-- // FR3 Create Game -->
  <div>
    <button class="button button2" 
      on:click={async () => {
        if($ws.readyState !== WebSocket.OPEN){
          return;
        }
        const payload = {
          type: "create_lobby",
        };
        $ws.send(JSON.stringify(payload));
        console.log("Attempting to create lobby");
        router.goto("/lobby");
      }}
    >Create Private Game</button>

    <!-- // FR5 Join Game -->
    <a href="/lobbySelection">
      <button class="button button3">Join Public Game</button>
    </a>
 
  </div>


  <!-- // FR1 User Login -->
  <!-- // FR2 User Registration -->
  <!-- // FR8 Local Leaderboard -->
  <!-- // FR9 Global Leaderboard -->
  <!-- // FR10 User statistics -->
  <!-- // FR27 Earn Skin -->
  <!-- // FR28 Select skin -->
  {#await $auth0Client then client}
    {#await client.isAuthenticated() then loggedin}
      {#if loggedin}
        <a href="/leaderboard">
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
