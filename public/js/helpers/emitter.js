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