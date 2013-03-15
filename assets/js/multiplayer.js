/**
 * Created with JetBrains WebStorm.
 * User: jami
 * Date: 23.1.2013
 * Time: 12:39
 * To change this template use File | Settings | File Templates.
 */

var multiplayer = {
    websocket_url:"ws://koodi.plop.fi:8080",
    websocket: undefined,
    start: function() {
        game.type = "multiplayer";
        var WebSocketObject = window.WebSocket || window.MozWebSocket;
        if (!WebSocketObject) {
            game.showMessageBox("Your browser does not support WebSocket. Multiplayer will not work.");
            return;
        }
        this.websocket = new WebSocketObject(this.websocket_url);
        this.websocket.onmessage = multiplayer.handleWebSocketMessage;

        this.websocket.onopen = function() {
            $('.gamelayer').hide();
            $('#multiplayerlobbyscreen').show();
        }
    },
    handleWebSocketMessage: function(message) {
        var messageObject = JSON.parse(message.data);
        switch (messageObject.type) {
            case "room_list":
                multiplayer.updateRoomStatus(messageObject.status);
                break;
            case "join_room":
                var room = joinRoom(player, clientMessage.roomId);
        }
    },
    join: function() {
        var selectedRoom = document.getElementById('multiplayergameslist').value;
        if (selectedRoom) {
            multiplayer.SendWebSocketMessage({type:"join_room", roomid:selectedRoom});
            document.getElementById('multiplayergameslist').disabled = true;
            document.getElementById('multiplayerjoin').disabled = true;
        }
        else {
            game.showMessageBox("Please selct a game room to join.");
        }
    },
    cancel: function() {
        if(multiplayer.roomId) {
            multiplayer.sendWebSocketMessage({type: "leave_room", roomId: multiplayer.roomId});
            document.getElementById('multiplayergameslist').disabled = false;
            document.getElementById('multiplayerjoin').disabled = false;
            delete multiplayer.roomId;
            delete multiplayer.color;
            return;
        }
        else {
            multiplayer.closeAndExit();
        }
    },
    closeAndExit: function() {
        multiplayer.websocket.onopen = null;
        multiplayer.websocket.onclose = null;
        multiplayer.websocket.onerror = null;
        multiplayer.websocket.close();

        document.getElementById('multiplayergameslist').disabled = false;
        document.getElementById('multiplayerjoin').disabled = false;

        $('.gamelayer').hide();
        $('#gamestartscreen').show();
    },
    sendWebSocketMessage: function(messageObject) {
        this.websocket.send(JSON.stringify(messageObject))
    },
    statusMessages: {
        'starting': 'Game Starting',
        'running': 'Game in Progress',
        'waiting': 'Awaiting second player',
        'empty': 'Open'
    },
    updateRoomStatus: function(status) {
        var $list = $("#multiplayergameslist");
        $list.empty();
        for (var i = 0; i < status.length; i++) {
            var key = "Game "+(i+1)+". "+this.statusMessages[status[i]];

            $list.append($("<option></option>").attr("disabled", status[i]=="running"||status[i]==
                "starting").attr("value", (i+1)).text(key).addClass(status[i]).attr("selected",
            (i+1)==multiplayer.roomId));
        }
    }
}