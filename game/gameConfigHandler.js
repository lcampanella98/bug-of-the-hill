const bugObj = require('../bug/bugs.json');
const sizeOf = require('image-size');
const fs = require('fs');


function imgPathToFullPath(imgPath) {
    return 'public/images/' + imgPath;
}

const exp = {};
module.exports = exp;

exp.DrawableComponent = function () {
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
    this.isImageObj = false;
    this.id = undefined;
    this.w = undefined;
    this.h = undefined;

    this.isText = false;
    this.font = undefined;
    this.text = undefined;

    this.isPlayer = false;
    this.playerName = undefined;
};

exp.GameImageObject = function () {
    // id
    // img file if not bug
    // bug with image file
    this.id = undefined;

    this.file = undefined;
    this.width = undefined;
    this.height = undefined;


};

exp.GameImageObject.prototype.appendToDrawableGameComponent = function (drawComp) {
    drawComp.isImageObj = true;
    drawComp.id = this.id;
    drawComp.w = this.width;
    drawComp.h = this.height;
};

exp.flytrapRate = bugObj.flytrapRate !== undefined ? bugObj.flytrapRate : 8;

const arrBugsJSONConfig = bugObj.bugs;
const allGameImageObjects = [];

// id counter
let idCounter = 0;

// turretImageObj
const turret = new exp.GameImageObject();
turret.id = idCounter++;
turret.file = 'otherimg/turret_sized.png';
const turretDims = sizeOf(imgPathToFullPath(turret.file));
turret.width = turretDims.width;
turret.height = turretDims.height;
allGameImageObjects.push(turret);

// background grid
let bgGrid = new exp.GameImageObject();
bgGrid.id = idCounter++;
bgGrid.file = 'otherimg/grid_256_green.png';
let bgGridDims = sizeOf(imgPathToFullPath(bgGrid.file));
bgGrid.width = bgGridDims.width;
bgGrid.height = bgGridDims.height;
allGameImageObjects.push(bgGrid);

// flytrap
exp.flytrapSprites = [];
let i = 1;

while (true) {
    let fName = 'flytrap/flytrap_' + i + '.png';
    if (!fs.existsSync(imgPathToFullPath(fName))) break;
    let flytrapObj = new exp.GameImageObject();
    flytrapObj.id = idCounter++;
    flytrapObj.file = fName;
    let dims = sizeOf(imgPathToFullPath(flytrapObj.file));
    flytrapObj.width = dims.width;
    flytrapObj.height = dims.height;
    exp.flytrapSprites.push(flytrapObj);
    allGameImageObjects.push(flytrapObj);
    ++i;
}



// bugs
const bugPrototypeFactory = require('./bugs/bugPrototypeFactory');

exp.spritesByBug = {};

for (let i = 0; i < arrBugsJSONConfig.length; ++i) {
    // add image objects
    const bugSprites = [];
    let j = 1;
    while (true) {
        let fName = 'bug/' + arrBugsJSONConfig[i]['type'] + '/' + arrBugsJSONConfig[i]['type'] + '_' + j + '.png';
        if (!fs.existsSync(imgPathToFullPath(fName))) break;
        const o = {};
        o.file = fName;
        const dims = sizeOf(imgPathToFullPath(o.file));
        o.width = dims.width;
        o.height = dims.height;
        o.id = idCounter++;
        bugSprites.push(o);
        ++j;
    }

    exp.spritesByBug[arrBugsJSONConfig[i]['type']] = bugSprites;

    for (let j = 0; j < bugSprites.length; j++) {
        allGameImageObjects.push(bugSprites[j]);
    }

    if (bugPrototypeFactory.hasPrototype(arrBugsJSONConfig[i]['type'])) {


        // add json config to bug prototype
        const bugPrototypeObj = {
            JSONConfig: {
                speed: arrBugsJSONConfig[i]['speed'],
                health: arrBugsJSONConfig[i]['health'],
                bugType: arrBugsJSONConfig[i]['type'],
                damage: arrBugsJSONConfig[i]['damage'],
                reloadTime: arrBugsJSONConfig[i]['reloadTime'],
                sprites: bugSprites
            }
        };

        bugPrototypeFactory.addToBugPrototype(arrBugsJSONConfig[i]['type'], bugPrototypeObj);
    }

}
const gameObjIdMap = {};
for (let i = 0; i < allGameImageObjects.length; i++) {
    gameObjIdMap[allGameImageObjects[i].id] = allGameImageObjects[i];
}

exp.allGameImageObjectsById = gameObjIdMap;
exp.turretImageObj = turret;
exp.bgGridImageObj = bgGrid;

