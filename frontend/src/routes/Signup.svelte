<script>
  import { user, auth0Client, usernameExists, ws } from "../store";
  import { router } from "tinro";
  import { onMount } from "svelte";
  import type { CheckExists } from "@polypong/polypong-common";

  let email: HTMLInputElement;
  let username: HTMLInputElement;

  const SERVER_URL =
    import.meta.env.MODE === "production"
      ? "https://polyserver.polypong.ca:8443/"
      : "http://localhost:5000/";

  onMount(async () => {
    // createclient should do this part automatically
    // await auth0Client.getTokenSilently();
    if (await (await $auth0Client).isAuthenticated()) {
      email.readOnly = true;
      email.value = $user.email;
    } else {
      console.log("Error. User not autheticated");
      router.goto("/home");
    }
    user.set(await (await $auth0Client).getUser());
  });

  async function signUpUser() {
    const input = username.value.trim();
    if (input === "") {
      console.log("Nothing entered");
    } else {
      console.log(input);
      if ($usernameExists) {
        $usernameExists = false;
      }
      const token = await (await $auth0Client).getTokenSilently();
      // Check if username is in the database
      // Send over a check_exists request for the username to server and wait for response (response happens in store.ts)
      const res = await fetch(SERVER_URL + "signup", {
        method: "POST",
        body: JSON.stringify({
          username: input,
        }),
        headers: {
          Authorization: token,
        },
      });

      if (res.status === 204) {
        router.goto("/");
        return;
      }

      if (res.status === 409) {
        console.log("error: username already taken");
        $usernameExists = true;
        return;
      }

      // TODO serverurl, add createuser
    }
  }
</script>

<body>
  <h1 id="header" style="background-color: #353839;">PolyPong</h1>
  <hr />
  <h2>Sign Up:</h2>

  <br />
  <br />

  <!-- <p id="email">Email: </p> -->
  <label for="email" class="label1">Email:</label>
  <input type="text" class="input1" id="email" bind:this={email} name="email" />
  <br />
  <br />

  <!-- <label for="username" class="label2">Username:</label>
    <input type="text" class="input" id="username" name="username" /><br /><br /> -->


  <label for="username" class="label2">Username:</label>
  <input
    type="text"
    class={$usernameExists ? "usernameExists" : "input"}
    id="username"
    bind:this={username}
    name="username"
  /><br /><br />

  {#if $usernameExists}
    <p class="redtext">
      Username already exists, please choose a different one
    </p>
  {/if}

  <p>
    Please choose a unique username. This will be visible to the people that you
    play with.
  </p>
  <p>
    The email address above is used to create your account, and we will send you
    a confirmation email when an account with your email has been created.
  </p>
  <p>
    We will not email you again after the initial confirmation email, and we
    will never sell your information.
  </p>

  <br />
  <br />

  <!-- <a href="/home"> -->
  <button class="button button8" on:click={signUpUser}>Create Account</button>
  <!-- </a> -->
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

  h2 {
    font-family: SuperLegendBoy;
    text-align: center;
    font-size: 22px;
  }

  p {
    font-family: SuperLegendBoy;
    text-align: center;
    font-size: 18px;
  }

  .redtext {
    color: red;
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

  .button8 {
    color: white;
    background-color: #353839;
    border: 2px solid white;
  }
  .button8:hover {
    background-color: white;
    color: #353839;
  }

  .label1 {
    padding: 150px -100px;
  }

  .label2 {
    padding: 150px 150px;
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
    color: #ffffff;
  }

  input:focus {
    color: white;
  }

  .usernameExists {
    font-family: SuperLegendBoy;
    height: auto;
    width: 50%;
    padding: 15px 0px;
    text-align: center;
    border: 2px solid red;
    background-color: #353839;
    font-size: 22px;
    margin: 10px 0px;
    color: #ffffff;
  }

  usernameExists:focus {
    color: white;
  }

  .input1 {
    font-family: SuperLegendBoy;
    height: auto;
    width: 50%;
    padding: 15px 0px;
    text-align: center;
    background-color: #353839;
    font-size: 22px;
    margin: 10px 0px;
    color: #ffffff;
  }

  input1:focus {
    color: white;
  }
</style>
