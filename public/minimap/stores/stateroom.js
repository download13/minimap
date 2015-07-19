var StateRoom = require('../helpers/stateroom');


var roomname = location.pathname.split('/').pop();

// TODO: Use a durable websocket standin
var ws = new WebSocket('ws://' + location.host + '/ws/' + roomname);


module.exports = new StateRoom(ws);
