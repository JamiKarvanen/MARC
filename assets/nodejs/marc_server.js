var WebSocketServer = require('websocket').server;
var http = require('http');


// Yksinkertainen webbipalveli joka palauttaa saman vastauksen kaikkiin pyyntöihin
var server = http.createServer(function(request,response){
    console.log('Received HTTP request for url ', request.url);
    response.writeHead(200, {'Content-Type': 'text/plain'});
    response.end("This is a simple node.js HTTP server.");
});

server.listen(8080,function() {
    console.log('Server has started listening on port 8080');
});

var wsServer = new WebSocketServer({
    httpServer:server,
    autoAcceptConnections: false
});

function connectionIsAllowed(request){
    return true;
}

// Valmistellaan kasa pelihuoneita
var gameRooms = [];
for (var i=0; i < 10; i++) {
    gameRooms.push({status:"empty",players:[],roomId:i+1});
}

var players = [];
wsServer.on('request', function(request){
    if (!connectionIsAllowed(request)){
        request.reject();
        console.log('WebSocket Connection from ' + request.remoteAddress + ' rejected.');
        return;
    }

    var connection = request.accept();
    console.log('WebSocket Connection from ' + request.remoteAddress + ' accepted.');

    // Lisätään pelaaja
    var player = {
        connection:connection
    }
    players.push(player);

    // Lähetetään tuore lista pelihuoneista
    sendRoomList(connection);


    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            var clientMessage = JSON.parse(message.uf8Data);
            switch (clientMessage.type) {
                case "join_room":
                    var room = joinRoom(player, clientMessage.roomId);
                    sendRoomListToEveryone();
                    break;
                case "leave_room":
                    leaveRoom(player, clientMessage.roomId);
                    sendRoomListToEveryone();
                    break;
            }
        }
    });

    connection.on('close', function(reasonCode, description) {
        console.log('WebSocket Connection from' + request.remoteAddress + ' closed.');
        for (var i = players.length-1; i >= 0; i--) {
            if (players[i]==player) {
                players.splice(i,1);
            }
        }
    });
});

function sendRoomList(connection) {
    var status = [];
    for (var i = 0; i < gameRooms.length; i++) {
        status.push(gameRooms[i].status);
    }
    var clientMessage = {type:"room_list",status:status};
    connection.send(JSON.stringify(clientMessage));
}

function sendRoomListToEveryone() {
    var status = [];
    for (var i = 0; i < gameRooms.length; i++) {
        status.push(gameRooms[i].status);
    }
    var clientMessage = {type: "room_list", status: status};
    var clientMessageString = JSON.stringify(clientMessage);
    for (var i=0; i < players.length; i++) {
        players[i].connection.send(clientMessageString);
    }
}

function joinRoom(player, roomId) {
    var room = gameRooms[roomId-1];
    console.log("Adding player to room", roomId);

    room.players.push(player);
    player.room = room;

    if (room.players.length == 1) {
        room.status = "waiting";
        player.color = "blue";
    }
    else if {}
}
