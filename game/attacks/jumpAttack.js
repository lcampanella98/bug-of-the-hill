const Attack = require('./attackBase');
const mathtools = require('../mathtools');

function JumpAttack (bug, jumpDistance, jumpSpeed, damage, reloadTime) {
    Attack.call(this, bug);

    this.maxJumpDistance = jumpDistance;
    this.damage = damage;
    this.rechargeTime = reloadTime;
    this.timeSinceLastJump = reloadTime + 1;
    this.jumpSpeed = jumpSpeed / 1000; // in px / ms

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

    if (this.isJumping) {

        if (this.curJumpDistance > this.maxJumpDistance) {
            this.stopJump();
        } else {
            const dist = this.jumpSpeed * dt;
            const deltaX = [dist * Math.cos(this.bug.a), dist * Math.sin(this.bug.a)];
            const newPos = mathtools.addVectors(deltaX, this.bug.getPosition());
            this.bug.setPosition(newPos[0], newPos[1]);
            this.curJumpDistance += dist;
            const players = this.bug.gameWorld.players;
            for (let i = 0; i < players.length; ++i) {
		if (!players[i].hasLiveBug()) continue;
                if (this.isCollidingWithBug(players[i].bug)) {
                    players[i].bug.giveDamage(this.damage);
                    this.stopJump();
                }
            }
        }
    }
};

JumpAttack.prototype.shouldProcessInput = function () {
    return !this.isJumping;
};

JumpAttack.prototype.shouldUpdateSprite = function () {
    return this.isJumping ? true : undefined; // undefined means "no comment, take care of it yourself"
};


JumpAttack.prototype.setSpriteTimeJump = function () {
    this.bug.setTimePerSprite(this.bug.calcTimePerSprite(this.jumpSpeed * 1000));
};

JumpAttack.prototype.setSpriteTimeNormal = function () {
    this.bug.setTimePerSprite(this.bug.calcTimePerSprite(this.bug.speed));
};

JumpAttack.prototype.attack = function () {
    if (!this.isRecharging()) {
        this.jump();
    }
};

JumpAttack.prototype.stopJump = function () {
    this.isJumping = false;
    this.setSpriteTimeNormal();
};

JumpAttack.prototype.jump = function () {
    this.isJumping = true;
    this.curJumpDistance = 0;
    this.timeSinceLastJump = 0;
    this.setSpriteTimeJump();
};

JumpAttack.prototype.getDrawableGameComponents = function () {
    return [];
};

JumpAttack.prototype.isCollidingWithBug = function (bug) {
    if (this.bug === bug) return false;
    return mathtools.isInside(this.bug.getPosition(), bug.getBoundingBox());
};

module.exports = JumpAttack;
