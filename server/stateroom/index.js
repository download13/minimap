var Member = require('./member');


var CMD_ADD_CLIENT = 0;
var CMD_REMOVE_CLIENT = 1;
var CMD_SET = 2;
var CMD_DELETE = 3;
var CMD_CLEAR = 4;
var CMD_SET_ID = 5; // Only sent from server to client

/*
StateRoom acts like a chatroom, but stores state about each member.
The state is kept synchronized by clients only making requests to change state.
Their state only changes once the server validates the request and sends an update command down to all clients.
*/
function StateRoom() {
	this.members = new Map();
}

StateRoom.prototype.join = function(client) {
	var clientMember = new Member(client);

	// New member joins
	this.members.set(client, clientMember);

	// Tell current members about theis new one
	// The newbie also learns it's own name the first time it hears it
	this.members.forEach(member => {
		member.sendCmd(null, CMD_ADD_CLIENT, [clientMember.id]);
	});

	// Newbie's initial state is blank
	// Send commands to bring it up to the current state
	this.members.forEach(member => {
		// Tell it about the existing members
		clientMember.sendCmd(null, CMD_ADD_CLIENT, [member.id]);

		// And about the state of the existing members
		member.state.forEach((v, k) => {
			clientMember.sendCmd(member.id, CMD_SET, [k, v]);
		});
	});

	// Start handling commands from new member
	var self = this;
	clientMember.on('cmd', (cmd, args) => {
		self.handleMemberCmd(clientMember, cmd, args);
	});
};

StateRoom.prototype.part = function(client) {
	var partedMember = this.members.get(client);

	this.members.delete(client);

	this.members.forEach(member => {
		member.sendCmd(null, CMD_REMOVE_CLIENT, [partedMember.id]);
	});
};

StateRoom.prototype.isEmpty = function() {
	return this.members.size === 0;
};

StateRoom.prototype.handleMemberCmd = function(memberFrom, cmd, args) {
	var applied = false;

	switch(cmd) {
	case CMD_SET:
		if(args.length === 2) {
			memberFrom.set(args[0], args[1]);

			applied = true;
		}
		break;

	case CMD_DELETE:
		if(args.length === 1) {
			memberFrom.delete(args[0]);

			applied = true;
		}
		break;

	case CMD_CLEAR:
		if(args.length === 0) {
			memberFrom.clear();

			applied = true;
		}
	}

	// Once applied, tell every client to execute this command on their state machines as well
	if(applied) {
		this.members.forEach(member => {
			member.sendCmd(memberFrom.id, cmd, args);
		});
	}
};


module.exports = StateRoom;
