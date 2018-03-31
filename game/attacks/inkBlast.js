const Projectile = require('./projectile');


const INK_SPEED = 100 / 1000; // in pix / ms
const INK_TIME_LASTING = 1000;
const INK_BALL_PERIOD = 200;
const NUM_INK_BALL_ROUNDS = Math.trunc(INK_TIME_LASTING / INK_BALL_PERIOD);
const NUM_INK_BALLS_RADIAL = 16;
const INITIAL_INK_BALL_RADIUS = 16; // radius of largest ink balls that will be drawn on screen, in pixels


const InkBlast = function (bug, maxRadius, damage) {
    this.bug = bug;
    this.maxInkRadius = maxRadius;
    this.damage = damage;
};

InkBlast.prototype.update = function (dt) {
    this.totalInkTimeLeft -= dt;
    if (this.totalInkTimeLeft <= 0) {
        this.isInking = false;
    }

    if (this.isInking) {
        if (this.currentInkRadius < this.maxInkRadius) {
            this.currentInkRadius += INK_SPEED * dt;
            if (this.currentInkRadius > this.maxInkRadius) this.currentInkRadius = this.maxInkRadius;
        }

        if (this.numInkBallsLeft > 0) {
            this.timeUntilNextInkBall -= dt;
            if (this.timeUntilNextInkBall <= 0) {
                this.fireInkBalls();
                this.timeUntilNextInkBall = INK_BALL_PERIOD;
                this.numInkBallsLeft--;
            }
        }
    }

    if (this.isInking) { // check players for inking
        const players = this.bug.gameWorld.players;
        for (let i = 0; i < players.length; ++i) {
            this.checkPlayerForInking(players[i]);
        }
    }
};


InkBlast.prototype.fireInkBalls = function () {
    let ballRadius = INITIAL_INK_BALL_RADIUS * (this.numInkBallsLeft / NUM_INK_BALL_ROUNDS);
    let deltaA = 2 * Math.PI / NUM_INK_BALLS_RADIAL;
    let tFinal = this.maxInkRadius / INK_SPEED;
    let angle = 0;
    let drawProperties = {
        radius: ballRadius,
        fill: true,
        fillColor: 'black'
    };
    let v;
    for (let i = 0; i < NUM_INK_BALLS_RADIAL; ++i) {
        v = [INK_SPEED * Math.cos(angle), INK_SPEED * Math.sin(angle)];
        this.bug.gameWorld.addProjectile(new Projectile([this.x0, this.y0], v, [0, 0], tFinal, drawProperties, this.bug));
        angle += deltaA;
    }
};

InkBlast.prototype.fireInk = function () {
    this.isInking = true;
    this.currentInkRadius = 0;
    this.inkedPlayers = [];
    this.timeUntilNextInkBall = 0;
    this.numInkBallsLeft = NUM_INK_BALL_ROUNDS;
    this.x0 = Number(this.bug.x);
    this.y0 = Number(this.bug.y);
    this.totalInkTimeLeft = INK_TIME_LASTING + this.maxInkRadius / INK_SPEED;
};

InkBlast.prototype.checkPlayerForInking = function (player) {
    if (!player.hasLiveBug()) return;
    const bug = player.bug;
    if (bug === this.bug) return;
    let playerAlreadyInked = false;
    for (let i = 0; i < this.inkedPlayers.length; ++i) {
        if (this.inkedPlayers[i] === player) {
            playerAlreadyInked = true;
            break;
        }
    }
    if (!playerAlreadyInked) {
        // ink the player if they are within the inking radius
        let dist = this.getDistFromInkLocation(player);
        if (dist <= this.currentInkRadius) { // they have been inked
            bug.giveDamage(this.damage);
            this.inkedPlayers.push(player);
        }
    }
};

InkBlast.prototype.getDistFromInkLocation = function (player) {
    const bug = player.getBug();
    return Math.hypot(this.x0 - bug.x, this.y0 - bug.y);
};

InkBlast.prototype.getDrawableGameComponents = function () {
    return [];
};

module.exports = InkBlast;