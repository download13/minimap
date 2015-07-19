require('./style.css');


var dispatch = require('../../dispatcher').dispatch;

var qrTrayAction = require('../../actions/qr-tray');

var qrTrayStore = require('../../stores/qr-code-tray');

var QRCode = require('../../helpers/qrcode.min.js');

var $ = require('../../helpers/sprint');

var createModalTray = require('../modal-tray');


module.exports = function() {
	var tray = createModalTray()
	.on('backdrop-click', hideAction);

	$(tray.holder)
	.addClass('qrcode')
	.on('click', hideAction);

	function hideAction() {
		dispatch(qrTrayAction(false));
	}

	var qrcode = new QRCode(tray.holder);

	qrTrayStore.onChange(function() {
		// Only update the code if it's going to be seen
		if(qrTrayStore.open) {
			qrcode.makeCode(qrTrayStore.displayedUrl);
		}

		tray.setOpen(qrTrayStore.open);
	});
}
