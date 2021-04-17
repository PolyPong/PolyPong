<!-- This file is used for FR1 User Login and FR2 User Registration -->

<script>
  import { onMount } from "svelte";
  import { router } from "tinro";

  import { auth0Client, user } from "../store";
  onMount(async () => {
    const redirectResult = await (await $auth0Client).handleRedirectCallback();
    console.log(redirectResult);
    //logged in. you can get the user profile like this:
    $user = await (await $auth0Client).getUser();
    console.log($user);
    router.goto("/");
  });
</script>

<body>
  <div>One sec!! We're bringing you back....</div>
  <button href="/">In case that didn't work, click me to go home</button>
</body>
