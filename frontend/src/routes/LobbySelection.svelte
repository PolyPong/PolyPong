<script>
    import { router } from "tinro";

    // import {joinGame, ws, user_id} from "../store"

    const LobbyNames: string[] = ["DICE 8th Floor","ETLC Solarium","Cameron Library","SUB","CCIS","Windsor Library","ECERF","Telus Building"];

    const joinGameButton = (input: string | undefined) => {
        router.goto("/lobby/" + input);
    };
</script>

<body>
    <h1 id="header" style="background-color: #353839;">PolyPong</h1>

    <hr />

    <p>Choose a lobby to join: </p>

    <div class="grid-container">
        {#each LobbyNames as lobbyName}
            <a href={`/lobby/${lobbyName}`}>
                <button class="button grid-item">{lobbyName}</button>
            </a>
        {/each}
    </div>

    <hr />

</body>

<style>
    h1 {
        font-family: SuperLegendBoy;
        text-align: center;
        color: white;
        background-color: #353839;
    }

    p {
        font-family: SuperLegendBoy;
        text-align: center;
        color: white;
        font-size: 22px;
    }

    .button {
        font-family: SuperLegendBoy;
        border: 2px solid white;
        height: auto;
        color: white;
        padding: 15px 15px;
        text-align: center;
        text-decoration: none;
        display: inline-block;
        font-size: 22px;
        margin: 10px 10px;
        cursor: pointer;
        background-color: #353839;
        width: 90%;
        margin-left: 5%;
        margin-right: 5%;
    }

    .button:hover {
        background-color: white;
        color: #353839;
    }

    .grid-container {
        display: grid;
        grid-template-columns: auto auto;
    }


</style>
