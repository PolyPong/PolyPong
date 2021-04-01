<script lang="ts">
  import { onMount } from "svelte";
  import { skins, ws, user_id, auth0Client} from "../store";
  import type {
    GetAvailableSkinsRequest,
    SetSkinRequest,
    Color,
  } from "@polypong/polypong-common";

  onMount(async () => {
    if (!(await (await $auth0Client).isAuthenticated())) {
      return;
    }
    const payload: GetAvailableSkinsRequest = {
      type: "get_available_skins",
      username: $user_id,
    };
    $ws.send(JSON.stringify(payload));
  });
  let skinSelected = "white";

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

    const payload: SetSkinRequest = {
      type: "set_skin",
      skin,
      token,
    };

    $ws.send(JSON.stringify(payload));
  };
</script>

<body>
  {#await $auth0Client}
    <div>Getting available skins... Hold on</div>
  {:then client}
    {#await client.isAuthenticated()}
      <div>Getting available skins... Hold on</div>
    {:then isauthenticated}
      {#if isauthenticated}
        {#each $skins as skin}
          <button
            style={`background-color:${skin};`}
            on:click={() => setSkin(skin)}>{skin}</button
          >
        {/each}
      {:else}
        <div>
          it seems like you're not logged in. You're stuck with the white skin
          then
        </div>
      {/if}
    {/await}
  {/await}
  <h1 id="header" style="background-color: #353839;">PolyPong</h1>
  <hr />
  <br />
  <p>Selected Skin:</p>

  <div>
    <button
      class="button button4"
      id="white"
      style="vertical-align: middle;"
      on:click={() => highlightSkins("white")}>Default</button
    >
    <button
      class="button button5"
      id="red"
      style="vertical-align: middle;"
      on:click={() => highlightSkins("red")}>Red</button
    >
    <button
      class="button button6"
      id="blue"
      style="vertical-align: middle;"
      on:click={() => highlightSkins("blue")}>Blue</button
    >
    <button
      class="button button7"
      id="orange"
      style="vertical-align: middle;"
      on:click={() => highlightSkins("orange")}>Orange</button
    >
  </div>

  <br />
  <hr />
  <br />

  <p>Change Email:</p>

  <label for="email">Current Email:</label>
  <input type="text" class="input" id="email" name="email" /><br /><br />

  <a href="/login">
    <!-- This assumes the user is logged in -->
    <button class="button button8">Home</button>
  </a>
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
