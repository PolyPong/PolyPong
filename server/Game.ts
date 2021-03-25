import {
  Ball,
  Color,
  Paddle,
  Player,
  Powerup,
  Shape,
} from "../PolyPong-Common/src/Game.ts";

import {ServerSaysGameStarted} from '../PolyPong-Common/src/Payload.ts'
import {GameClient} from '../PolyPong-Common/src/Game.ts'

export class Game {
  radius: number = 400; // Size of the game board, determined at runtime but set to default of 400
  sides: number;
  ball: Ball = new Ball();
  ballVisible: boolean = true;
  numBalls: number = 1;
  backgroundColor: Color = Color.Grey;
  activePowerups: Powerup[] = [];
  players: Player[] = [];

  constructor(userlist: Map<string, WebSocket>) {
    this.sides = userlist.size;

    for (const [user_id, ws] of userlist.entries()) {
      const player = new Player(
        user_id,
        "",
        new Paddle(
          0,
          this.radius / this.sides,
          true,
          Shape.Regular,
          Color.White,
        ),
        [],
        0,
        ws,
      );
      this.players.push(player);
    }

    for (const player of this.players){
        const payload: ServerSaysGameStarted = {
            type: "game_started",
            sides: this.sides,
            your_player_number: this.players.indexOf(player),
        }
        player.websocketConnection!.send(JSON.stringify(payload));
    }

  }

  mergeState(game: GameClient, player_number: number){
    this.players[player_number] = game.players[player_number];
  }

  // update(messageFromServer){  // array of updated positions for each players, optional array of powers ups, what kind of powerups and initiated by who, optional event of this player died (or something)
  //     paddles[playerX].update(messageFromServer.powerup)
  // }
}
