const ProjectileAttack = require('./projectileAttack');

function HillAttack(bug) {
    const damage = 99999;
    const reloadTime = 800;
    const maxTravelDistance = 450;
    const speed = 1000;
    const drawProperties = {
        fillColor: 'red',
        radius: 8,
        strokeColor: 'black',
        lineWidth: 2
    };
    ProjectileAttack.call(this, bug, damage, reloadTime, maxTravelDistance, speed, drawProperties);
}

HillAttack.prototype = Object.create(ProjectileAttack.prototype);

HillAttack.prototype.attack = function () {
    if (this.canAttack()) {
        const tur1 = this.bug.gameWorld.turretFront;
        const tur2 = this.bug.gameWorld.turretRear;
        this.fireProjectile([tur1.x, tur1.y], tur1.a);
        this.fireProjectile([tur2.x, tur2.y], tur2.a);
    }
};

module.exports = HillAttack;