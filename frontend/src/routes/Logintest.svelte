<script>
    import { onMount } from "svelte";
    import auth from "../authService";
    import { isAuthenticated, user } from "../store";

    let auth0Client: any;

    onMount(async () => {
        auth0Client = await auth.createClient();

        isAuthenticated.set(await auth0Client.isAuthenticated());
        user.set(await auth0Client.getUser());
    });

    function login() {
        auth.loginWithPopup(auth0Client, null);
    }

    function logout() {
        auth.logout(auth0Client);
    }
    console.log(user.name);
</script>

<main>
    <!-- App Bar -->
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
        <a class="navbar-brand" href="/#">Task Manager</a>
        <button
            class="navbar-toggler"
            type="button"
            data-toggle="collapse"
            data-target="#navbarText"
            aria-controls="navbarText"
            aria-expanded="false"
            aria-label="Toggle navigation"
        >
            <span class="navbar-toggler-icon" />
        </button>
        <div class="collapse navbar-collapse" id="navbarText">
            <div class="navbar-nav mr-auto user-details">
                {#if $isAuthenticated}
                    <span class="text-white"
                        >&nbsp;&nbsp;{$user.name} ({$user.email})</span
                    >
                {:else}<span>&nbsp;</span>{/if}
            </div>
            <span class="navbar-text">
                <ul class="navbar-nav float-right">
                    {#if $isAuthenticated}
                        <li class="nav-item">
                            <a class="nav-link" on:click={logout}>Log Out</a>
                        </li>
                    {:else}
                        <li class="nav-item">
                            <a class="nav-link" on:click={login}>Log In</a>
                        </li>
                    {/if}
                </ul>
            </span>
        </div>
    </nav>

    <!-- Application -->
    {#if !$isAuthenticated}
        <div class="container mt-5">
            <div class="row">
                <div class="col-md-10 offset-md-1">
                    <div class="jumbotron">
                        <h1 class="display-4">Task Management made Easy!</h1>
                        <p class="lead">Instructions</p>
                        <ul>
                            <li>Login to start &#128272;</li>
                            <li>Create Tasks &#128221;</li>
                            <li>Tick off completed tasks &#9989;</li>
                        </ul>
                        <a
                            class="btn btn-primary btn-lg mr-auto ml-auto"
                            role="button"
                            on:click={login}>Log In</a
                        >
                    </div>
                </div>
            </div>
        </div>
    {:else}
        <div class="container" id="main-application">
            <p>you're logged in I guess</p>
            <p>{JSON.stringify(user)}</p>
        </div>
    {/if}
</main>
