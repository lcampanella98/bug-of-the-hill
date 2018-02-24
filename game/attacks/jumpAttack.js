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
        }
    }
};

JumpAttack.prototype.shouldProcessInput = function () {
    return !this.isJumping;
};

JumpAttack.prototype.shouldUpdateSprite = function () {
    return this.isJumping ? true : undefined; // undefined means "no comment, I have nothing to say"
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

module.exports = JumpAttack;