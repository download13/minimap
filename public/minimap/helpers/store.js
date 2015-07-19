function asStore(a) {
	var handlers = [];

	a.onChange = function(fn) {
		if(handlers.indexOf(fn) !== -1) {
			throw new Error('Same callback registered twice: ' + fn);
		}

		handlers.push(fn);

		// Initialize
		fn();
	};

	a.emitChange = function() {
		handlers.forEach(function(handler) {
			handler();
		});
	};

	return a;
}


module.exports = asStore;
