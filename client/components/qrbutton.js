var dispatch = require('../dispatcher').dispatch;

var qrTrayAction = require('../actions/qr-tray');

var $ = require('../helpers/sprint');


function QRButtonView(dispatcher) {
	var img = $('<img>')
	.attr({
		title: 'QR Link',
		alt: 'QR code icon',
		src: '/images/qrcode.png'
	})
	.css({
		maxWidth: '30px',
	});

	var el = $('<button>')
	.css({
		display: 'block',
		width: '50px',
		height: '50px',
		border: '4px black solid',
		borderRadius: '25px',
		background: 'white',
		padding: '0',
		outline: 'none',
		margin: '8px'
	})
	.append(img)
	.on('click', function() {
		dispatch(qrTrayAction(true, location.href));
	});

	this.el = el.get(0);
}


module.exports = QRButtonView;
