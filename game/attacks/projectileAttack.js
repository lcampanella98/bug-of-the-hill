const Attack = require('./attackBase');
const mathtools = require('../mathtools');
const Projectile = require('./projectile');

function ProjectileAttack (bug, damage, reloadTime, maxTravelDistance, speed, drawProperties) {
    Attack.call(this, bug);

    this.damage = damage;
    this.reloadTime = reloadTime;
    this.timeSinceLastFire = 0;
    this.maxTravelDistance = maxTravelDistance;

    this.drawProperties = drawProperties;

    this.magSpeed = speed;
    this.magAcceleration = 0;

    this.arrProjectiles = [];
}

ProjectileAttack.prototype = Object.create(Attack.prototype);

ProjectileAttack.prototype.update = function (dt) {
    if (this.isReloading()) {
        this.timeSinceLastFire += dt;
    }
};

ProjectileAttack.prototype.isReloading = function () {
    return this.timeSinceLastFire < this.reloadTime;
};

ProjectileAttack.prototype.canAttack = function () {
    return !this.isReloading();
};

ProjectileAttack.prototype.attack = function () {
    const x0 = [this.bug.x, this.bug.y];
    this.fireProjectile(x0, this.bug.a);
};

ProjectileAttack.prototype.fireProjectile = function (x0, angleTrajectoryRadians) {
    const dirVector = [Math.cos(angleTrajectoryRadians), Math.sin(angleTrajectoryRadians)];
    const v0 = mathtools.scaleVector(dirVector, this.magSpeed);
    let a;
    if (this.magAcceleration === 0) {
        a = [0, 0];
    } else {
        a = mathtools.scaleVector(v0, this.magAcceleration / this.magSpeed);
    }
    let tFinal;
    if (this.magAcceleration === 0) {
        tFinal = this.maxTravelDistance / this.magSpeed;
    } else {
        const normV0Squared = this.magSpeed * this.magSpeed;
        tFinal = (Math.sqrt(normV0Squared * normV0Squared + 2 * this.magAcceleration * this.maxTravelDistance) - normV0Squared) / (2 * this.magAcceleration);
    }
    this.arrProjectiles.push(new Projectile(x0, v0, a, tFinal, this.drawProperties));

    this.timeSinceLastFire = 0;
};

ProjectileAttack.prototype.getDrawableGameComponents = function () {
    return [];
};

module.exports = ProjectileAttack;
