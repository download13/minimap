var CMD_ADD_CLIENT = 0;
var CMD_REMOVE_CLIENT = 1;
var CMD_SET = 2;
var CMD_DELETE = 3;
var CMD_CLEAR = 4;


function StateRoomModel(wsUrl) {
	asEmitter(this);

	var ws = new WebSocket(wsUrl);

	this.id = null;

	this._localState = Object.create(null);

	this._members = Object.create(null);

	this._ws = ws;

	var self = this;

	ws.onopen = function() {
		self._flushLocalState();

		// A message comes from the server as JSON
		// [fromId, cmdCode, arguments]
		// [null, 0, ['bestIdInTheWorld']] adds a member with the id bestIdInTheWorld
		ws.onmessage = function(e) {
			try {
				var message = JSON.parse(e.data);
			} catch(err) {
				console.error('Invalid JSON sent from StateRoom server: ' + e.data);
				return;
			}

			var fromId = message[0];

			var cmd = message[1];

			var args = message[2];

			self._handleCmd(fromId, cmd, args);
		};
	};

	// TODO: Implement re-connect
	// Use the exp backoff thing
}

StateRoomModel.prototype.set = function(key, value) {
	this._localState[key] = value;

	if(this._ws.readyState === this._ws.OPEN) {
		this._flushLocalState();
	}
};

StateRoomModel.prototype._flushLocalState = function() {
	Object.keys(this._localState).forEach(function(key) {
		var value = this._localState[key];

		this._sendCmd(CMD_SET, [key, value]);

		delete this._localState[key];
	}, this);
};

StateRoomModel.prototype._sendCmd = function(cmd, args) {
	this._ws.send(JSON.stringify([cmd, args]));
};

StateRoomModel.prototype._handleCmd = function(fromId, cmd, args) {
	if(fromId) { // Member command
		switch(cmd) {
		case CMD_SET:
			this._cmdSet(fromId, args);
			break;

		case CMD_DELETE:
			this._cmdDelete(fromId, args);
			break;

		case CMD_CLEAR:
			this._cmdClear(fromId);
		}
	} else { // Room command
		switch(cmd) {
			case CMD_ADD_CLIENT:
				if(!this.id) { // This should be the first message it sees as a new member
					this.id = args[0];

					this.emit('ready');
				} else {
					this._addMember(args[0]);
				}
				break;

			case CMD_REMOVE_CLIENT:
				this._removeMember(args[0]);
		}
	}
};

StateRoomModel.prototype._addMember = function(id) {
	this._members[id] = Object.create(null);

	this.emit('join', id);
};

StateRoomModel.prototype._removeMember = function(id) {
	delete this._members[id];

	this.emit('part', id);
};

StateRoomModel.prototype._cmdSet = function(fromId, args) {
	var key = args[0];
	var value = args[1];

	this._members[fromId][key] = value;

	this.emit('set', key, value, fromId);
};

StateRoomModel.prototype._cmdDelete = function(fromId, args) {
	var key = args[0];

	var memberState = this._members[fromId];

	var oldValue = memberState[key];

	delete memberState[key];

	this.emit('delete', key, fromId, oldValue);
};

StateRoomModel.prototype._cmdClear = function(fromId) {
	this._members[fromId] = Object.create(null);

	this.emit('clear', fromId);
};