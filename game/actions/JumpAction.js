const mathtools = require('../mathtools');

const JumpAction = function (bug, jumpDistance, jumpSpeed) {
    this.bug = bug;
    this.maxJumpDistance = jumpDistance;
    this.jumpSpeed = jumpSpeed / 1000; // in px / ms
};

JumpAction.prototype.update = function (dt) {
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


JumpAction.prototype.stopJump = function () {
    this.isJumping = false;
    this.setSpriteTimeNormal();
};

JumpAction.prototype.jump = function () {
    this.isJumping = true;
    this.curJumpDistance = 0;
    this.timeSinceLastJump = 0;
    this.setSpriteTimeJump();
};

JumpAction.prototype.setSpriteTimeJump = function () {
    this.bug.setTimePerSprite(this.bug.calcTimePerSprite(this.jumpSpeed * 1000));
};

JumpAction.prototype.setSpriteTimeNormal = function () {
    this.bug.setTimePerSprite(this.bug.calcTimePerSprite(this.bug.speed));
};

JumpAction.prototype.shouldProcessInput = function () {
    return !this.isJumping;
};

JumpAction.prototype.shouldUpdateSprite = function () {
    return this.isJumping ? true : undefined; // undefined means "no comment, take care of it yourself"
};

module.exports = JumpAction;