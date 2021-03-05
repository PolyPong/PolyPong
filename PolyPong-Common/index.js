"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TraceBallPath = exports.Bomb = exports.CatchAndAim = exports.AddBall = exports.SplitPaddle = exports.SetBackgroundColor = exports.MakePaddleBumpy = exports.MakePaddleCurveInwards = exports.MakePaddleCurveOutwards = exports.MakeBallInvisible = exports.MakeOthersInvisible = exports.MakeSelfInvisible = exports.ShrinkPaddle = exports.ExpandedPaddle = exports.Ball = exports.Player = exports.Paddle = exports.Color = exports.Shape = exports.Game = exports.Lobby = void 0;
var Lobby = /** @class */ (function () {
    function Lobby(players, gameLink) {
        this.players = players;
        this.gameLink = gameLink;
    }
    return Lobby;
}());
exports.Lobby = Lobby;
var Game = /** @class */ (function () {
    function Game(sides) {
        this.radius = 400; // Size of the game board, determined at runtime but set to default of 400
        this.ball = new Ball();
        this.ballVisible = true;
        this.numBalls = 1;
        this.backgroundColor = Color.Grey;
        this.activePowerups = [];
        this.players = [];
        this.sides = sides;
        for (var i = 0; i < sides; i++) {
            // Note width of each paddle is set to the radius of the shape divided by the number of sides
            if (i < 1) {
                var player = new Player("", "", new Paddle(0, this.radius / this.sides, true, Shape.Regular, Color.Red), [], 0);
            }
            else {
                var player = new Player("", "", new Paddle(0, this.radius / this.sides, true, Shape.Regular, Color.White), [], 0);
            }
            //var player: Player = new Player("","",new Paddle(0,this.radius/this.sides,true,Shape.Regular,Color.White),[],0);
            this.players.push(player);
        }
    }
    return Game;
}());
exports.Game = Game;
var Shape;
(function (Shape) {
    Shape[Shape["Regular"] = 0] = "Regular";
    Shape[Shape["CurvedInwards"] = 1] = "CurvedInwards";
    Shape[Shape["CurvedOutwards"] = 2] = "CurvedOutwards";
    Shape[Shape["Bumpy"] = 3] = "Bumpy";
})(Shape = exports.Shape || (exports.Shape = {}));
var Color;
(function (Color) {
    Color["White"] = "#FFFFFF";
    Color["Red"] = "#FF0000";
    Color["Green"] = "#00FF00";
    Color["Blue"] = "#0000FF";
    Color["Grey"] = "#353839";
})(Color = exports.Color || (exports.Color = {}));
var Paddle = /** @class */ (function () {
    function Paddle(x, width, invisible, shape, paddleColor) {
        this.width = 100;
        this.paddleColor = Color.White;
        this.x = x;
        this.width = width;
        this.invisible = invisible;
        this.shape = shape;
        this.paddleColor = paddleColor;
    }
    Paddle.height = 10;
    Paddle.velocity = 10;
    return Paddle;
}());
exports.Paddle = Paddle;
var Player = /** @class */ (function () {
    function Player(username, email, paddle, inventory, xp) {
        this.username = username;
        this.email = email;
        this.paddle = paddle;
        this.inventory = inventory;
        this.xp = xp;
    }
    return Player;
}());
exports.Player = Player;
var Ball = /** @class */ (function () {
    function Ball() {
        this.x = 0;
        this.y = 0;
        this.dx = -1;
        this.dy = 2;
        this.velocity = 2;
        this.radius = 10;
    }
    return Ball;
}());
exports.Ball = Ball;
var ExpandedPaddle = /** @class */ (function () {
    function ExpandedPaddle() {
    }
    ExpandedPaddle.prototype.applyPowerup = function () {
        return;
    };
    return ExpandedPaddle;
}());
exports.ExpandedPaddle = ExpandedPaddle;
var ShrinkPaddle = /** @class */ (function () {
    function ShrinkPaddle() {
    }
    ShrinkPaddle.prototype.applyPowerup = function () {
        return;
    };
    return ShrinkPaddle;
}());
exports.ShrinkPaddle = ShrinkPaddle;
var MakeSelfInvisible = /** @class */ (function () {
    function MakeSelfInvisible() {
    }
    MakeSelfInvisible.prototype.applyPowerup = function () {
        return;
    };
    return MakeSelfInvisible;
}());
exports.MakeSelfInvisible = MakeSelfInvisible;
var MakeOthersInvisible = /** @class */ (function () {
    function MakeOthersInvisible() {
    }
    MakeOthersInvisible.prototype.applyPowerup = function () {
        return;
    };
    return MakeOthersInvisible;
}());
exports.MakeOthersInvisible = MakeOthersInvisible;
var MakeBallInvisible = /** @class */ (function () {
    function MakeBallInvisible() {
    }
    MakeBallInvisible.prototype.applyPowerup = function () {
        return;
    };
    return MakeBallInvisible;
}());
exports.MakeBallInvisible = MakeBallInvisible;
var MakePaddleCurveOutwards = /** @class */ (function () {
    function MakePaddleCurveOutwards() {
    }
    MakePaddleCurveOutwards.prototype.applyPowerup = function () {
        return;
    };
    return MakePaddleCurveOutwards;
}());
exports.MakePaddleCurveOutwards = MakePaddleCurveOutwards;
var MakePaddleCurveInwards = /** @class */ (function () {
    function MakePaddleCurveInwards() {
    }
    MakePaddleCurveInwards.prototype.applyPowerup = function () {
        return;
    };
    return MakePaddleCurveInwards;
}());
exports.MakePaddleCurveInwards = MakePaddleCurveInwards;
var MakePaddleBumpy = /** @class */ (function () {
    function MakePaddleBumpy() {
    }
    MakePaddleBumpy.prototype.applyPowerup = function () {
        return;
    };
    return MakePaddleBumpy;
}());
exports.MakePaddleBumpy = MakePaddleBumpy;
var SetBackgroundColor = /** @class */ (function () {
    function SetBackgroundColor() {
    }
    SetBackgroundColor.prototype.applyPowerup = function () {
        return;
    };
    return SetBackgroundColor;
}());
exports.SetBackgroundColor = SetBackgroundColor;
var SplitPaddle = /** @class */ (function () {
    function SplitPaddle() {
    }
    SplitPaddle.prototype.applyPowerup = function () {
        return;
    };
    return SplitPaddle;
}());
exports.SplitPaddle = SplitPaddle;
var AddBall = /** @class */ (function () {
    function AddBall() {
    }
    AddBall.prototype.applyPowerup = function () {
        return;
    };
    return AddBall;
}());
exports.AddBall = AddBall;
var CatchAndAim = /** @class */ (function () {
    function CatchAndAim() {
    }
    CatchAndAim.prototype.applyPowerup = function () {
        return;
    };
    return CatchAndAim;
}());
exports.CatchAndAim = CatchAndAim;
var Bomb = /** @class */ (function () {
    function Bomb() {
    }
    Bomb.prototype.applyPowerup = function () {
        return;
    };
    return Bomb;
}());
exports.Bomb = Bomb;
var TraceBallPath = /** @class */ (function () {
    function TraceBallPath() {
    }
    TraceBallPath.prototype.applyPowerup = function () {
        return;
    };
    return TraceBallPath;
}());
exports.TraceBallPath = TraceBallPath;
