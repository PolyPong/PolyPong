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

  let skinSelected: string = "#fafafa";
  let authenticated = false;

  onMount(async () => {
    authenticated = await (await $auth0Client).isAuthenticated();
    console.log(authenticated);
    if (authenticated) {
      await (await $auth0Client).getTokenSilently();
      const response = await fetch(SERVER_URL + "getselectedskin/" + $user.username);
      if (response.body){
        skinSelected = await response.text();
      }
      
    }
    await getUsername();
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
  <h2>Skins:</h2>

  {#await $auth0Client}
    <div>Seeing if you're logged in... Hold on</div>
  {:then client}
    {#await client.isAuthenticated()}
      <div>Seeing if you're logged in... Hold on</div>
    {:then isauthenticated}
      {#if isauthenticated}
      <p>{$user.username}'s unlocked skins:</p>
        {#await fetch(SERVER_URL + "getavailableskins/" + $user.username)}
          <div>Getting available skins...</div>
        {:then res}
          {#await res.json()}
            <div>Getting available skins...</div>
          {:then skins}
            {#if skins.length == 0}
              <p>You haven't unlocked any skins yet</p>
            {:else}
              <div class="grid-container">
                {#each skins as skin}
                  <button class="button"
                    style={`color:${skin};`}
                    on:click={() => setSkin(skin)}>{colors[skin]}</button
                  >
                {/each}
              </div>
            {/if}
          {/await}
        {/await}
        <br/>

        <p>You have selected the {colors[skinSelected]} paddle color!</p>
      {:else}
        <div style="padding: 50px;">
          It seems like you're not logged in. As a result, you are stuck with the white skin until you log in and unlock some new skins!
        </div>
      {/if}
    {/await}
  {/await}

  <br/>
  <br/>
  <br/>

  
  <a href="/home">
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
    width: 100%;
    margin-left: auto;
    margin-right: auto;
  }

  .button:hover{
    background-color: white;
    color: #353839;
  }  

  .button8 {
    color: white;
    background-color: #353839;
    border: 2px solid white;
    width: 20%;
  }
  .button8:hover {
    background-color: white;
    color: #353839;
  }

  .grid-container {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        grid-gap: 25px;        
  }

  
</style>
