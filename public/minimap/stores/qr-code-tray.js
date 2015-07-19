var dispatcher = require('../dispatcher');

var QR_TRAY_ACTION = require('../actions/qr-tray').type;

var asStore = require('../helpers/store');


var qrCodeTray = asStore({
	open: false,
	displayedUrl: 'about:blank'
});


dispatcher.register(QR_TRAY_ACTION, function(payload) {
	qrCodeTray.open = payload.open;

	if(payload.url) {
		qrCodeTray.displayedUrl = payload.url;
	}

	qrCodeTray.emitChange();
});


module.exports = qrCodeTray;
