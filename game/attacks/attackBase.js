function Attack (bug) {
    this.bug = bug;
}

Attack.prototype.shouldProcessInput = function () {
    return true;
};

Attack.prototype.shouldUpdateSprite = function () {
    return undefined;
};

// Attack.prototype.canAttack = function ()

// Attack.prototype.update = function (dt)

// Attack.prototype.attack = function ()

// Attack.prototype.getDrawableComponents = function ()

module.exports = Attack;