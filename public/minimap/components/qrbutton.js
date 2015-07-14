var dom = require('../helpers/dom');


function QRButtonView(dispatcher) {
	var el = dom.create('button');

	dom.css(el, {
		display: 'block',
		width: '50px',
		height: '50px'
	});

	el.innerHTML = '<img title="QR Link" alt="QR code icon" src="/images/qrcode.png">';

	dom.on(el, 'click', function() {
		dispatcher.dispatch({type: 'qr-tray', open: true});
	});
}


module.exports = QRButtonView;
