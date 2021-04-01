<script>
    import auth from "../authService";
	import { user, auth0Client, popupOpen, ws } from "../store";

    import {router } from "tinro";
    import type { CheckExists } from "@polypong/polypong-common";

    async function logIn() {
		user.set(await (await $auth0Client).getUser());
        auth.loginWithRedirect((await $auth0Client));  // Do not pass in null in the options field or the code will break

        testPopupOpen();
    }


    function testPopupOpen() {
        if(!$popupOpen){
            loggedInOrRegister();
        } else {
            setTimeout(testPopupOpen, 1000);
        }
    }

    async function loggedInOrRegister() {
        if (await (await $auth0Client).isAuthenticated()) {
            console.log($user.email)

            // Check if user email is in the database
            // Send over a check_exists request for the email to server and wait for response (response happens in store.ts)
            const request: CheckExists = {
                type: "check_exists",
                field: "email",
                str: $user.email,
            }
            console.log(JSON.stringify(request))
            $ws.send(JSON.stringify(request));
        } else {
            // Not authenticated
        }
    }


</script>

<body>
    <h1>PolyPong</h1>

    <hr />

    <div>
        <a href="/lobby">
            <button class="button button1">Play As Guest</button>
        </a>
    </div>
    <div>
        <a href="/signup">
            <button class="button button2">Sign Up</button>
        </a>
        <button class="button button3" on:click={logIn}>Log In</button>
    </div>

    <hr />
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
        background-color: #353839;
    }

    .button {
        font-family: SuperLegendBoy;
        border: 2px solid #ffffff;
        height: 200px;
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

    .button1 {
        width: 100%;
    }

    .button2 {
        width: 49%;
    }

    .button3 {
        width: 49%;
        float: right;
    }

    .button:hover {
        background-color: #ffffff; /* White */
        color: #353839;
    }
</style>
