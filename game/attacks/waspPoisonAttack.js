const gameConfig = require('../gameConfigHandler');
const DrawableComponent = gameConfig.DrawableComponent;

const ProjectileAttack = require('./projectileAttack');

const TRANSITION_TIME = 400;

function WaspPoisonAttack (bug, damage, reloadtime) {
    let maxTravelDist = 200;
    let speed = 500;
    const drawProperties = {
        fillColor: 'purple',
        radius: 5,
        strokeColor: 'black',
        lineWidth: 1
    };
    ProjectileAttack.call(this, bug, damage, reloadtime, maxTravelDist, speed, drawProperties);
    this.numProjectilesInSuccession = 3;
    this.timeBetweenSuccessiveFires = 100;

    this.isTransitioningIntoFire = false;
    this.isFiring = false;
    this.isTransitioningOutOfFire = false;

    this.projectileQueue = [];
    this.waspSprites = gameConfig.spritesByBug['wasp'];
    this.spriteIdx = 0;
}

WaspPoisonAttack.prototype = Object.create(ProjectileAttack.prototype, {
    update: {
            value: function (dt) {
                ProjectileAttack.prototype.update.call(this, dt);

                // my update code
                if (this.isTransitioningIntoFire) {
                    if ((this.t += dt) > TRANSITION_TIME) this.t = TRANSITION_TIME;
                    const done = this.t >= TRANSITION_TIME;

                    this.spriteIdx = Math.round(this.t / TRANSITION_TIME * (this.waspSprites.length - 1));

                    if (done) {
                        this.isTransitioningIntoFire = false;
                        this.isFiring = true;
                        this.t = 0;
                    }
                } else if (this.isFiring) {
                    for (let i = 0; i < this.projectileQueue.length; ++i) {
                        if ((this.projectileQueue[i] -= dt) <= 0) {
                            this.firePoisonAttack();
                            this.projectileQueue.shift();
                            --i;
                        }
                    }
                    if (this.projectileQueue.length === 0) {
                        // we are done firing
                        this.isFiring = false;
                        this.isTransitioningOutOfFire = true;
                        this.t = 0;
                    }
                } else if (this.isTransitioningOutOfFire) {
                    if ((this.t += dt) > TRANSITION_TIME) this.t = TRANSITION_TIME;
                    const done = this.t >= TRANSITION_TIME;
                    this.spriteIdx = this.waspSprites.length - 1 - Math.round(this.t / TRANSITION_TIME * (this.waspSprites.length - 1));
                    if (done) {
                        this.isTransitioningOutOfFire = false;
                        // attack complete code
                    }
                }

            },
            enumerable: true,
            configurable: true,
            writable: true
    }
});

WaspPoisonAttack.prototype.firePoisonAttack = function () {
    let w = this.bug.getWidth(), h = this.bug.getHeight() - 10;
    let theta = this.bug.a + Math.PI - Math.atan(h / w);
    let r = Math.hypot(w, h) / 2;
    let x0 = [this.bug.x + r * Math.cos(theta), this.bug.y + r * Math.sin(theta)];
    let a = this.bug.a + Math.PI / 2;
    this.fireProjectile(x0, a);
};

WaspPoisonAttack.prototype.attack = function () {
    if (this.canAttack()) {
        for (let i = 0; i < this.numProjectilesInSuccession; ++i) {
            this.projectileQueue.push(i * this.timeBetweenSuccessiveFires);
        }
        this.timeSinceLastFire = 0;
        this.isTransitioningIntoFire = true;
        this.t = 0;
    }
};

WaspPoisonAttack.prototype.shouldProcessInput = function () {
    return true;// !(this.isTransitioningIntoFire || this.isFiring || this.isTransitioningOutOfFire);
};

WaspPoisonAttack.prototype.shouldUpdateSprite = function () {
    return this.isTransitioningIntoFire || this.isFiring || this.isTransitioningOutOfFire
        ? false : undefined; // undefined means "no comment, take care of it yourself"
};

WaspPoisonAttack.prototype.getCurrentSprite = function () {
    return this.waspSprites[this.spriteIdx];
};

module.exports = WaspPoisonAttack;