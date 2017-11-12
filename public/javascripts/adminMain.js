$(function () {
    var socket;
    var gameStarted = false;

    var addr = 'ws://' + window.location.host + window.location.pathname;
    socket = new WebSocket(addr);

    socket.onopen = function () {
        socket.send('admin');
        console.log(socket);
        $('#btn-start').on('click', function () {
            socket.send('start');
        });
    };

    socket.onmessage = function (evt) {
        var data = evt.data;
        var parts = parseSocketMessage(data);
        var msg = parts[0];
        var argLen = parts.length - 1;
        if (msg.toLowerCase() === 'playerjoin') {
            if (argLen > 0) $('#players').append('<li>' + parts[1] + '</li>');
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