const DrawableComponent = require('../gameConfigHandler').DrawableComponent;
const mathtools = require('../mathtools');

function Projectile (x0, v0, a, tFinal, drawProperties, damage, bug) {
    this.x0 = x0;
    this.v0 = v0;
    this.a = a;
    this.tFinal = tFinal;
    this.done = false;
    this.t = 0;

    this.drawProperties = drawProperties;

    this.bug = bug;
    this.damage = damage;
    this.x = [x0[0], x0[1]];
}
Projectile.prototype.update = function (dt) {
    if (this.done) return;
    this.t += dt;
    if (this.t >= this.tFinal) {
        this.t = this.tFinal;
        this.done = true;
    }
    this.x[0] = this.x0[0] + this.v0[0] * this.t + 0.5 * this.a[0] * this.t * this.t;
    this.x[1] = this.x0[1] + this.v0[1] * this.t + 0.5 * this.a[1] * this.t * this.t;
};
Projectile.prototype.getDrawableGameComponents = function () {
    const dc = new DrawableComponent();
    dc.x = this.x[0];
    dc.y = this.x[1];
    dc.isCircle = true;
    dc.fill         = this.drawProperties.fillColor !== undefined;
    dc.fillColor    = this.drawProperties.fillColor;
    dc.radius       = this.drawProperties.radius;
    dc.stroke       = this.drawProperties.strokeColor !== undefined;
    dc.strokeColor  = this.drawProperties.strokeColor;
    dc.lineWidth    = this.drawProperties.lineWidth;
    return [dc];
};

Projectile.prototype.getPosition = function () {
    return this.x;
};

Projectile.prototype.getDamage = function () {
    return this.damage;
};

Projectile.prototype.isDone = function () {
    return this.done;
};

Projectile.prototype.collidedWithBug = function (bug) {
    if (bug === this.bug) return false;
    return mathtools.isInside(this.getPosition(), bug.getBoundingBox());
};

module.exports = Projectile;