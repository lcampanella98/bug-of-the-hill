const Attack = require('./attackBase');
const JumpAction = require('../actions/JumpAction');
const mathtools = require('../mathtools');

function JumpAttack (bug, jumpDistance, jumpSpeed, damage, reloadTime) {
    Attack.call(this, bug);

    this.damage = damage;
    this.rechargeTime = reloadTime;
    this.timeSinceLastJump = reloadTime + 1;

    this.jump = new JumpAction(bug, jumpDistance, jumpSpeed);
}

JumpAttack.prototype = Object.create(Attack.prototype);

JumpAttack.prototype.isRecharging = function () {
    return this.timeSinceLastJump < this.rechargeTime;
};

JumpAttack.prototype.canAttack = function () {
    return !this.isRecharging()
};

JumpAttack.prototype.update = function (dt) {
    if (this.isRecharging()) {
        this.timeSinceLastJump += dt;
    }

    this.jump.update(dt);

    if (this.isJumping) {
        const players = this.bug.gameWorld.players;
        for (let i = 0; i < players.length; ++i) {
            if (!players[i].hasLiveBug()) continue;
            if (this.isCollidingWithBug(players[i].bug)) {
                players[i].bug.giveDamage(this.damage);
                this.jump.stopJump();
            }
        }
    }
};

JumpAttack.prototype.attack = function () {
    if (!this.isRecharging()) {
        this.jump.jump();
    }
};

JumpAttack.prototype.shouldProcessInput = function () {
    return this.jump.shouldProcessInput();
};

JumpAttack.prototype.shouldUpdateSprite = function () {
    return this.jump.shouldUpdateSprite();
};

JumpAttack.prototype.getDrawableGameComponents = function () {
    return [];
};

JumpAttack.prototype.isCollidingWithBug = function (bug) {
    if (this.bug === bug) return false;
    return mathtools.isInside(this.bug.getPosition(), bug.getBoundingBox());
};

module.exports = JumpAttack;
