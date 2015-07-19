var dispatch = require('../dispatcher').dispatch;

var qrTrayAction = require('../actions/qr-tray');

var $ = require('../helpers/sprint');


function QRButtonView(dispatcher) {
	var el = $('<button>')
	.css({
		display: 'block',
		width: '50px',
		height: '50px'
	})
	.html('<img title="QR Link" alt="QR code icon" src="/images/qrcode.png">')
	.on('click', function() {
		dispatch(qrTrayAction(true, location.href));
	});

	this.el = el.get(0);
}


module.exports = QRButtonView;
