var dispatcher = require('../main').dispatcher;

var asStore = require('../helpers/store');


var qrCodeTray = asStore({
	open: false,
	displayedUrl: 'about:blank'
});


dispatcher.register(function(payload) {
	if(payload.type === 'qr-tray') {
		qrCodeTray.open = payload.open;

		if(payload.url) {
			qrCodeTray.displayedUrl = payload.url;
		}

		qrCodeTray.emitChange();
	}
});


module.exports = qrCodeTray;
