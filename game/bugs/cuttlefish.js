const BugBase = require('./bugBase');
const InkAttack = require('../attacks/inkAttack');

const Cuttlefish = function (player) {
    BugBase.call(this, player);
};

Cuttlefish.prototype = Object.create(BugBase.prototype);

Cuttlefish.prototype.getDefaultAttack = function () {
    let damage = this.damage;
    let reloadTime = this.reloadTime;
    const maxInkRadius = 200;
    const jumpSpeed = this.speed * 5;
    const jumpDistance = 300;
    return new InkAttack(this, maxInkRadius, damage, reloadTime, jumpSpeed, jumpDistance);
};

module.exports = Cuttlefish;