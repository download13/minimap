var hasOwnProperty = Object.prototype.hasOwnProperty;


module.exports = function(a) {
	var items = Object.create(null);

	var addHandlers = [];
	var removeHandlers = [];

	function emitAdd(value, key, object) {
		addHandlers.forEach(function(handler) {
			handler(value, key, object);
		});
	}

	function emitRemove(value, key, object) {
		removeHandlers.forEach(function(handler) {
			handler(value, key, object);
		});
	}


	a.onChange = function(addFn, removeFn) {
		if(addHandlers.indexOf(addFn) !== -1) {
			throw new Error('Same add callback registered twice: ' + addFn);
		}

		if(removeHandlers.indexOf(removeFn) !== -1) {
			throw new Error('Same remove callback registered twice: ' + removeFn);
		}

		// Initialize
		each(items, addFn);
	};

	a.get = function(key) {
		return items[key];
	};

	a.has = function(key) {
		return hasOwnProperty.call(items, key)
	};

	a.set = function(key, value) {
		if(hasOwnProperty.call(items, key)) {
			var removed = items[key];

			delete items[key];

			emitRemove(removed, key, items);
		}

		items[key] = value;

		emitAdd(value, key, items);
	};

	a.delete = function(key) {
		var removed = items[key];

		delete items[key];

		emitRemove(removed, key, items);
	};

	a.forEach = each.bind(null, items);
};


function each(o, fn) {
	Object.keys(o).forEach(function(key) {
		fn(o[key], key, o);
	});
}
