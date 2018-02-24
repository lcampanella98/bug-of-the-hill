const game = module.exports = {};
const PlayerHandler = require("./playerHandler");
const GameWorld = require("./gameWorld");
const GameWorldGenerator = require("./gameWorldGenerator");

const MSG = {};
game.MSG = MSG;

MSG.PLAYERJOIN = 'playerjoin';
MSG.GAMEUPDATE = 'gameupdate';
MSG.START = 'start';

game.isStarted = false;
game.initialized = false;

game.admins = [];

const Admin = function(ws) {
    this.ws = ws;
};

Admin.prototype.isOnline = function () {
    return this.ws.readyState === 1;
};

game.init = function () {
    this.playerHandler = new PlayerHandler();
    this.isStarted = false;
    this.initialized = true;
};

game.adminJoin = function(ws) {
    game.admins.push(new Admin(ws));
    for (let i = 0; i < this.playerHandler.players.length; i++) {
        ws.send(JSON.stringify({msg: MSG.PLAYERJOIN, name:this.playerHandler.players[i]}));
    }
};

game.start = function () {
    this.isStarted = true;
    this.gameTimeLimit = 2 * 60 * 1000;
    this.gameWorld = new GameWorld(this.playerHandler, this.gameTimeLimit);
    this.gameWorldGenerator = new GameWorldGenerator(this.gameWorld);
    this.broadcastMessage(JSON.stringify({msg: MSG.START}));
    this.updateWorld();
};

game.playerJoin = function (name, ws) {
    if (this.playerHandler.hasPlayer(name)) return false;
    //console.log(this.gameWorld);
    this.playerHandler.addPlayer(name, ws, this.gameWorld);
    //if (this.isStarted) this.gameWorld.spawnPlayerRandomBug(newPlayer);
    this.broadcastToAdmins(JSON.stringify({msg:MSG.PLAYERJOIN, name:name}));
    return true;
};

game.playerInGame = function (name) {
    return this.playerHandler.hasPlayer(name);
};

game.playerInput = function (name, input) {
    const player = this.playerHandler.getPlayer(name);
    if (player !== null) {
        //console.log("got input ");
        player.gotInput(input);
    }
};

game.MS_PER_FRAME = 1000 / 60;

game.updateWorld = function () {
    const now = Date.now();
    this.gameWorld.updateWorld(this.MS_PER_FRAME);
    this.sendNextFrame();
    const elapsed = Date.now() - now;
    const self = this;
    setTimeout(function() {self.updateWorld();}, this.MS_PER_FRAME - elapsed);
};

let printed = false;

game.getDataObject = function () {
    const datObj = {};
    datObj.components = this.gameWorldGenerator.getDataObject();

    datObj.players = {};
    const players = this.playerHandler.players;
    let p;
    for (let i = 0; i < players.length; i++) {
        p = players[i];
        if (p.isOnline()) datObj.players[p.name] = p.getMetaData();
    }
    datObj.topKingName = this.gameWorld.topKing === null ? null : this.gameWorld.topKing.name;
    datObj.kingName = this.gameWorld.king === null ? null : this.gameWorld.king.name;

    datObj.gameTimeLeft = this.gameWorld.timeLeft;

    return datObj;
};

game.sendNextFrame = function () {
    const dataObj = this.getDataObject();
    if (!printed && this.playerHandler.players.length > 0) {
        //console.log(dataObj);
        printed = true;
    }

    dataObj.msg = MSG.GAMEUPDATE;
    game.broadcastMessage(JSON.stringify(dataObj));

};

game.broadcastToAdmins = function (data) {
    for (let i = 0; i < this.admins.length; i++) {
        if (this.admins[i].isOnline()) {
            this.admins[i].ws.send(data);
        }
        // else this.admins.splice(i--, 1);
    }
};

game.broadcastMessage = function (data) {
    // broadcast to players
    const players = this.playerHandler.players;
    for (let i = 0; i < players.length; i++) {
        if (players[i].isOnline()) {
            players[i].ws.send(data);
        }
    }
    this.broadcastToAdmins(data);
};

game.init();
game.start();