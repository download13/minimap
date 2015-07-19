var dispatcher = require('../dispatcher');

var TRACKING_SELF_ACTION = require('../actions/tracking-self').type;

var asStore = require('../helpers/store');


var map = asStore({
	trackingSelf: true
});


dispatcher.register(TRACKING_SELF_ACTION, function(payload) {
	map.trackingSelf = payload.trackingSelf;

	map.emitChange();
});


module.exports = map;
