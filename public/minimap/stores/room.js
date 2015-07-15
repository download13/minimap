var asEmitter = require('../helpers/emitter');

var StateRoom = require('../helpers/stateroom');


function RoomStore(dispatcher, stateroom) {
	var self = this;

	asEmitter(self);

	self.stateroom = stateroom;


	stateroom.on('set', function(memberId, key, value) {
		// When a member's position is updated, show it on the minimap
		if(key === 'p') { // Position
			var position = JSON.parse(value);

			self.emit('user-position', position, memberId, stateroom.id === memberId);
		} else if(key === 'i') { // Icon
			self.emit('user-icon', value, memberId);
		}
	});

	stateroom.on('part', function(id) {
		self.emit('remove', id);
	});
}

RoomStore.prototype.getMemberIcon = function(id) {
	return this.stateroom.get('i', id);
};


module.exports = RoomStore;
