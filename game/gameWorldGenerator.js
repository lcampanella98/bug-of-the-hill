var gameObjects = require('./gameObjects');
var Player = gameObjects.Player;
var Projectile = gameObjects.Projectile;
var Turret = gameObjects.Turret;
var Hill = gameObjects.Hill;

var gameObjectHandler = require('./gameObjectHandler');
var GameComponent = gameObjectHandler.GameComponent;

var gameWorldGenerator = module.exports = function (gameWorld) {
    this.gameWorld = gameWorld;
    this.worldWidth = gameWorld.worldWidth;
    this.worldHeight = gameWorld.worldHeight;

    // call this to get data object
    this.getDataObject = function () {
        let obj = {};
        obj.components = [];
        for (let i = 0; i < this.backgroundComponents.length; i++) {
            obj.components.push(this.backgroundComponents[i]);
        }
        for (let i = 0; i < this.boundaryRects.length; i++) {
            obj.components.push(this.boundaryRects[i]);
        }
        obj.components.push(this.genTurretComponent(this.gameWorld.turretFront));
        obj.components.push(this.genTurretComponent(this.gameWorld.turretRear));
        obj.components.push(this.genHillComponent(this.gameWorld.hill));
        for (let i = 0; i < this.gameWorld.playersList.length; i++) {
            let p = this.gameWorld.playersList[i];
            obj.components.push(this.genPlayerComponent(p));
        }
        for (let i = 0; i < this.gameWorld.projectileList.length; i++) {
            obj.components.push(this.genProjectileComponent(this.gameWorld.projectileList[i]));
        }
        var king = this.gameWorld.king;
        obj.kingData = king === null ? null : {
            name: king.name,
            bugName: king.bug.name,
            health: king.health,
            kingTime: king.kingTime
        };
        var topKing;
        var topTime;
        for (let i = 0; i < this.gameWorld.playersList.length; i++) {
            let p = this.gameWorld.playersList[i];
            if (p.kingTime > 0 && (topTime === undefined || p.kingTime > topTime)) {
                topKing = p;
                topTime = p.kingTime;
            }
        }
        obj.topKing = topKing === undefined ? null : {
            name: topKing.name,
            health: topKing.health,
            kingTime: topKing.kingTime,
            bugName: topKing.bug.name
        };
        obj.gameTimeLeft = this.gameWorld.timeLeft;

        return obj;
    };

    this.genBoundryRects = function () {
        var x, y, w, h, offset = 10;
        var comps = [];
        var comp;
        for (var i = 0; i < 4; i++) {
            if (i === 0) {
                x = 0;
                y = this.worldHeight / 2;
                h = offset;
                w = this.worldHeight + offset;
            } else if (i === 1) {
                x = this.worldWidth;
                y = this.worldHeight / 2;
                h = offset;
                w = this.worldHeight + offset;
            } else if (i === 2) {
                x = this.worldWidth / 2;
                y = 0;
                h = this.worldWidth + offset;
                w = offset;
            } else if (i === 3) {
                x = this.worldWidth / 2;
                y = this.worldHeight;
                h = this.worldWidth + offset;
                w = offset;
            }
            comp = new GameComponent();
            comp.isRect = true;
            comp.fill = true;
            comp.fillColor = 'black';
            comp.x = x;
            comp.y = y;
            comp.w = w;
            comp.h = h;
            comps.push(comp);
        }
        return comps;
    };

    this.genBackgroundComponents = function () {
        let xMax = this.worldWidth + 3000, yMax = this.worldHeight + 3000;
        let grid = gameObjectHandler.bgGrid;
        let comps = [];
        let comp;
        for (let x = this.worldWidth/2-xMax/2; x <= this.worldWidth/2+xMax/2; x += grid.width) {
            for (let y = this.worldHeight/2-yMax/2; y <= this.worldHeight/2+yMax/2; y += grid.height) {
                comp = new GameComponent();
                comp.id = grid.id;
                comp.x = x;
                comp.y = y;
                comp.a = 0;
                comp.isObj = true;
                comps.push(comp);
            }
        }
        return comps;
    };

    this.genPlayerComponent = function (player) {
        var comp = new GameComponent();
        comp.x = player.x;
        comp.y = player.y;
        comp.a = player.a;
        comp.isObj = true;
        comp.id = player.getCurrentSprite().id;
        comp.playerName = player.name;
        comp.font = this.font;
        return comp;
    };

    this.genTurretComponent = function (turret) {
        var comp = new GameComponent();
        comp.x = turret.x;
        comp.y = turret.y;
        comp.a = turret.angle;
        comp.isObj = true;
        comp.id = gameObjectHandler.turret.id;
        return comp;
    };

    this.genProjectileComponent = function (proj) {
        var comp = new GameComponent();
        comp.x = proj.x;
        comp.y = proj.y;
        comp.a = proj.a;
        comp.isCircle = true;
        comp.fill = true;
        comp.stroke = true;
        comp.radius = proj.drawProps.radius;
        comp.fillColor = proj.drawProps.fillColor;
        comp.strokeColor = proj.drawProps.strokeColor;
        comp.lineWidth = proj.drawProps.lineWidth;
        return comp;
    };

    this.genHillComponent = function (hill) {
        var comp = new GameComponent();
        comp.x = hill.x;
        comp.y = hill.y;
        comp.a = 0;
        comp.radius = hill.playerWithinHillRadius;
        comp.isCircle = true;
        comp.stroke = true;
        comp.strokeColor = hill.drawProps.strokeColor;
        comp.lineWidth = hill.drawProps.lineWidth;
        return comp;
    };

    this.genTextComponent = function (x, y, font, text, color) {
        var comp = new GameComponent();
        comp.x = x;
        comp.y = y;
        comp.font = font;
        comp.isText = true;
        comp.text = text;
        comp.fillColor = color;
        return comp;
    };

    this.backgroundComponents = this.genBackgroundComponents();
    this.font = "20px sans-serif";
    this.boundaryRects = this.genBoundryRects();

};