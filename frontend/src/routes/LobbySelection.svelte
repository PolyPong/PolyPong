<!-- This file creates a grid of publicly available lobbies that have been precreated on the backend 
Anyone can join these public lobbies (as long as a game is not in progress) and play a game with people they don't know
These lobbies are meant to be evergreen - instead of being created and destroyed after a game is over,
they can be reused for game after game. This file is exclusively about FR5 - Join Game. -->

<script>
    import { router } from "tinro";

    // FR5 Join Game
    const LobbyNames: string[] = ["DICE","Solarium","Cameron","SUB","CCIS","Windsor","ECERF","Telus", "Tory", "Butterdome", "Quad", "Lister"];

    // FR5 Join Game
    const joinGameButton = (input: string | undefined) => {
        router.goto("/lobby/" + input);
    };
</script>

<body>
    <h1 id="header" style="background-color: #353839;">PolyPong</h1>

    <hr />

    <!-- // FR5 Join Game -->
    <p>Choose a lobby to join: </p>

    <div class="grid-container">
        {#each LobbyNames as lobbyName}
            <a href={`/lobby/${lobbyName}`}>
                <button class="button grid-item">{lobbyName}</button>
            </a>
        {/each}
    </div>

    <br/>
    <hr />
    <br/>

    <a href="/home">
        <button class="button1 button4">Home</button>
    </a>

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

    .button1 {
    font-family: SuperLegendBoy;
    border: 2px solid #ffffff;
    height: auto;
    color: white;
    padding: 15px 15px;
    text-align: center;
    text-decoration: none;
    display: inline-block;
    font-size: 22px;
    margin: 10px 0px;
    cursor: pointer;
    background-color: #353839;
    width: 95%;
    margin-left: 2.5%;
    margin-right: 2.5%;
  }

  .button1:hover {
    background-color: #ffffff; /* White */
    color: #353839;
  }


    .grid-container {
        display: grid;
        grid-template-columns: auto auto;
    }


</style>
