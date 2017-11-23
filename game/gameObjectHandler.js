var celebObj = require('../celeb/celeb.json');
var sizeOf = require('image-size');

module.exports = {};

var GameComponent = module.exports.GameComponent = function () {
    this.x = 0;
    this.y = 0;
    this.a = 0;
    this.fill = false;
    this.fillColor = undefined;
    this.stroke = false;
    this.strokeColor = undefined;
    this.lineWidth = undefined;
    this.isCircle = false;
    this.radius = undefined;
    this.isRect = false;
    this.w = undefined;
    this.h = undefined;
    this.isObj = false;
    this.id = undefined;
    this.isBackground = false;
    this.isText = false;
    this.font = undefined;
    this.text = undefined;
};

var GameObject = module.exports.GameObject = function (id) {
    // id
    // img file if not celeb
    // celeb with image file
};

module.exports.Celeb = function () {
    // name

};

var celebs = [];
var allGameObjects = [];

if (celebObj.hasOwnProperty('celebs')) {
    celebs = celebObj.celebs;
}
// id counter
var idCounter = 0;

// turret
var turret = new GameObject();
turret.id = idCounter++;
turret.file = 'otherimg/turret_sized.png';
var turretDims = sizeOf('public/images/' + turret.file);
turret.width = turretDims.width;
turret.height = turretDims.height;
allGameObjects.push(turret);

// background grid
var bgGrid = new GameObject();
bgGrid.id = idCounter++;
bgGrid.file = 'otherimg/grid_256.png';
var bgGridDims = sizeOf('public/images/' + bgGrid.file);
bgGrid.width = bgGridDims.width;
bgGrid.height = bgGridDims.height;
allGameObjects.push(bgGrid);

// celebs
for (var i = 0;i < celebs.length; i++) {
    var c = new GameObject();
    c.id = idCounter++;
    celebs[i].file = 'celeb/' + celebs[i].file;
    var dims = sizeOf('public/images/' + celebs[i].file);
    celebs[i].id = c.id;
    c.celeb = celebs[i];
    c.celeb.width = dims.width;
    c.celeb.height = dims.height;
    c.file = c.celeb.file;
    c.width = dims.width;
    c.height = dims.height;
    allGameObjects.push(c);
}
var gameObjIdMap = {};
for (i = 0; i < allGameObjects.length; i++) {
    gameObjIdMap[allGameObjects[i].id] = allGameObjects[i];
}

module.exports.allGameObjects = gameObjIdMap;
module.exports.celebs = celebs;
module.exports.turret = turret;
module.exports.bgGrid = bgGrid;