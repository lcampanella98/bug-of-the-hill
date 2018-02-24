const gameConfig = require('./gameConfigHandler');
const DrawableComponent = gameConfig.DrawableComponent;

const o = module.exports = {};

o.Hill = function (x, y, newKingWithinRadius, playerWithinHillRadius, unoccupiedDrawProps, occupiedDrawProps, gameWorld) {
    this.x = x;
    this.y = y;
    this.newKingWithinRadius = newKingWithinRadius;
    this.playerWithinHillRadius = playerWithinHillRadius;
    this.occupiedDrawProps = occupiedDrawProps;
    this.unoccupiedDrawProps = unoccupiedDrawProps;

    this.gameWorld = gameWorld;

    // this.moveOutsideHill = function (bug) {
    //     const dx = bug.x - this.x, dy = bug.y - this.y;
    //     const dist = Math.sqrt(dx * dx + dy * dy);
    //     if (dist >= this.playerWithinHillRadius) return;
    //     const newX = this.x + dx * this.playerWithinHillRadius / dist;
    //     const newY = this.y + dy * this.playerWithinHillRadius / dist;
    //     bug.setPosition(newX, newY);
    // };

    this.distFromKingCenter = function (bug) {
        const dx = bug.x - this.x, dy = bug.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist <= this.newKingWithinRadius) return dist;
        return -1;
    };

    this.isInsideHill = function (bug) {
        const dx = bug.x - this.x, dy = bug.y - this.y;
        return dx * dx + dy * dy < this.playerWithinHillRadius * this.playerWithinHillRadius;
    };

    this.getDrawableGameComponents = function () {
        const drawProps = this.gameWorld.hasKingNow()
            ? this.occupiedDrawProps
            : this.unoccupiedDrawProps;
        let comp = new DrawableComponent();

        comp.x = this.x;
        comp.y = this.y;
        comp.a = 0;
        comp.radius = this.playerWithinHillRadius;
        comp.isCircle = true;
        comp.stroke = true;
        comp.strokeColor = drawProps.strokeColor;
        comp.lineWidth = drawProps.lineWidth;

        return [comp];
    };
};

o.Turret = function (hillX, hillY, radius, isFront, gameWorld) {

    this.isFront = isFront;

    this.a = isFront ? 0 : Math.PI;
    this.length = gameConfig.turretImageObj.height;
    this.width = gameConfig.turretImageObj.width;
    this.hillX = hillX;
    this.hillY = hillY;
    this.radius = radius + this.length / 2;

    this.gameWorld = gameWorld;

    this.calcCoords = function () {
        this.x = this.hillX + this.radius * Math.cos(this.a);
        this.y = this.hillY + this.radius * Math.sin(this.a);
    };

    this.newAngle = function (angle) {
        this.a = this.isFront ? angle : angle + Math.PI;
        this.calcCoords();
    };

    this.getDrawableGameComponents = function () {
        const comp = new DrawableComponent();
        comp.x = this.x;
        comp.y = this.y;
        comp.a = this.a;
        comp.isImageObj = true;
        comp.id = gameConfig.turretImageObj.id;
        return [comp];
    };

    this.update = function (dt) {
        if (!this.gameWorld.hasKingNow()) return;
        const king = this.gameWorld.king;
        this.newAngle(king.bug.a);
    };

    this.calcCoords();
};