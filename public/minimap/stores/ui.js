var asEmitter = require('../helpers/emitter');


function UIStore(dispatcher) {
	var self = this;

	asEmitter(self);


	self.iconTrayOpen = false;

	self.qrTrayOpen = false;

	self.trackingUser = true;


	dispatcher.register(function(payload) {
		switch(payload.type) {
		case 'icon-tray':
			self.iconTrayOpen = payload.open;
			self.emit('change');
			break;

		case 'qr-tray':
			self.qrTrayOpen = payload.open;
			self.emit('change');
			break;

		case 'track-user':
			self.trackingUser = payload.tracking;
			self.emit('change');
		}
	});
}


module.exports = UIStore;
