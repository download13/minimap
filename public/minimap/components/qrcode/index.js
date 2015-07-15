require('./style.css');


var QRCode = require('../../helpers/qrcode.min.js');

var $ = require('../../helpers/sprint');

var createModalTray = require('../modal-tray');


function QRCodeView(uiStore) {
	var tray = createModalTray();

	$(tray.holder)
	.addClass('qrcode')
	.on('click', function() {
		tray.hide();
	});

	var qrcode = new QRCode(tray.holder);

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
