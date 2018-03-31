const Attack = require('./attackBase');
const JumpAction = require('../actions/JumpAction');
const Projectile = require('./projectile');

const InkAttack = function (bug, maxRadius, damage, reloadTime, jumpSpeed, jumpDistance) {
    Attack.call(this, bug);

    this.jump = new JumpAction(bug, jumpDistance, jumpSpeed);

    this.maxInkRadius = maxRadius;
    this.damage = damage;
    this.rechargeTime = reloadTime;
    this.timeSinceLastAttack = reloadTime + 1;
    this.INK_SPEED = 800;
    this.INK_TIME_LASTING = 1000;
    this.INK_BALL_PERIOD = 200;
    this.NUM_INK_BALL_ROUNDS = Math.trunc(this.INK_TIME_LASTING / this.INK_BALL_PERIOD);
    this.NUM_INK_BALLS_RADIAL = 10;
    this.initialInkBallRadius = 20; // radius of largest ink balls that will be drawn on screen, in pixels
    this.x0 = this.bug.x;
    this.y0 = this.bug.y;

};

InkAttack.prototype = Object.create(Attack.prototype);

InkAttack.prototype.update = function (dt) {
    if (this.isRecharging()) {
        this.timeSinceLastAttack += dt;
    }

    this.jump.update(dt);

    if (this.isInking) {
        if (this.currentInkRadius < this.maxInkRadius) {
            this.currentInkRadius += this.INK_SPEED / dt;
            if (this.currentInkRadius > this.maxInkRadius) this.currentInkRadius = this.maxInkRadius;
        }

        if (this.numInkBallsLeft > 0) {
            this.timeUntilNextInkBall -= dt;
            if (this.timeUntilNextInkBall <= 0) {
                this.fireInkBalls();
                this.timeUntilNextInkBall = this.INK_BALL_PERIOD;
                this.numInkBallsLeft--;
            }
        }
    }

};

InkAttack.prototype.shouldProcessInput = function () {
    return this.jump.shouldProcessInput();
};

InkAttack.prototype.shouldUpdateSprite = function () {
    return this.jump.shouldUpdateSprite();
};

InkAttack.prototype.getDrawableGameComponents = function () {
    return [];
};

InkAttack.prototype.isRecharging = function () {
    return this.timeSinceLastAttack < this.rechargeTime;
};

InkAttack.prototype.canAttack = function () {
    return !this.isRecharging();
};

InkAttack.prototype.fireInkBalls = function () {
    let ballRadius = this.maxInkRadius * (this.numInkBallsLeft / this.NUM_INK_BALL_ROUNDS);
    let deltaA = 2 * Math.PI / this.NUM_INK_BALLS_RADIAL;
    let tFinal = this.maxInkRadius / this.INK_SPEED;
    let angle = 0;
    let drawProperties = {
        radius: ballRadius,
        fill: true,
        fillColor: 'black'
    };
    for (let i = 0; i < this.NUM_INK_BALLS_RADIAL; ++i) {
        let v = [this.INK_SPEED * Math.cos(angle), this.INK_SPEED * Math.sin(angle)];
        this.bug.gameWorld.addProjectile(new Projectile([this.x0, this.y0], v, 0, tFinal, drawProperties, this.bug));
        angle += deltaA;
    }
};

InkAttack.prototype.fireInk = function () {
    this.isInking = true;
    this.currentInkRadius = 0;
    this.inkedPlayers = [];
    this.timeUntilNextInkBall = 0;
    this.numInkBallsLeft = this.NUM_INK_BALL_ROUNDS;

};

InkAttack.prototype.checkPlayerForInking = function (player) {
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

InkAttack.prototype.getDistFromInkLocation = function (player) {
    const bug = player.getBug();
    return Math.hypot(this.x0 - bug.x, this.y0 - bug.y);
};

InkAttack.prototype.attack = function () {
    if (this.canAttack()) {
        // jump
        this.jump.jump();

        // start inking
        this.fireInk();
        this.timeSinceLastAttack = 0;
    }
};

module.exports = InkAttack;