$(function () {
    var socket;
    var gameStarted = false;

    var addr = 'ws://' + window.location.host + window.location.pathname;
    socket = new WebSocket(addr);

    socket.onopen = function () {
        socket.send(JSON.stringify({msg:'admin'}));
        console.log(socket);
        $('#btn-start').on('click', function () {
            socket.send(JSON.stringify({msg:'start'}));
        });
    };

    socket.onmessage = function (evt) {
        var data = JSON.parse(evt.data);
        var msg = data.msg.toLowerCase();
        if (msg === 'playerjoin') {
            if (data.hasOwnProperty('name')) $('#players').append('<li>' + data.name + '</li>');
        } else if (msg === 'start') {
            var btnPar = $('#btn-start').parent();
            $('#btn-start').remove();
            btnPar.append('<h3>Game Started!</h3>');
        }
    };

    socket.onclose = function () {
    };

    socket.onbeforeunload = function (event) {
        socket.close();
    }
});

function parseSocketMessage(msg) {
    return msg.split(';');
}