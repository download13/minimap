var asEmitter = require('./helpers/emitter');


var DEBUG = false;

var emitter = asEmitter({});


module.exports = {
	dispatch: function(action) {
		if(DEBUG) {
			console.log('Action dispatched:', action);
		}

		emitter.emit(action.type, action);
	},
	register: function(actionType, fn) {
		emitter.on(actionType, fn);
	}
};
