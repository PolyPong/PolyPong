<script>
  import { onMount } from "svelte";
  import { user, auth0Client } from "../store";
  import { router, meta } from "tinro";

  let globalLeaderboard = false;
  let xp: number = 0;
  let wins: number = 0;
  let losses: number = 0;
  let gamesPlayed: number = 0;

  let username: string = "";

  const SERVER_URL =
    import.meta.env.MODE === "production"
      ? "https://polyserver.polypong.ca:8443/"
      : "http://localhost:8443/";

  onMount(async () => {
    await getUsername();

    username = $user.username;
    if (username) {
      const xpresponse = await fetch(SERVER_URL + "getxp/" + username);
      const xpresponseBody = await xpresponse.text();
      xp = parseInt(xpresponseBody);

      const winresponse = await fetch(SERVER_URL + "getwins/" + username);
      const winresponseBody = await winresponse.text();
      wins = parseInt(winresponseBody);

      const lossresponse = await fetch(SERVER_URL + "getlosses/" + username);
      const lossresponseBody = await lossresponse.text();
      losses = parseInt(lossresponseBody);

      gamesPlayed = wins + losses;
      console.log(wins);
      console.log(losses);
      console.log(gamesPlayed);
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

  function toggleBackground(idOfLabel, ...ids) {
    if (idOfLabel == "me") {
      globalLeaderboard = false;
    } else {
      globalLeaderboard = true;
    }
    for (let i = 0; i < ids.length; i++) {
      document.getElementById(ids[i]).style.backgroundColor = "#353839";
      document.getElementById(ids[i]).style.color = "#FFFFFF";
    }
    var id = document.getElementById(idOfLabel);
    id.style.backgroundColor = "#FFFFFF";
    id.style.color = "#353839";
  }
</script>

<body>
  <h1>PolyPong</h1>
  <hr />

  <h2>My Stats</h2>

  {#if username}
    <p style="text-align:center">Games Played: {gamesPlayed}</p>
    {#if wins !== 0 || losses !== 0}
      <p style="text-align:center">Win/Loss Ratio: {wins / (wins + losses)}</p>
    {/if}
    <p style="text-align:center">Games Won: {wins}</p>
    <p style="text-align:center">XP Level: {xp}</p>
  {:else}
    <p style="text-align:center; padding: 50px;">
      To see your stats, create an account or log in!
    </p>
  {/if}

  <!-- <table class="center" width="100%">
    <tr height="50px">
      <td style="text-align:left">Games Played: 70</td>
      <td style="text-align:left">Win/Loss Ratio: 0.88</td>
    </tr>

    <tr height="50px">
      <td style="text-align:left">Games Won: 62</td>
      <td style="text-align:left">XP Level: 22</td>
    </tr>
  </table> -->

  <hr />
  <h2>Leaderboard</h2>

  <div class="content">
    <div>
      <label id="me" class="label preselected">
        <input
          type="radio"
          class="radio"
          name="radio2"
          checked
          on:click={() => toggleBackground("me", "me", "top_worldwide")}
        />Your Position</label
      >
      <label id="top_worldwide" class="label">
        <input
          type="radio"
          class="radio"
          name="radio2"
          on:click={() =>
            toggleBackground("top_worldwide", "me", "top_worldwide")}
        />Top in the World</label
      >
    </div>
  </div>
  <br />

  {#if globalLeaderboard}
    {#await fetch(SERVER_URL + "leaderboard") then res}
      {#await res.json() then leaderboard}
        <ol>
          <div style="margin: auto; width: 50%;">
            <li class="alignleft" style="list-style-type: none">Username</li>
            <li class="alignright" style="list-style-type: none">XP Earned</li>
            <br />
            <br />
            {#each leaderboard as entry, index}
              <li class="alignleft" value={index + 1}>{entry.username}</li>
              <li class="alignright" style="list-style-type: none">
                {entry.xp}
              </li>
              <br />
            {/each}
          </div>
        </ol>
      {/await}
    {/await}
  {:else if username}
    {#await fetch(SERVER_URL + "localleaderboard/" + username) then res}
      {#await res.json() then leaderboard}
        <ol>
          <div style="margin: auto; width: 50%;">
            <li class="alignleft" style="list-style-type: none">Username</li>
            <li class="alignright" style="list-style-type: none">XP Earned</li>
            <br />
            <br />
            {#each leaderboard as entry, index}
              <li class="alignleft" value={entry.position}>{entry.username}</li>
              <li class="alignright" style="list-style-type: none">
                {entry.xp}
              </li>
              <br />
            {/each}
          </div>
        </ol>
      {/await}
    {/await}
  {:else}
    <p style="padding: 50px;">
      To see your position on the leaderboards, create an account or log in!
    </p>
  {/if}

  <hr />

  <a href="/home">
    <button class="button button4">Home</button>
  </a>

  <!-- 

  <h1>PolyPong</h1>
  <hr />
  <div class="content">
    <div>
      <label id="me" class="label preselected">
        <input
          type="radio"
          class="radio"
          name="radio2"
          checked
          on:click={() => toggleBackground("me", "me", "top_worldwide")}
        />Me</label>
      <label id="top_worldwide" class="label">
        <input
          type="radio"
          class="radio"
          name="radio2"
          on:click={() =>
            toggleBackground("top_worldwide", "me", "top_worldwide")}
        />Top</label>
    </div>
    <br />
    <br />
    <div>
      <label id="time1" class="label preselected"
        ><input
          type="radio"
          class="radio"
          name="radio1"
          checked
          on:click={() => toggleBackground("time1", "time1", "time2", "time3")}
        />Week</label
      >
      <label id="time2" class="label"
        ><input
          type="radio"
          class="radio"
          name="radio1"
          on:click={() => toggleBackground("time2", "time1", "time2", "time3")}
        />Month</label
      >
      <label id="time3" class="label"
        ><input
          type="radio"
          class="radio"
          name="radio1"
          on:click={() => toggleBackground("time3", "time1", "time2", "time3")}
        />Year</label>
    </div>
    <br />
    <br />
    <div class="parent">
      <ol>
        <p>Username...................XP Earned</p>
        <li>Arun.......................................8888</li>
        <li>Josh.......................................7777</li>
        <li>Micheal.................................1234</li>
        <li>ABCD.....................................1233</li>
        <li>qwer.......................................1200</li>
        <li>asdf........................................1000</li>
        <li>zazz...........................................999</li>
        <li>emdw..........................................787</li>
        <li>bmus...........................................757</li>
      </ol>
    </div>
  </div>

  <a href="/home">
  --><!-- This assumes the user is logged in --><!--
    <button class="button button4">Home</button>
  </a> -->
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
    width: 100%;
  }

  p {
    font-family: SuperLegendBoy;
    text-align: center;
    font-size: 22px;
  }

  ol {
    display: inline-block;
    font-size: 22px;
    text-align: center;
    width: 100%;
  }

  /* Makes radio buttons (the circle part) disappear */
  .radio {
    position: absolute;
    margin: 0 !important;
    padding: 0 !important;
    opacity: 0;
    height: 0;
    width: 0;
    pointer-events: none;
  }

  /* For the radio buttons initially selected, we want it highlighted */
  .preselected {
    background-color: #ffffff;
    color: #353839;
  }

  .label {
    margin: 0px;
    padding: 9px;
  }

  .content {
    margin: auto;
  }

  .parent {
    text-align: center;
  }

  .button {
    font-family: SuperLegendBoy;
    border: 2px solid #ffffff;
    height: 50px;
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

  .button:hover {
    background-color: #ffffff; /* White */
    color: #353839;
  }

  .button4 {
    width: 20%;
    margin-left: auto;
    margin-right: auto;
  }

  .alignleft {
    float: left;
  }
  .alignright {
    float: right;
  }
</style>
