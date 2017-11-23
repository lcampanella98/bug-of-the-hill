var gameObjects;
var myName;

$(function() {
    var socket;
    var gameStarted = false;
    var objectsLoaded = false;

    $('#btn-join').on('click', function () {
        var name = $('#name').val().trim();
        var addr = 'ws://' + window.location.host + '/play';
        socket = new WebSocket(addr);
        socket.onopen = function () {
            socket.send(JSON.stringify({msg:'join',name:name}));
        };

        socket.onmessage = function (evt) {
            var data = JSON.parse(evt.data);
            var msg = data.msg.toLowerCase();
            if (!gameStarted) {
                if (msg === 'wait') {
                    $('#msg').text('Please wait for admin to open game');
                } else if (msg === 'nametaken') {
                    $('#msg').text('Name taken');
                } else if (msg === 'nameinvalid') {
                    $('#msg').text('Name invalid');
                } else if (msg === 'joinsuccess') {
                    $('#name').attr('readonly', true);
                    $('#btn-join').hide();
                    $('#msg').text('Waiting for admin to start match...');
                    myName = name;
                    gameObjects = data.gameObjects;
                    loadObjectImages();
                    objectsLoaded = true;
                } else if (msg === 'alreadystarted') {
                    $('#msg').text('Game already started.');
                } else if (msg === 'start') {
                    gameStarted = true;
                    addKeyListener(socket);
                    startGame();
                    console.log('game started');
                } else if (msg === 'gameover') {
                    // gameOver();
                }
            } else {
                if (data.msg === 'gameupdate') {
                    if (objectsLoaded)
                        updateGameArea(data);
                }
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
    for (var id in gameObjects) {
        if (gameObjects.hasOwnProperty(id)) {
            var obj = gameObjects[id];
            var file = obj.file;
            var src = window.location.href + "images/" + file;
            // console.log(src);
            var img = $('<img id="object-'+obj.id+'" src="'+ src +'" />');
            span.append(img);
        }
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
    var positionInfoDiv = $('<div style="position:absolute;left:30px;top:calc(100% - 200px);"><h4 id="pos-info"></h4></div>');
    body.append(currentPlayerInfoDiv);
    body.append(kingInfoDiv);
    body.append(positionInfoDiv);
}
function getGameObject(id) {
    return gameObjects[id];
}

var keyInput = {"l":false,"r":false,"u":false,"d":false,"s":false};

function sendInput(socket) {
    var data = {
        msg: 'input',
        input: keyInput,
        name: myName
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
    var components = data.components;
    var kingData = data.kingData;
    var players = data.players;
    var you;
    for (var i = 0; i < players.length; i++) {
        if (players[i].name === myName) {you = players[i];break;}
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

    var rp = [you.x, you.y];
   // console.log("rp: "+rp[0]+" , " + rp[[1]]);
    var cW = myGameArea.canvas.width, cH = myGameArea.canvas.height;
    var cHW = cW / 2, cHH = cH / 2;
    var dist = Math.sqrt(cHW * cHW + cHH * cHH);
    var beta = Math.atan(cHW/cHH);
    var theta = beta + you.angle;
    var x0 = [dist * Math.cos(theta), dist * Math.sin(theta)];
    var r0 = [rp[0]+x0[0],rp[1]+x0[1]];
    var u = [Math.cos(you.angle - Math.PI / 2), Math.sin(you.angle - Math.PI / 2)];
   // console.log("u: "+u[0]+" , " + u[[1]]);
    var v = [Math.cos(you.angle - Math.PI), Math.sin(you.angle - Math.PI)];
   // console.log("v: "+v[0]+" , " + v[[1]]);
    var B = [u, v];
    var Binv = getInv2x2(B);
    // var a1 = you.angle + (Math.PI / 2 - theta), a2 = you.angle - (Math.PI / 2 - theta);
    // var dx1 = dist * Math.cos(a1), dy1 = dist * Math.sin(a1),
    //     dx2 = dist * Math.cos(a2), dy2 = dist * Math.sin(a2);
    // var boundingBox = [
    //     [x0 + dx1, y0 + dy1],
    //     [x0 + dx2, y0 + dy2],
    //     [x0 - dx1, y0 - dy1],
    //     [x0 - dx2, y0 - dy2]
    // ];
    // console.log(Binv);
    // console.log('sub:');
    // console.log([rp[0]-r0[0],rp[1]-r0[1]]);
    // var Xyou = mulMatrixVector(Binv, [rp[0]-r0[0],rp[1]-r0[1]]);
    //console.log(Xyou);
    var comp;
    myGameArea.clear();
    var ctx = myGameArea.context;
    var x, xB, w, h, a, color, obj, r;
    for (var i = 0; i < components.length; i++) {
        comp = components[i];
        x = [comp.x - r0[0], comp.y - r0[1]];
        xB = mulMatrixVector(Binv, x);

        // check if point is inside bounding box
        if (!comp.isBackground
            && (xB[0] < -100 || xB[0] > cW + 100 || xB[1] < -100 || xB[1] > cH + 100)) continue;

        a = you.angle - comp.a;

        ctx.translate(xB[0],xB[1]);
        ctx.rotate(a);//Math.PI * 2 - a);
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
            ctx.closePath();
            if (comp.fill) {
                ctx.fillStyle = comp.fillColor;
                ctx.fill();
            } else if (comp.stroke) {
                ctx.strokeStyle = comp.strokeColor;
                ctx.lineWidth = comp.lineWidth;
                ctx.stroke();
            }
        } else if (comp.isText) {
            ctx.font = comp.font;
            ctx.fillStyle = comp.fillStyle;
            ctx.fillText(comp.text, xB[0], xB[1]);
        }
        ctx.rotate(-a);//-(2 * Math.PI - a));
        ctx.translate(-xB[0],-xB[1]);
    }
}

function mulMatrixVector(m, v) {
    var mNumRows = m.length, vNumCols = v.length, a = new Array(vNumCols);
    for (var r = 0; r < mNumRows; ++r) {
        a[r] = 0;
        for (var c = 0; c < vNumCols; ++c) {
            a[r] += m[r][c] * v[c];
        }
    }
    return a;
}


function getInv2x2(M) {
    var detScale = 1 / (M[0][0] * M[1][1] - M[0][1] * M[1][0]);
    var inv = [
        [detScale * M[1][1], -detScale * M[1][0]],
        [-detScale * M[0][1], detScale * M[0][0]]
    ];
    return inv;
}

function rotAboutPoint(x, y, a) {
    var sin = Math.sin(a), cos = Math.cos(a);
    return {
        x: x * cos - y * sin,
        y: y * cos + x * sin
    };
}

function parseSocketMessage(msg) {
    return msg.split(';');
}