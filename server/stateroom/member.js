var uuidv4 = require('uuid-v4');

var EventEmitter = require('events').EventEmitter;


function Member(client) {
	EventEmitter.call(this);

	this.id = uuidv4();

	this.state = new Map();

	this.client = client;

	var self = this;
	client.on('message', msg => {
		try {
			msg = JSON.parse(msg);
		} catch(e) {}

		if(Array.isArray(msg)) {
			self.emit('cmd', msg[0], msg[1]);
		}
	});
}

Member.prototype = Object.create(EventEmitter.prototype);

Member.prototype.set = function(key, value) {
	this.state.set(key, value);
};

Member.prototype.delete = function(key) {
	this.state.delete(key);
};

Member.prototype.clear = function() {
	this.state.clear();
};

Member.prototype.sendCmd = function(from, cmd, args) {
	this.client.send(JSON.stringify([from, cmd, args]));
};


module.exports = Member;
