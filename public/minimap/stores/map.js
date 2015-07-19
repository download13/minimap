var dispatcher = require('../main').dispatcher;

var asStore = require('../helpers/store');


var map = asStore({
	trackingSelf: true
});


dispatcher.register(function(payload) {
	if(payload.type === 'tracking-self') {
		map.trackingSelf = payload.tracking;

		map.emitChange();
	}
});


module.exports = map;
