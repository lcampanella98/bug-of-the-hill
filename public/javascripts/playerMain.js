var gameObjects;
var myName;

$(function() {
    var socket;
    var gameStarted = false;

    $('#btn-join').on('click', function () {
        var name = $('#name').val().trim();
        var addr = 'ws://' + window.location.host + '/play';
        socket = new WebSocket(addr);
        socket.onopen = function () {
            socket.send(JSON.stringify({msg:'join',name:name}));
        };

        socket.onmessage = function (evt) {
            var data = JSON.parse(evt.data);
            var msg;
            if (!gameStarted) {
                msg = data.msg.toLowerCase();
                if (msg === 'wait') {
                    $('#msg').text('Please wait for admin to open game');
                } else if (msg === 'taken') {
                    $('#msg').text('Name taken');
                } else if (msg === 'success') {
                    $('#name').attr('readonly', true);
                    $('#btn-join').hide();
                    $('#msg').text('Waiting for admin to start match...');
                    myName = name;
                } else if (msg === 'alreadystarted') {
                    $('#msg').text('Game already started.');
                } else if (msg === 'start') {
                    gameStarted = true;
                    addKeyListener();
                    startGame();
                } else if (msg === 'gameover') {
                    // gameOver();
                } else if (msg === 'loadobjects') {
                    gameObjects = data.gameObjects;
                    loadObjectImages();
                }
            } else {
                updateGameArea(data);
            }
        };

        socket.onclose = function () {
        };

        socket.onbeforeunload = function (event) {
            socket.close();
        }

    });

});

var myGameArea;

var loadObjectImages = function () {
    var span = $('<span id="span-object-img" style="display:none"></span>');
    for (var i = 0; i < gameObjects.length; i++) {
        var obj = gameObjects[i];
        var file = obj.file;
        var src = window.location.href + "images/" + file;
        // console.log(src);
        var img = $('<img id="object-'+obj.id+'" src="'+ src +'" />');
        span.append(img);
    }
    $('body').append(span);
};

