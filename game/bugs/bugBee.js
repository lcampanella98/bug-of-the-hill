const BugBase = require('./bugBase');
const gameConfig = require('../gameConfigHandler');
const DrawableComponent = gameConfig.DrawableComponent;
const WaspPoisonAttack = require('../attacks/waspPoisonAttack');

function Bee (player) {
    BugBase.call(this, player);
}

Bee.prototype = Object.create(BugBase.prototype);

Bee.prototype.getDefaultAttack = function () {
    let damage = this.damage;
    let reloadTime = this.reloadTime;
    return new WaspPoisonAttack(this, damage, reloadTime);
};

module.exports = Bee;