var stateroom = require('../main').stateroom;

var createMapStore = require('../helpers/mapstore');

var asStore = require('../helpers/store');


var users = createMapStore({
	getMemberIcon: function(id) {
		stateroom.get('i', id);
	}
});


stateroom.on('join', function(memberId) {
	var user = asStore({id: memberId});

	if(memberId === stateroom.id) {
		user.isSelf = true;
	}

	users.set(memberId, user);
});

stateroom.on('set', function(memberId, key, value) {
	var user = users.get(memberId);

	// When a member's position is updated, show it on the minimap
	switch(key) {
		case 'p': // Position
			user.position = JSON.parse(value);
			break;

		case 'i': // Icon
			user.iconUrl = value;
	}

	user.emitChange();
});

stateroom.on('part', function(memberId) {
	users.delete(memberId);
});


module.exports = users;