function startGame() {
    // remove elements
    var body = $('body');
    $.each(body.children(), function() {$(this).hide();});
    body.css('padding', '0px');
    body.css('margin', '0px');
    var width = body.width();
    var height = window.innerHeight - 100;
    body.append('<canvas id="cvs" style="position:absolute;top:0;left:0;right:0;bottom:0;width:100%;height:100%;"></canvas>');
    var cvs = $('#cvs');
    myGameArea = {
        canvas : cvs.get(0),
        start : function() {
            this.canvas.width = cvs.width();
            this.canvas.height = cvs.height();
            this.context = this.canvas.getContext("2d");
        },
        clear : function() {
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
    };

    myGameArea.start();
    var currentPlayerInfoDiv = $('<div style="position:absolute;top:30px;left:30px"><h4 id="info-celeb-name"></h4><br><h5>Net Worth: <span id="info-celeb-worth"></span></h5></div>');
    var kingInfoDiv = $('<div style="position:absolute;left:calc(100% - 200px);top:30px"><h4>King Celeb: <span id="info-king-name"></span></h4><br><h5>Net Worth: <span id="info-king-worth"></span></h5></div>');
    body.append(currentPlayerInfoDiv);
    body.append(kingInfoDiv);
}
function getGameObject(id) {
    for (var i = 0; i < gameObjects.length; i++) {
        if (gameObjects[i].id === id) return gameObjects[i];
    }
    return null;
}

var keyInput = {"l":false,"r":false,"u":false,"d":false,"s":false};

function sendInput(socket) {
    var data = {
        msg: 'input',
        input: keyInput
    };
    socket.send(JSON.stringify(data));
}

function addKeyListener(socket) {
    document.addEventListener('keydown', function(event) {
        if(event.keyCode === 37) { // left
            keyInput['l'] = true;
        } else if (event.keyCode === 38) { // up
            keyInput['u'] = true;
        } else if(event.keyCode === 39) { // right
            keyInput['r'] = true;
        } else if (event.keyCode === 40) { // down
            keyInput['d'] = true;
        } else if (event.keyCode === 32) {
            keyInput['s'] = true;
        }
        sendInput(socket);
    });
    document.addEventListener('keyup', function(event) {
        if(event.keyCode === 37) { // left
            keyInput['l'] = false;
        } else if (event.keyCode === 38) { // up
            keyInput['u'] = false;
        } else if(event.keyCode === 39) { // right
            keyInput['r'] = false;
        } else if (event.keyCode === 40) { // down
            keyInput['d'] = false;
        } else if (event.keyCode === 32) {
            keyInput['s'] = false;
        }
        sendInput(socket);
    });

}

function isInside(point, vs) {
    // ray-casting algorithm based on
    // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html

    var x = point[0], y = point[1];

    var inside = false;
    for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
        var xi = vs[i][0], yi = vs[i][1];
        var xj = vs[j][0], yj = vs[j][1];

        var intersect = ((yi > y) !== (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }

    return inside;
}

function updateGameArea(data) {
    var allComponents = data.components;
    var kingData = data.kingData;
    var players = data.players;
    var you;
    for (var i = 0; i < players.length; i++) {
        if (players[i].name === name) {you = players[i];break;}
    }
    $('#info-celeb-name').text(you.celebName);
    $('#info-celeb-worth').text('$' + you.netWorth + ' MIL');

    if (kingData !== null) {
        $('#info-king-name').text(kingData.name);
        $('#info-king-worth').text('$' + kingData.netWorth + ' MIL');
    } else {
        $('#info-king-name').text('No King');
        $('#info-king-worth').text('');
    }

    var x0 = you.x, y0 = you.y;
    var cW = myGameArea.canvas.width, cH = myGameArea.canvas.height;
    var dist = Math.sqrt(cW * cW + cH * cH);
    var theta = Math.atan2(cH, cW) + you.angle;
    var dx = dist * Math.sin(theta), dy = dist * Math.cos(theta);
    var boundingBox = [
        [x0 + dx, y0 + dy],
        [x0 - dx, y0 + dy],
        [x0 + dx, y0 - dy],
        [x0 - dx, y0 - dy]
    ];
    var components = [];
    var comp;
    myGameArea.clear();
    var ctx = myGameArea.context;
    var x, y, w, h, a, color, obj, r;
    for (var i = 0; i < components.length; i++) {
        comp = components[i];
        x = y0 - comp.y;
        y = x0 - comp.x;
        var inside = isInside([x, y], boundingBox);
        if (!inside) continue;
        a = 270 - comp.a;
        ctx.translate(x, y);
        ctx.rotate(a);
        if (comp.isObj) {
            obj = getGameObject(comp.id);
            if (obj !== null) {
                var img = document.getElementById('object-'+comp.id);
                w = img.width;
                h = img.height;
                ctx.drawImage(img, -w/2,-h/2,w,h);
            }
        } else if (comp.isRect) {
            w = comp.width;
            h = comp.height;
            ctx.rect(-w/2,-h/2,w, h);
            if (comp.fill) {
                ctx.fillStyle = comp.fillColor;
                ctx.fill();
            }
            if (comp.stroke) {
                ctx.strokeStyle = comp.strokeColor;
                ctx.lineWidth = comp.lineWidth;
                ctx.stroke();
            }
        } else if (comp.isCircle) {
            r = comp.radius;
            ctx.beginPath();
            ctx.arc(0, 0, r, 0, 2 * Math.PI, false);
            if (comp.fill) {
                ctx.fillStyle = comp.fillColor;
                ctx.fill();
            }
            if (comp.stroke) {
                ctx.strokeStyle = comp.strokeColor;
                ctx.lineWidth = comp.lineWidth;
                ctx.stroke();
            }
        } else if (comp.isText) {
            ctx.font = comp.font;
            ctx.fillStyle = comp.fillStyle;
            ctx.fillText(comp.text, x, y);
        }
        ctx.rotate(-a);
        ctx.translate(-x,-y);
    }


}

function parseSocketMessage(msg) {
    return msg.split(';');
}