const BugBase = require('./bugBase');
const ProjectileAttack = require('../attacks/projectileAttack');

function Ant(player) {
    BugBase.call(this, player);
}

Ant.prototype = Object.create(BugBase.prototype, {
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

Ant.prototype.getDefaultAttack = function () {
    const projectileTravelDistance = 280;
    const projectileTravelSpeed = this.speed * 2;
    const drawProperties = {
        fillColor: 'green',
        radius: 6,
        strokeColor: 'black',
        lineWidth: 2
    };

    return new ProjectileAttack(this, this.damage, this.reloadTime, projectileTravelDistance, projectileTravelSpeed, drawProperties);
};

module.exports = Ant;