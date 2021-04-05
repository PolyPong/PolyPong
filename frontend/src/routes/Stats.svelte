<body>
  <h1>PolyPong</h1>
  <hr />
  <table class="center" width="100%">
    <tr height="50px">
      <td style="text-align:left">Games Played: 70</td>
      <td style="text-align:left">Win/Loss Ratio: 0.88</td>
    </tr>

    <tr height="50px">
      <td style="text-align:left">Games Won: 62</td>
      <td style="text-align:left">XP Level: 22</td>
    </tr>
  </table>

  <a href="/leaderboard">
    <button class="button button4 center">Global Leaderboard</button>
  </a>

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
    text-align: left;
    color: white;
    background-color: #353839;
  }

  table {
    font-family: SuperLegendBoy;
    border-spacing: 50px 0;
    font-size: 22px;
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

  .button:hover {
    background-color: #ffffff; /* White */
    color: #353839;
  }

  .button4 {
    width: 80%;
    margin-left: auto;
    margin-right: auto;
  }

  .center {
    display: flex;
    justify-content: center;
    align-items: center;
  }
</style>
