import App from "./App.svelte";


// FR1 User Login
// FR2 User Registration
// FR3 Create Game
// FR4 Share Link
// FR5 Join Game
// FR6 Play Game
// FR7 Earn XP
// FR8 Local Leaderboard
// FR9 Global Leaderboard
// FR10 User statistics
// FR11 Power Ups
// FR12 Expanded Paddle
// FR13 Shrink Paddle
// FR14 Self Invisible Paddle
// FR15 Others Invisible Paddle
// FR16 Invisible Ball
// FR17 Self Curved Outwards Paddle
// FR18 Self Curved Inwards Paddle
// FR19 Self Bumpy Paddle
// FR20 Distracting Background
// FR23 Add Ball
// FR26 Path Trace
// FR27 Earn Skin
// FR28 Select skin
var app = new App({
  target: document.body,
});

export default app;

// Hot Module Replacement (HMR) - Remove this snippet to remove HMR.
// Learn more: https://www.snowpack.dev/concepts/hot-module-replacement
if (import.meta.hot) {
  import.meta.hot.accept();
  import.meta.hot.dispose(() => {
    app.$destroy();
  });
}
