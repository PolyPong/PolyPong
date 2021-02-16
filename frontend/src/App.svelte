<script lang="typescript">
	import { Route, router } from "tinro";
	import Home from "./routes/Home.svelte";
	import Game from "./routes/Game.svelte";
	import Leaderboard from "./routes/Leaderboard.svelte";
	import Lobby from "./routes/Lobby.svelte";
	import Powerups from "./routes/Powerups.svelte";
	import Settings from "./routes/Settings.svelte";
	import Signup from "./routes/Signup.svelte";
	import Stats from "./routes/Stats.svelte";
	import Login from "./routes/Login.svelte";
	import Auth0Demo from "./routes/Auth0Demo.svelte";
	import { onMount } from "svelte";
	import auth from "./authService";
	import { isAuthenticated, user } from "./store";

	router.mode.hash();

	let auth0Client;

	onMount(async () => {
		auth0Client = await auth.createClient();
		isAuthenticated.set(await auth0Client.isAuthenticated());
		user.set(await auth0Client.getUser());
	});
</script>

<div>
	<div>this will probably be a header or something</div>
	<button on:click={() => auth.loginWithRedirect(auth0Client)}>Login</button>
	<button
		on:click={async () => {
			const u = await auth0Client.getTokenSilently();
			user.set(u);
		}}>Login Silently</button
	>
	<div>
		{JSON.stringify($user)}
	</div>
	<div>
		{$isAuthenticated}
	</div>
</div>

<Route>
	<!-- <Route path="/" redirect="/home"/> -->

	<Route path="/home">
		<Home />
	</Route>

	<Route path="/game">
		<Game />
	</Route>

	<Route path="/leaderboard">
		<Leaderboard />
	</Route>

	<Route path="/lobby">
		<Lobby />
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

	<Route path="/authdemo">
		<Auth0Demo />
	</Route>
</Route>
<Route fallback>ruh roh</Route>

<!-- <Route path="/" redirect="/home"/> -->
<style>
	:global(body) {
		margin: 0;
		font-family: Arial, Helvetica, sans-serif;
	}
</style>
