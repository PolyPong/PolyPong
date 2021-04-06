<script>
    import { router } from "tinro";

    // import {joinGame, ws, user_id} from "../store"

    const LobbyNames: string[] = [
        "Turing",
        "Jobs",
        "Gates",
        "Torvalds",
        "Stallman",
        "Davis",
        "Brin",
    ];

    const joinGameButton = (input: string | undefined) => {
        router.goto("/lobby/" + input);
    };
</script>

<body>
    <h1 id="header" style="background-color: #353839;">PolyPong</h1>

    <hr />

    {#each LobbyNames as lobbyName}
        <a href={`/lobby/${lobbyName}`}>
            <button>{lobbyName}</button>
        </a>
    {/each}
</body>

<style>
    h1 {
        font-family: SuperLegendBoy;
        text-align: center;
        color: white;
        background-color: #353839;
    }
</style>
