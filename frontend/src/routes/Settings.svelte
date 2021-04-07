<script lang="ts">
  import { onMount } from "svelte";
  import { skins, ws, user, user_id, auth0Client } from "../store";
  import { Color } from "@polypong/polypong-common";
import { router } from "tinro";

  const SERVER_URL =
    import.meta.env.MODE === "production"
      ? "https://polyserver.polypong.ca:8443/"
      : "http://localhost:5000/";

  // swap hex code with user friendly name
  const colors = Object.assign(
    {},
    ...Object.entries(Color).map(([a, b]) => ({ [b]: a }))
  );

  let skinSelected = "white";
  let authenticated = false;

  onMount(async () => {
    authenticated = await (await $auth0Client).isAuthenticated();
    console.log(authenticated);
    if (authenticated) {
      await (await $auth0Client).getTokenSilently();
    }
  });

  function highlightSkins(idOfSkin: string) {
    if (idOfSkin == skinSelected) {
      return true;
    } else if (idOfSkin == "white") {
      document.getElementById(skinSelected)!.style.backgroundColor = "#353839";
      document.getElementById(skinSelected)!.style.color = skinSelected;
      document.getElementById(idOfSkin)!.style.backgroundColor = idOfSkin;
      document.getElementById(idOfSkin)!.style.color = "#353839";
      skinSelected = idOfSkin;
    } else {
      document.getElementById(skinSelected)!.style.backgroundColor = "#353839";
      document.getElementById(skinSelected)!.style.color = skinSelected;
      document.getElementById(idOfSkin)!.style.backgroundColor = idOfSkin;
      document.getElementById(idOfSkin)!.style.color = "#FFFFFF";
      skinSelected = idOfSkin;
    }
  }

  const setSkin = async (skin: Color) => {
    if (!(await (await $auth0Client).isAuthenticated())) {
      alert("oops, you are a guest user");
      return;
    }

    const token = await (await $auth0Client).getTokenSilently();

    console.log("token", token);

    const success = await fetch(SERVER_URL + "setskin", {
      method: "POST",
      headers: {
        Authorization: token,
      },
      body: skin,
    });

    skinSelected = skin;
  };
</script>

<body>
  <h1 id="header" style="background-color: #353839;">PolyPong</h1>
  <hr />
  <br />
  <p>Selected Skin:</p>

  {#await $auth0Client}
    <div>Seeing if you're logged in... Hold on</div>
  {:then client}
    {#await client.isAuthenticated()}
      <div>Seeing if you're logged in... Hold on</div>
    {:then isauthenticated}
      {#if isauthenticated}
        {#await fetch(SERVER_URL + "getavailableskins/" + $user.username)}
          <div>getting available skins...</div>
        {:then res}
          {#await res.json()}
            <div>getting available skins...</div>
          {:then skins}
            {#each skins as skin}
              <button class="button"
                style={`color:${skin};`}
                on:click={() => setSkin(skin)}>{colors[skin]}</button
              >
            {/each}
          {/await}
        {/await}
      {:else}
        <div>
          it seems like you're not logged in. You're stuck with the white skin
          then
        </div>
      {/if}
    {/await}
  {/await}

  {#if {authenticated}}
    <a href="/login">
      <!-- This assumes the user is logged in -->
      <button class="button button8">Logged In Home</button>
    </a>
  {:else}
    <a href="/home">
      <!-- This assumes the user is logged in -->
      <button class="button button8">Guest Home</button>
    </a>
  {/if}

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
  }

  p {
    font-family: SuperLegendBoy;
    text-align: center;
    font-size: 22px;
  }

  .button {
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
    width: 20%;
    margin-left: auto;
    margin-right: auto;
  }

  .button:hover{
    background-color: white;
  }

  .button4 {
    color: #353839;
    background-color: white;
    border: 2px solid white;
  }
  .button4:hover {
    background-color: white;
    color: #353839;
  }

  .button5 {
    color: red;
    border: 2px solid red;
  }
  .button5:hover {
    background-color: red;
    color: white;
  }

  .button6 {
    color: blue;
    border: 2px solid blue;
  }
  .button6:hover {
    background-color: blue;
    color: white;
  }

  .button7 {
    color: orange;
    border: 2px solid orange;
  }
  .button7:hover {
    background-color: orange;
    color: white;
  }

  .button8 {
    color: white;
    background-color: #353839;
    border: 2px solid white;
  }
  .button8:hover {
    background-color: white;
    color: #353839;
  }

  .input {
    font-family: SuperLegendBoy;
    height: auto;
    width: 50%;
    padding: 15px 0px;
    text-align: center;
    border: 2px solid white;
    background-color: #353839;
    font-size: 22px;
    margin: 10px 0px;
  }

  input:focus {
    color: white;
  }
</style>
