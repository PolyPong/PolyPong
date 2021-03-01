import { draw } from "svelte/types/runtime/transition";

export class Lobby {
    gameLink: string;
    players: Player[];

    constructor(players: Player[], gameLink: string) {
        this.players = players;
        this.gameLink = gameLink;
    }
}

export class Game { 
    radius: number = 400; // Size of the game board, determined at runtime but set to default of 400
    sides: number;
    ballVisible: boolean = true;
    numBalls: number = 1;
    backgroundColor: string = "#353839";
    activePowerups: Powerup[] = [];
    players: Player[] = [];

    constructor(sides: number) {
            this.sides = sides;

    }


    // update(messageFromServer){  // array of updated positions for each players, optional array of powers ups, what kind of powerups and initiated by who, optional event of this player died (or something)
    //     paddles[playerX].update(messageFromServer.powerup)
    // }
}

export enum Shape {
    Regular = 0,
    CurvedInwards,
    CurvedOutwards,
    Bumpy
}

export enum Color {
    White,
    Red,
    Green,
    Blue
}

export class Paddle {
    // Need to remove static keyword later because each player will need their own width (for expand and shrink paddle)
    static width: number = 100;
    static readonly height: number = 10;
    x: number;
    y: number;
    length: number;
    angle: number;
    invisible: boolean;
    shape: Shape;
    paddleColor: string = "#FFFFFF";

    constructor(
        x: number,
        y: number,
        length: number,
        angle: number,
        invisible: boolean,
        shape: Shape,
        paddleColor: Color) {
            this.x = x;
            this.y = y;
            this.length = length;
            this.angle = angle;
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

    constructor(
        username: string,
        email: string,
        paddle: Paddle,
        inventory: Powerup[],
        xp: number) {
            this.username = username;
            this.email = email;
            this.paddle = paddle;
            this.inventory = inventory;
            this.xp = xp;
    }

    // Does a player contain a paddle? Does skin/paddle color belong to player or to paddle?
    // Answer: Skin color currently belongs to the paddle
    // misc. stats (win/loss, games won, etc.)
}

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