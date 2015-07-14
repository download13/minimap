var asEmitter = require('../helpers/emitter.js');


function asModel(model) {
	asEmitter(model);

	var properties = Object.keys(model);

	properties.forEach(function(property) {
		var value = model[property];

		if(typeof value === 'function') return;

		Object.defineProperty(model, property, {
			get: function() {
				return value;
			},
			set: function(v) {
				var oldValue = value;

				value = v;

				this.emit(property, v, oldValue);

				this.emit('update', property, v, oldValue);
			}
		});
	});

	model.refresh = function() {
		properties.forEach(function(property) {
			model[property] = model[property];
		});
	};
}


module.exports = asModel;
