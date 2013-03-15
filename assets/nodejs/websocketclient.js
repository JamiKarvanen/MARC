/**
 * Created with JetBrains WebStorm.
 * User: jami
 * Date: 22.1.2013
 * Time: 19:13
 * To change this template use File | Settings | File Templates.
 */
var websocket;
var serverUrl = "ws://koodi.plop.fi:8080/";

function displayMessage(message) {
    document.getElementById("displaydiv").innerHTML += message + "<br>";
}

function initWebSocket() {
    var WebSocketObject = window.WebSocket || window.MozWebSocket;

    if(WebSocketObject) {
        websocket = new WebSocketObject(serverUrl);

        websocket.onopen = function() {
            displayMessage("WebSocket Connection Opened");
            document.getElementById("sendmessage").disabled = false;
        }

        websocket.onclose = function() {
            displayMessage("WebSocket Connection Closed");
            document.getElementById("sendmessage").disabled = true;
        }

        websocket.onerror = function() {
            displayMessage("Connection Error Ocurred");
        }

        websocket.onmessage = function(message) {
            displayMessage("Received Message: <i>"+message.data+"</i>");
        }

    }
    else {
        displayMessage("Your Browser does not support WebSockets");
    }
}

function SendMessage() {
    if (websocket.readyState = websocket.OPEN) {
        var message = document.getElementById("message").value;
        displayMessage("Sending message: <i>"+message+"</i>");
        websocket.send(message);
    }
    else {
        displayMessage("cannot send message. The WebSocket connection isn't open");
    }
}
