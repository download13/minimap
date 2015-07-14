var asEmitter = require('../helpers/emitter');


function UIStore(dispatcher) {
	var self = this;

	asEmitter(self);


	dispatcher.register(function(payload) {
		switch(payload.type) {
		case 'icon-tray':
			self.emit('icon-tray', payload.open);
			break;

		case 'qr-tray':
			self.emit('qr-tray', payload.open, payload.url);
			break;

		case 'tracking-self':
			self.emit('tracking-self', payload.tracking);
		}
	});
}


module.exports = UIStore;
