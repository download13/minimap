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
		dispatcher.dispatch({type: 'qr-tray', open: true});
	});
}


module.exports = QRButtonView;
