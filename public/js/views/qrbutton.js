function QRButtonView() {
	asEmitter(this);

	var el = this.el = document.createElement('button');

	el.style.display = 'block';
	el.style.minWidth = '50px';
	el.style.minHeight = '50px';

	el.innerHTML = '<img title="QR Link" alt="QR code icon" src="/images/qrcode.png">';

	var self = this;

	el.addEventListener('click', function() {
		self.emit('click');
	});
}