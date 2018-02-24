const BugBase = require('./bugBase');
const JumpAttack = require('../attacks/jumpAttack');

function BugSpider (player) {
    BugBase.call(this, player);


}

BugSpider.prototype = Object.create(BugBase.prototype, {
    update: {
        value: function (dt) {
            BugBase.prototype.update.call(this, dt);
            // my update code

        },
        enumerable: true,
        configurable: true,
        writable: true
    }
});

BugSpider.prototype.getDefaultAttack = function () {
    const jumpDist = 300;
    const jumpSpeed = this.speed * 4;
    return new JumpAttack(this, jumpDist, jumpSpeed, this.damage, this.reloadTime);
};


module.exports = BugSpider;