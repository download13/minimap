var WebSocketServer = require('ws').Server;

var StateRoom = require('stateroom');


var stateRoomHub = new StateRoomHub();


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

		client.on('close', () => stateRoomHub.part(client, roomname));
		client.on('error', () => stateRoomHub.part(client, roomname));

		stateRoomHub.join(client, roomname);
	});
};


function roomnameFromUrl(url) {
	if(!url) {
		url = '';
	}

	return url.split('/').pop();
}


function StateRoomHub() {
	this.rooms = new Map();
}

StateRoomHub.prototype.join = function(client, roomname) {
	var rooms = this.rooms;

	if(!rooms.has(roomname)) {
		rooms.set(roomname, new StateRoom());
	}

	rooms.get(roomname).addClient(client);
};

StateRoomHub.prototype.part = function(client, roomname) {
	var room = this.rooms.get(roomname);

	room.removeClient(client);

	if(room.isEmpty()) {
		this.rooms.delete(roomname);
	}
};
