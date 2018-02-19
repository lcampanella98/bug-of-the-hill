var gameObjects;
var myName;

$(function() {
    var socket;
    var gameStarted = false;
    var objectsLoaded = false;

    $('#form-join').on('submit', function (e) {
        var name = $('#name').val().trim();
        var addr = 'ws://' + window.location.host + '/play';
        try {
            socket = new WebSocket(addr);
        } catch (e) {
            $('#msg').text('Unable to connect to server. Please try again later');
        }
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
                    // console.log('game started');
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
        };

        e.preventDefault();
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
    var currentPlayerInfoDiv = $('<div style="position:absolute;top:30px;left:30px"><h2 id="info-bug-name"></h2><br><h3 id="info-bug-time"></h3></div>');
    var kingInfoDiv = $('<div style="position:absolute;left:calc(100% - 200px);top:30px"><h2 id="info-king-name"></h2><br><h3 id="info-king-time"></h3></div>');
    var positionInfoDiv = $('<div style="position:absolute;left:30px;top:calc(100% - 200px);"><h4 id="pos-info"></h4></div>');
    var timeInfoDiv = $('<div style="position:absolute;top:30px;left:calc(50% - 100px);width:200px;text-align:center;"><h2 id="time-info"></h2></div>"');
    var topKingDiv = $('<div style="position:absolute;top:200px;left:calc(50% - 200px);width:400px;text-align:center;"><h1 id="top-king-info"></h1></div>');
    body.append(topKingDiv);
    body.append(currentPlayerInfoDiv);
    body.append(kingInfoDiv);
    body.append(positionInfoDiv);
    body.append(timeInfoDiv);
}


function renderHealthBar(ctx, maxHealth, curHealth, x, y) {
    let w = 150, h = 20, sW = 4;
    let tx = x+w/2,ty = y+h/2;
    ctx.translate(tx, ty);
    ctx.strokeStyle = 'black';
    ctx.lineWidth = sW;
    ctx.strokeRect(-w/2,-h/2,w,h);
    let hRatio = curHealth / maxHealth;
    ctx.fillStyle = hRatio < .25 ? 'red' : hRatio < .6 ? 'yellow' : 'green';
    ctx.fillRect(-(w-sW)/2,-(h-sW)/2,(w-sW)*hRatio,(h-sW));
    ctx.translate(-tx, -ty);
}


function updateGameArea(data) {
    let components = data.components;
    let kingData = data.kingData;
    let players = data.players;
    let you;
    for (let i = 0; i < players.length; i++) {
        if (players[i].name === myName) {you = players[i];break;}
    }

    let cW = myGameArea.canvas.width, cH = myGameArea.canvas.height;
    let cHW = cW / 2, cHH = cH / 2;
    let dist = Math.sqrt(cHW * cHW + cHH * cHH);
    let beta = Math.atan(cHW/cHH);

    let rp = [you.x, you.y];
    let theta = beta + you.angle;
    let x0 = [dist * Math.cos(theta), dist * Math.sin(theta)];
    let r0 = [rp[0]+x0[0],rp[1]+x0[1]];
    let u = [Math.cos(you.angle - Math.PI / 2), Math.sin(you.angle - Math.PI / 2)];
    let v = [Math.cos(you.angle - Math.PI), Math.sin(you.angle - Math.PI)];
    let B = [u, v];
    let Binv = getInv2x2(B);

    let comp;
    myGameArea.clear();
    let ctx = myGameArea.context;
    let oldFillStyle, oldStrokeStyle;
    let x, xB, w, h, a, color, obj, r;
    for (let i = 0; i < components.length; i++) {
        comp = components[i];
        x = [comp.x - r0[0], comp.y - r0[1]];
        xB = mulMatrixVector(Binv, x);

        // check if point is inside bounding box
        if (!shouldRenderComp(xB, comp, cW, cH)) continue;

        a = you.angle - comp.a;

        ctx.translate(xB[0],xB[1]);
        ctx.rotate(a);
        if (comp.isImageObj) {
            obj = getGameObject(comp.id);
            if (obj !== null) {
                let img = document.getElementById('object-'+comp.id);
                w = img.width;
                h = img.height;
                ctx.drawImage(img, -w/2,-h/2,w,h);
                if (comp.playerName !== undefined) {
                    ctx.rotate(-a);
                    ctx.font = comp.font;
                    ctx.fillStyle = comp.fillStyle;
                    ctx.fillText(comp.playerName, -5*comp.playerName.length,-h/2-10);
                    ctx.rotate(a);
                }
            }
        } else if (comp.isRect) {
            w = comp.w;
            h = comp.h;
            if (comp.fill) {
                ctx.fillStyle = comp.fillColor;
                ctx.fillRect(-w/2,-h/2,w, h);
            }
            if (comp.stroke) {
                ctx.strokeStyle = comp.strokeColor;
                ctx.lineWidth = comp.lineWidth;
                ctx.strokeRect(-w/2,-h/2,w, h);
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


    $('#info-bug-name').text(you.bugName);
    // $('#info-bug-worth').text(you.health + ' health');
    let infoElement = $('#info-bug-time');
    infoElement.text(Math.ceil(you.timeAsKing/1000) + ' seconds king');
    renderHealthBar(ctx, you.maxHealth, you.health, infoElement.offset().left, infoElement.offset().top + 50);


    $('#time-info').html("Time Left<br>" + Math.ceil(data.gameTimeLeft/1000));

    if (data.gameTimeLeft <= 0) {
        let topKing = data.topKing;
        let msg;
        if (topKing)
            msg = 'Round Winner:' + topKing.name + '<br>' + Math.ceil(topKing.timeAsKing/1000) + " seconds";
        else msg = 'No Winner';
        $('#top-king-info').html(msg);
    } else {
        $("#top-king-info").html("");
    }

    if (kingData !== null) {
        $('#info-king-name').text(kingData.name + " is king!");
        // $('#info-king-worth').text(kingData.health + ' health');
        infoElement = $('#info-king-time');
        infoElement.text(Math.ceil(kingData.timeAsKing/1000) + ' seconds');
        console.log(kingData.health + " / " + kingData.maxHealth);
        renderHealthBar(ctx, kingData.maxHealth, kingData.health, infoElement.offset().left, infoElement.offset().top + 50);

    } else {
        $('#info-king-name').text('Hill Open');
        // $('#info-king-worth').text('');
        $('#info-king-time').text('');
    }
}

function shouldRenderComp(v, comp, cWidth, cHeight) {
    var distAway = null;
    if (comp.isImageObj) {
        var obj = getGameObject(comp.id);
        distAway = Math.max(obj.width, obj.height);
    } else if (comp.isCircle) {
        distAway = comp.radius;
    } else if (comp.isRect) {
        distAway = Math.max(comp.w, comp.h);
    }
    if (distAway !== null)
        return !(v[0] < -distAway || v[0] > cWidth + distAway
            || v[1] < -distAway || v[1] > cHeight + distAway);
    return true;
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

let useArrowKeys = true;
let useWASD = true;

function addKeyListener(socket) {
    document.addEventListener('keydown', function(event) {
        if((useArrowKeys && event.keyCode === 37)
            || (useWASD && event.keyCode === 65)) { // left
            keyInput['l'] = true;
        } else if ((useArrowKeys && event.keyCode === 38)
            || (useWASD && event.keyCode === 87)) { // up
            keyInput['u'] = true;
        } else if((useArrowKeys && event.keyCode === 39)
            || (useWASD && event.keyCode === 68)) { // right
            keyInput['r'] = true;
        } else if ((useArrowKeys && event.keyCode === 40)
            || (useWASD && event.keyCode === 83)) { // down
            keyInput['d'] = true;
        } else if (event.keyCode === 32) {
            keyInput['s'] = true;
        }
        sendInput(socket);
    });
    document.addEventListener('keyup', function(event) {
        if((useArrowKeys && event.keyCode === 37)
            || (useWASD && event.keyCode === 65)) { // left
            keyInput['l'] = false;
        } else if ((useArrowKeys && event.keyCode === 38)
            || (useWASD && event.keyCode === 87)) { // up
            keyInput['u'] = false;
        } else if((useArrowKeys && event.keyCode === 39)
            || (useWASD && event.keyCode === 68)) { // right
            keyInput['r'] = false;
        } else if ((useArrowKeys && event.keyCode === 40)
            || (useWASD && event.keyCode === 83)) { // down
            keyInput['d'] = false;
        } else if (event.keyCode === 32) {
            keyInput['s'] = false;
        }
        sendInput(socket);
    });

}
