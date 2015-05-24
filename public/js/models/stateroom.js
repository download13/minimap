(function() {
	var CMD_ADD_CLIENT = 0;
	var CMD_REMOVE_CLIENT = 1;
	var CMD_SET = 2;
	var CMD_DELETE = 3;
	var CMD_CLEAR = 4;


	function StateRoomClient(ws) {
		asEmitter(this);


		this.id = null;

		this._localState = Object.create(null);

		this._ws = ws;


		var self = this;

		ws.onopen = function() {
			self._members = Object.create(null);

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
	}

	StateRoomClient.prototype.set = function(key, value) {
		var valueType = typeof value;

		if(valueType !== 'string' && valueType !== 'number') {
			throw new Error('Value must be a string or number');
		}

		this._localState[key] = value;

		this._flushLocalState();
	};

	StateRoomClient.prototype.delete = function(key) {
		if(key in this._localState) {
			this._localState[key] = undefined;
		}

		this._flushLocalState();
	};

	StateRoomClient.prototype.clear = function() {
		this._localState = Object.create(null);

		this._sendCmd(CMD_CLEAR);
	};

	StateRoomClient.prototype._flushLocalState = function() {
		if(this._ws.readyState !== this._ws.OPEN) return;

		Object.keys(this._localState).forEach(function(key) {
			var value = this._localState[key];

			if(value === undefined) {
				this._sendCmd(CMD_DELETE, [key]);
			} else {
				this._sendCmd(CMD_SET, [key, value]);
			}

			delete this._localState[key];
		}, this);
	};

	StateRoomClient.prototype._sendCmd = function(cmd, args) {
		this._ws.send(JSON.stringify([cmd, args]));
	};

	StateRoomClient.prototype._handleCmd = function(fromId, cmd, args) {
		if(fromId) { // Member command
			switch(cmd) {
			case CMD_SET:
				this._setProperty(fromId, args);
				break;

			case CMD_DELETE:
				this._deleteProperty(fromId, args);
				break;

			case CMD_CLEAR:
				this._members[fromId] = Object.create(null);

				this.emit('clear', fromId);
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

	StateRoomClient.prototype._addMember = function(id) {
		this._members[id] = Object.create(null);

		this.emit('join', id);
	};

	StateRoomClient.prototype._removeMember = function(id) {
		delete this._members[id];

		this.emit('part', id);
	};

	StateRoomClient.prototype._setProperty = function(fromId, args) {
		var key = args[0];
		var value = args[1];

		this._members[fromId][key] = value;

		this.emit('set', fromId, key, value);
	};

	StateRoomClient.prototype._deleteProperty = function(fromId, args) {
		var key = args[0];

		var memberState = this._members[fromId];

		var oldValue = memberState[key];

		delete memberState[key];

		this.emit('delete', fromId, key, oldValue);
	};


	window.StateRoom = StateRoomClient;


	function asEmitter(obj) {
		var handlers = {};

		obj.on = on;
		obj.off = off;
		obj.emit = emit;

		function on(name, fn) {
			if(!handlers[name]) {
				handlers[name] = [];
			}

			handlers[name].push(fn);

			return this;
		}

		function off(name, fn) {
			var handlerList = handlers[name];

			if(handlerList) {
				if(fn) {
					var pos = handlerList.indexOf(fn);

					if(pos !== -1) {
						handlerList.splice(pos, 1);
					}
				} else {
					delete handlers[name];
				}
			}

			return this;
		}

		function emit(name) {
			var args = [].slice.call(arguments, 1);

			var handlerList = handlers[name];

			if(handlerList) {
				handlerList.forEach(function(handler) {
					handler.apply(null, args);
				});
			}

			return this;
		}
	}
})();