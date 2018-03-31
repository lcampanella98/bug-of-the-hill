const Attack = require('./attackBase');
const JumpAction = require('../actions/JumpAction');
const InkBlast = require('./inkBlast');

const InkAttack = function (bug, maxRadius, damage, reloadTime, jumpSpeed, jumpDistance) {
    Attack.call(this, bug);

    this.jump = new JumpAction(bug, jumpDistance, jumpSpeed);

    this.maxInkRadius = maxRadius;
    this.damage = damage;
    this.rechargeTime = reloadTime;
    this.timeSinceLastAttack = reloadTime + 1;

    this.inkBlasts = [];

};

InkAttack.prototype = Object.create(Attack.prototype);

InkAttack.prototype.update = function (dt) {
    if (this.isRecharging()) {
        this.timeSinceLastAttack += dt;
    }

    this.jump.update(dt);

    for (let i = 0; i < this.inkBlasts.length; ++i) {
        this.inkBlasts[i].update(dt);
    }

    if (this.inkBlasts.length > 0) {
        // remove inkblast if it is finished.
        // need only check first one
        if (!this.inkBlasts[0].isInking) this.inkBlasts.shift();
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

InkAttack.prototype.inkBlast = function () {
    let blast = new InkBlast(this.bug, this.maxInkRadius, this.damage);
    blast.fireInk();
    this.inkBlasts.push(blast);

};

InkAttack.prototype.attack = function () {
    if (this.canAttack()) {
        // jump
        this.jump.jump();

        // start inking
        this.inkBlast();
        this.timeSinceLastAttack = 0;
    }
};

module.exports = InkAttack;