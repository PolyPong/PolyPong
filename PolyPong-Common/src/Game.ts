export class Lobby {
  gameLink: string;
  players: Player[];

  constructor(players: Player[], gameLink: string) {
    this.players = players;
    this.gameLink = gameLink;
  }
}

export abstract class Game {
  radius: number = 400; // Size of the game board, determined at runtime but set to default of 400
  sides: number = 0;
  // hey Michael, I commented this out because
  //index.ts:14:5 - error TS2564: Property 'sideLength' has no initializer and is not definitely assigned in the constructor.
  ball: Ball = new Ball();
  ballVisible: boolean = true;
  numBalls: number = 1;
  backgroundColor: Color = Color.Grey;
  activePowerups: Powerup[] = [];
  players: Player[] = [];
  // player_number: number;

  // constructor(sides: number, player_number: number) {
  abstract mergeState(game: Game, player_number: number, message: ClientUpdateMessage): void;
  
  jsonify() {
    const { ball, activePowerups, players } = this;
    for (const p of players) {
      p.websocketConnection = null;
    }
    return {
      ball,
      activePowerups,
      players
    }
  }
}

export enum Shape {
  Regular = 0,
  CurvedInwards,
  CurvedOutwards,
  Bumpy,
}

// base16 chalk
export enum Color {
  DarkDarkGrey = "#303030", // more like a grey, so it's still visible
  White = "#f5f5f5",
  Black = "#151515",
  Pink = "#fb9fb1",
  Green = "#acc267"
  Yellow = "#ddb26f",
  Blue = "#6fc2ef",
  Purple = "#e1a3ee",
  Teal = "#12cfc0",
  Grey = "#d0d0d0",
  DarkGrey = "#505050",
}

export class Paddle {
  width: number = 100;
  static readonly height: number = 10;

  static velocity: number = 10;

  x: number;
  invisible: boolean;
  shape: Shape;
  paddleColor: Color = Color.White;

  constructor(
    x: number,
    width: number,
    invisible: boolean,
    shape: Shape,
    paddleColor: Color,
  ) {
    this.x = x;
    this.width = width;
    this.invisible = invisible;
    this.shape = shape;
    this.paddleColor = paddleColor;
  }
}

export class Player {
  username: string;
  email: string;
  paddle: Paddle;
  inventory: Powerup[];
  xp: number;
  websocketConnection: WebSocket | null;

  constructor(
    username: string,
    email: string,
    paddle: Paddle,
    inventory: Powerup[],
    xp: number,
    websocketConnection: WebSocket | null,
  ) {
    this.username = username;
    this.email = email;
    this.paddle = paddle;
    this.inventory = inventory;
    this.xp = xp;
    this.websocketConnection = websocketConnection;
  }

  // Does a player contain a paddle? Does skin/paddle color belong to player or to paddle?
  // Answer: Skin color currently belongs to the paddle
  // misc. stats (win/loss, games won, etc.)
}


const getRandom = (min: number, max: number) => Math.random() * (max - min) + min;

export class Ball {
  x: number = 0;
  y: number = 0;
  dx: number;
  dy: number;

  velocity: number = 2;

  radius: number = 10;

  constructor(){
    this.dx = getRandom(-1, 1);
    this.dy = getRandom(-1, 1);
  }
}

// Note: Powerups may be better implemented as functions in the paddle or ball or player classes instead
// How would we apply powerups using this structure? Probably by passing the game instance and the player number to applyPowerup(),
// so like ExpandedPaddle.applyPowerup(game, playerNumber)

// Instead, we could just have expandPaddle() as a function of Paddle, and when player i wants to use the powerup, it would look like:
// game.players[i].paddle.expand();

// Or, could make powerups a method of players (since players have powerups, but this is a bit of a sketchy abstraction)
// Then it would look like:
// game.player[i].expand();

// Some different options to consider!
export interface Powerup {
  applyPowerup(): void;
}

export class ExpandedPaddle implements Powerup {
  applyPowerup() {
    return;
  }
}

export class ShrinkPaddle implements Powerup {
  applyPowerup() {
    return;
  }
}

export class MakeSelfInvisible implements Powerup {
  applyPowerup() {
    return;
  }
}

export class MakeOthersInvisible implements Powerup {
  applyPowerup() {
    return;
  }
}

export class MakeBallInvisible implements Powerup {
  applyPowerup() {
    return;
  }
}

export class MakePaddleCurveOutwards implements Powerup {
  applyPowerup() {
    return;
  }
}

export class MakePaddleCurveInwards implements Powerup {
  applyPowerup() {
    return;
  }
}

export class MakePaddleBumpy implements Powerup {
  applyPowerup() {
    return;
  }
}

export class SetBackgroundColor implements Powerup {
  applyPowerup() {
    return;
  }
}

export class SplitPaddle implements Powerup {
  applyPowerup() {
    return;
  }
}

export class AddBall implements Powerup {
  applyPowerup() {
    return;
  }
}

export class CatchAndAim implements Powerup {
  applyPowerup() {
    return;
  }
}

export class Bomb implements Powerup {
  applyPowerup() {
    return;
  }
}

export class TraceBallPath implements Powerup {
  applyPowerup() {
    return;
  }
}

export interface CheckExists {
  type: "check_exists";
  field: string;
  str: string;
}

export interface ServerExistsResponse {
  type: "check_exists";
  field: string;
  str: string;
  exists: boolean;
}

export interface CreateUser {
  type: "create_user";
  username: string;
  email: boolean;
}

export interface LobbyJoinedPayload {
  type: "lobby_joined_info";
  user_id: string;
}

export interface JoinGamePayload {
  type: "join_game";
  lobby_id: string;
  user_id: string;
}

export interface LobbyCreatedPayload {
  type: "lobby_created";
  lobby_id: string;
}

export interface SomeoneElseJoined {
  type: "join_success";
  user_id: string;
  lobby_id: string;
}

export interface ErrorPayload {
  type: "error";
  message: string;
}

export interface CreateLobbyRequest {
  type: "create_lobby";
}

export interface StartGameRequest {
  type: "start_game";
  lobby_id: string;
}

export interface ServerSaysGameStarted {
  type: "game_started";
  sides: number;
  your_player_number: number;
}

type ServerEvent =
  | ErrorPayload
  | LobbyJoinedPayload
  | SomeoneElseJoined
  | LobbyCreatedPayload
  | ServerUpdate
type ClientAction =
  | JoinGamePayload
  | CreateLobbyRequest
  | ClientUpdate
  | ClientReady

export type { ClientAction, ServerEvent };

export interface ClientUpdate {
  type: "client_update";
  player_id: string;
  player_number: number;
  lobby_id: string;
  event: Game;
  message: ClientUpdateMessage
}

export type ClientUpdateMessage = "paddle_movement" | "ball_update"| "i_died" | undefined;

export interface ServerUpdate {
  type: "server_update";
  event: Game;
  player_number: number | undefined;
  message: "game_start" | undefined;
}

export interface ClientReady {
  type: "client_ready";
  lobby_id: string;
}

