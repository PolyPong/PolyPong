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
	import { onMount } from "svelte";

	router.mode.hash();

	onMount(() => router.goto("/home"));
</script>

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

<style>
	:global(body) {
		margin: 0;
		font-family: Arial, Helvetica, sans-serif;
	}
</style>
