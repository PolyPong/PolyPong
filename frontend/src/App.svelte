<!-- svelteStrictMode: true -->
<script lang="typescript">
  import { Route, router, meta } from "tinro";
  import Home from "./routes/Home.svelte";
  import Game from "./routes/Game.svelte";
  import Leaderboard from "./routes/Leaderboard.svelte";
  import Lobby from "./routes/Lobby.svelte";
  import Powerups from "./routes/Powerups.svelte";
  import Settings from "./routes/Settings.svelte";
  import Signup from "./routes/Signup.svelte";
  import Stats from "./routes/Stats.svelte";
  import Login from "./routes/Login.svelte";
  import Callback from "./routes/Callback.svelte";
  import { onMount } from "svelte";
  import auth from "./authService";
  import { user, auth0Client } from "./store";
  import LobbySelection from "./routes/LobbySelection.svelte";

  const SERVER_URL =
    import.meta.env.MODE === "production"
      ? "https://polyserver.polypong.ca:8443/"
      : "http://localhost:5000/";

  router.mode.hash();

  // let auth0Client;

  onMount(async () => {
    console.log("We are in onMount");
    if (await (await $auth0Client).isAuthenticated()) {
      console.log("The user is autheticated");
      await (await $auth0Client).getTokenSilently();
    }

    getUsername();
    // createclient should do this part automatically
    // await auth0Client.getTokenSilently();
    user.set(await (await $auth0Client).getUser());
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
  <Route path="/" redirect="/home" />

  <Route path="/home">
    <Home />
  </Route>

  <Route path="/game">
    <Game />
  </Route>

  <Route path="/eliminated" redirect="/game" />

  <Route path="/leaderboard">
    <Leaderboard />
  </Route>

  <Route path="/lobby/:id" let:meta>
    <Lobby id={meta.params.id} />
  </Route>

  <Route path="/lobby">
    <Lobby id="" />
  </Route>

  <Route path="/powerups">
    <Powerups />
  </Route>

  <Route path="/settings">
    <Settings />
  </Route>

  <Route path="/signup">
    <Signup />
  </Route>

  <Route path="/stats">
    <Stats />
  </Route>

  <Route path="/login">
    <Login />
  </Route>

  <Route path="/lobbySelection">
    <LobbySelection />
  </Route>

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
