let gameObjects;
let myName;

$(function() {
    let socket;
    let gameStarted = false;
    let objectsLoaded = false;

    $('#form-join').on('submit', function (e) {
        const name = $('#name').val().trim();
        const addr = 'ws://' + window.location.host + '/play';
        try {
            socket = new WebSocket(addr);
        } catch (e) {
            $('#msg').text('Unable to connect to server. Please try again later');
        }
        socket.onopen = function () {
            socket.send(JSON.stringify({msg:'join',name:name}));
        };

        socket.onmessage = function (evt) {
            const data = JSON.parse(evt.data);
            const msg = data.msg.toLowerCase();
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

let myGameArea;

function loadObjectImages () {
    const span = $('<span id="span-object-img" style="display:none"></span>');
    for (const id in gameObjects) {
        if (gameObjects.hasOwnProperty(id)) {
            const obj = gameObjects[id];
            const file = obj.file;
            const src = window.location.href + "images/" + file;
            // console.log(src);
            const img = $('<img id="object-' + obj.id + '" src="' + src + '" />');
            span.append(img);
        }
    }
    $('body').append(span);
}

function startPageToGamePage() {
    const body = $('body');
    const divStart = $('#start-page-container');
    const gameContainer = $('#game-container');

    divStart.hide();
    gameContainer.show();
    body.css('padding', '0px');
    body.css('margin', '0px');
}

function startGame() {
    // remove elements
    startPageToGamePage();
    const cvs = $('#cvs');
    // console.log(cvs.width());
    // console.log(cvs.height());
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
    let kingName = data.kingName;
    let topKingName = data.topKingName;

    const king = kingName !== null ? data.players[kingName] : null;
    const topKing = topKingName !== null ? data.players[topKingName] : null;
    const you = data.players[myName];

    let cW = myGameArea.canvas.width, cH = myGameArea.canvas.height;
    // console.log("width: " + cW);
    // console.log("height: " + cH);
    let cHW = cW / 2, cHH = cH / 2;
    let dist = Math.sqrt(cHW * cHW + cHH * cHH);
    let beta = Math.atan(cHW/cHH);

    let rp = [you.x, you.y];
    let theta = beta + you.a;
    let x0 = [dist * Math.cos(theta), dist * Math.sin(theta)];
    let r0 = [rp[0]+x0[0],rp[1]+x0[1]];
    let u = [Math.cos(you.a - Math.PI / 2), Math.sin(you.a - Math.PI / 2)];
    let v = [Math.cos(you.a - Math.PI), Math.sin(you.a - Math.PI)];
    let B = [u, v];
    let Binv = getInv2x2(B);

    let comp;
    myGameArea.clear();
    let ctx = myGameArea.context;
    let x, xB, w, h, a, obj, img, r;
    let playerTemp;
    for (let i = 0; i < components.length; i++) {
        comp = components[i];
        x = [comp.x - r0[0], comp.y - r0[1]];
        xB = mulMatrixVector(Binv, x);

        // check if point is inside bounding box
        if (!shouldRenderComp(xB, comp, cW, cH)) continue;

        a = you.a - comp.a;

        ctx.translate(xB[0],xB[1]);
        ctx.rotate(a);
        if (comp.isImageObj) {
            obj = getGameObject(comp.id);
            if (obj !== null) {
                img = document.getElementById('object-'+comp.id);
                w = img.width;
                h = img.height;
                ctx.drawImage(img, -w/2,-h/2,w,h);
                if (comp.isPlayer) {
                    ctx.rotate(-a);
                    if (comp.playerName !== myName && comp.playerName !== kingName) { // render text/health bar above player
                        playerTemp = data.players[comp.playerName];

                        ctx.font = comp.font;
                        ctx.fillStyle = comp.fillStyle;
                        ctx.fillText(comp.playerName, -5*comp.playerName.length,-h/2-10);
                    }
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
        ctx.rotate(-a); //-(2 * Math.PI - a));
        ctx.translate(-xB[0],-xB[1]);
    }
    let newContent;

    let infoBugName = $('#info-bug-name');
    newContent = you.name;
    if (infoBugName.text() !== newContent) {
        infoBugName.text(newContent);
    }

    let infoElement = $('#info-bug-time');
    newContent = Math.ceil(you.timeAsKing / 1000) + ' seconds king';
    if (infoElement.text() !== newContent) {
        infoElement.text(newContent);
    }

    renderHealthBar(ctx, you.maxHealth, you.health, infoElement.offset().left, infoElement.offset().top + 50);

    let timeInfo = $('#time-info');
    newContent = "Time Left<br>" + Math.ceil(data.gameTimeLeft/1000);
    if (timeInfo.text() !== newContent) {
        timeInfo.html(newContent);
    }

    let infoKingName = $('#info-king-name');
    let infoKingTime = $('#info-king-time');
    if (king !== null) {
        newContent = king.name + " is king!";
        if (infoKingName.text() !== newContent) {
            infoKingName.text(newContent);
        }
        newContent = Math.ceil(king.timeAsKing / 1000) + ' seconds';
        if (infoKingTime.text() !== newContent) {
            infoKingTime.text();
        }
        renderHealthBar(ctx, king.maxHealth, king.health, infoKingTime.offset().left, infoKingTime.offset().top + 50);

    } else {
        newContent = 'Hill Open';
        if (infoKingName.text() !== newContent) {
            infoKingName.text(newContent);
        }

        // $('#info-king-worth').text('');
        if (infoKingTime.text() !== '') {
            infoKingTime.text('');
        }
    }

    let topKingInfo = $('#top-king-info');
    if (data.gameTimeLeft <= 0) { // gameOVER
        let msg;
        if (topKing !== null)
            msg = 'Round Winner:' + topKing.name + '<br>' + Math.ceil(topKing.timeAsKing/1000) + " seconds";
        else msg = 'No Winner';

        topKingInfo.html(msg);
    } else {
        if (topKingInfo.html() !== '') {
            topKingInfo.html('');
        }
    }
}

function shouldRenderComp(v, comp, cWidth, cHeight) {
    let distAway = null;
    if (comp.isImageObj) {
        const obj = getGameObject(comp.id);
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
    const mNumRows = m.length, vNumCols = v.length, a = new Array(vNumCols);
    for (let r = 0; r < mNumRows; ++r) {
        a[r] = 0;
        for (let c = 0; c < vNumCols; ++c) {
            a[r] += m[r][c] * v[c];
        }
    }
    return a;
}


function getInv2x2(M) {
    let detScale = 1 / (M[0][0] * M[1][1] - M[0][1] * M[1][0]);
    return [
        [detScale * M[1][1], -detScale * M[1][0]],
        [-detScale * M[0][1], detScale * M[0][0]]
    ];
}

function getGameObject(id) {
    return gameObjects[id];
}

const keyInput = {"l": false, "r": false, "u": false, "d": false, "s": false};

function sendInput(socket) {
    const data = {
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
