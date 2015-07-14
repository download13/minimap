require('./style.css');


var QRCode = require('../../helpers/qrcode.min.js');

var dom = require('../../helpers/dom');

var createModalTray = require('../modal-tray');


function QRCodeView(uiStore) {
	var self = this;

	var tray = self.tray = createModalTray();

	dom.addClass(tray.holder, 'qrcode');

	var qrcode = new QRCode(tray.holder);


	dom.on(tray.holder, 'click', function() {
		self.hide();
	});

	uiStore.on('qr-tray', function(open, url) {
		if(open) {
			qrcode.makeCode(url);

			tray.show();
		} else {
			tray.hide();
		}
	});
}


module.exports = QRCodeView;
