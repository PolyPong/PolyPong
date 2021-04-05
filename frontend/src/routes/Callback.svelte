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

<div>One sec!! We're bringing you back....</div>
