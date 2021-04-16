<!-- svelteStrictMode: true -->
<script lang="typescript">
  import { Route, router, meta } from "tinro";
  import Home from "./routes/Home.svelte";
  import Game from "./routes/Game.svelte";
  import Leaderboard from "./routes/Leaderboard.svelte";
  import Lobby from "./routes/Lobby.svelte";
  import Settings from "./routes/Settings.svelte";
  import Signup from "./routes/Signup.svelte";
  import Callback from "./routes/Callback.svelte";
  import { onMount } from "svelte";
  import auth from "./authService";
  import { user, auth0Client, lobby_id, user_id, ws } from "./store";
  import LobbySelection from "./routes/LobbySelection.svelte";
  import type { ExitGamePayload } from "@polypong/polypong-common";

  const SERVER_URL =
    import.meta.env.MODE === "production"
      ? "https://polyserver.polypong.ca:8443/"
      : "http://localhost:8443/";

  router.mode.hash();

  // let auth0Client;

  // FR1 User Login
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

    window.onbeforeunload = () => {
      console.log("We are unloading the page");
      console.log("Lobby ID, client side: " + $lobby_id);
      if ($lobby_id !== "") {
        const username = $user?.username;
        const payload: ExitGamePayload = {
          type: "exit_game",
          lobby_id: $lobby_id,
          user_id: $user_id,
          username: username,
        };
        $ws.send(JSON.stringify(payload));
        // return "Are you sure you want to exit the game?";
      }
    };
  });

  // FR1 User Login
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

<!-- <div>
	<div>this will probably be a header or something</div>
	<button on:click={async () => auth.loginWithPopup((await $auth0Client), null)}>Login</button>
	<button
		on:click={async () => {
			const u = await (await $auth0Client).getTokenSilently();
			user.set(u);
		}}>Login Silently</button
	>
	<div>
		{JSON.stringify($user)}
	</div>
	<div>
		{await auth0client.isAuthenticated()}
	</div>
	<a href="/game">goto game</a>
</div> -->

<Route>
  <!-- // FR1 User Login -->
  <!-- // FR2 User Registration -->
  <!-- // FR3 Create Game -->
  <!-- // FR4 Share Link -->
  <!-- // FR5 Join Game -->
  <!-- // FR6 Play Game -->
  <!-- // FR7 Earn XP -->
  <!-- // FR8 Local Leaderboard -->
  <!-- // FR9 Global Leaderboard -->
  <!-- // FR10 User statistics -->
  <!-- // FR11 Power Ups -->
  <!-- // FR12 Expanded Paddle -->
  <!-- // FR13 Shrink Paddle -->
  <!-- // FR14 Self Invisible Paddle -->
  <!-- // FR15 Others Invisible Paddle -->
  <!-- // FR16 Invisible Ball -->
  <!-- // FR17 Self Curved Outwards Paddle -->
  <!-- // FR18 Self Curved Inwards Paddle -->
  <!-- // FR19 Self Bumpy Paddle -->
  <!-- // FR20 Distracting Background -->
  <!-- // FR23 Add Ball -->
  <!-- // FR26 Path Trace -->
  <!-- // FR27 Earn Skin -->
  <!-- // FR28 Select skin -->
  <Route path="/home">
    <Home />
  </Route>
  <Route path="/" redirect="/home" />

  <!-- // FR6 Play Game -->
  <!-- // FR7 Earn XP -->
  <!-- // FR11 Power Ups -->
  <!-- // FR12 Expanded Paddle -->
  <!-- // FR13 Shrink Paddle -->
  <!-- // FR14 Self Invisible Paddle -->
  <!-- // FR15 Others Invisible Paddle -->
  <!-- // FR16 Invisible Ball -->
  <!-- // FR17 Self Curved Outwards Paddle -->
  <!-- // FR18 Self Curved Inwards Paddle -->
  <!-- // FR19 Self Bumpy Paddle -->
  <!-- // FR20 Distracting Background -->
  <!-- // FR23 Add Ball -->
  <!-- // FR26 Path Trace -->
  <!-- // FR27 Earn Skin -->
  <Route path="/game">
    <Game />
  </Route>

  <!-- // FR6 Play Game -->
  <Route path="/eliminated" redirect="/game" />

  <!-- // FR8 Local Leaderboard -->
  <!-- // FR9 Global Leaderboard -->
  <Route path="/leaderboard">
    <Leaderboard />
  </Route>

  <!-- // FR3 Create Game -->
  <!-- // FR5 Join Game -->
  <Route path="/lobby/:id" let:meta>
    <Lobby id={meta.params.id} />
  </Route>

  <!-- // FR3 Create Game -->
  <!-- // FR5 Join Game -->
  <Route path="/lobby">
    <Lobby id="" />
  </Route>

  <!-- // FR28 Select skin -->
  <Route path="/settings">
    <Settings />
  </Route>

  <!-- // FR2 User Registration -->
  <Route path="/signup">
    <Signup />
  </Route>

  <!-- // FR5 Join Game -->
  <Route path="/lobbySelection">
    <LobbySelection />
  </Route>

  <!-- // FR1 User Login -->
  <!-- // FR2 User Registration -->
  <Route path="/callback">
    <Callback />
  </Route>
</Route>
<Route fallback>ruh roh</Route>

<!-- <Route path="/" redirect="/home"/> -->
<style>
  :global(body) {
    margin: 0;
    font-family: Arial, Helvetica, sans-serif;
    background-color: #353839;
  }
</style>
