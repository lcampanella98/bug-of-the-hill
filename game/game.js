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
    this.isOnline = function () {
        return this.ws.readyState === 1;
    }
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
    this.gameWorld = new GameWorld(this, this.playerHandler.players, this.gameTimeLimit);
    this.gameWorldGenerator = new GameWorldGenerator(this.gameWorld);
    this.broadcastMessage(JSON.stringify({msg: MSG.START}));
    this.updateWorld();
};

game.playerJoin = function (name, ws) {
    if (this.playerHandler.hasPlayer(name)) return false;
    let newPlayer = this.playerHandler.addPlayer(name, ws);
    if (this.isStarted) this.gameWorld.initPlayer(newPlayer);
    this.broadcastToAdmins(JSON.stringify({msg:MSG.PLAYERJOIN, name:name}));
    return true;
};

game.playerLeave = function (player) {
    this.gameWorld.playerLeave(player);
};

game.playerInGame = function (name) {
    return this.playerHandler.hasPlayer(name);
};

game.playerInput = function (name, input) {
    this.gameWorld.gotPlayerInput(name, input);
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

game.sendNextFrame = function () {
    const dataObj = this.gameWorldGenerator.getDataObject();
    if (dataObj !== null) {
        dataObj.msg = MSG.GAMEUPDATE;
        const players = this.playerHandler.players;
        let p;
        dataObj.players = [];
        for (let i = 0; i < players.length; i++) {
            p = players[i];
            if (p.isOnline())
                dataObj.players.push({
                    name: p.name,
                    health: p.health,
                    maxHealth: p.maxHealth,
                    bugName: p.bug.name,
                    kingTime: p.kingTime,
                    x: p.x, y: p.y, angle: p.a});
        }
        const dataStr = JSON.stringify(dataObj);
        game.broadcastMessage(dataStr);
    }
};

game.broadcastToAdmins = function (data) {
    for (let i = 0; i < this.admins.length; i++) {
        if (this.admins[i].isOnline()) {
            this.admins[i].ws.send(data);
        } else this.admins.splice(i--, 1);
    }
};

game.broadcastMessage = function (data) {
    // broadcast to players
    const players = this.playerHandler.players;
    for (let i = 0; i < players.length; i++) {
        if (players[i].isOnline()) {
            players[i].ws.send(data);
        } else {
            this.playerLeave(players[i]);
            players.splice(i--, 1);
        }
    }
    this.broadcastToAdmins(data);
};
