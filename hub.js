var WebSocketServer = require('ws').Server;

var Stateroom = require('./stateroom');


var rooms = new Map();

function join(client, roomname) {
	if(!rooms.has(roomname)) {
		rooms.set(roomname, new Stateroom());
	}

	var room = rooms.get(roomname);

	room.join(client);
}

function part(client, roomname) {
	var room = rooms.get(roomname);

	room.part(client);

	if(room.isEmpty()) {
		rooms.delete(roomname);
	}
}


function roomnameFromUrl(url) {
	if(!url) {
		url = '';
	}

	return url.split('/').pop();
}


module.exports = function(server) {
	var wss = new WebSocketServer({
		server: server,
		clientTracking: false
	});

	wss.on('connection', function(client) {
		var roomname = roomnameFromUrl(client.upgradeReq.url);

		if(!roomname) {
			client.close();
			return;
		}

		client.on('close', () => part(client, roomname));
		client.on('error', () => part(client, roomname));

		join(client, roomname);
	});
};