function QRCodeView() {
	var el = this.el = document.createElement('div');

	el.className = 'qrcode';

	this.qrcode = new QRCode(el);

	document.body.appendChild(el);

	var self = this;

	el.addEventListener('click', function() {
		self.hide();
	});
}

QRCodeView.prototype.show = function(url) {
	this.qrcode.makeCode(url);

	this.el.classList.add('showing');
};

QRCodeView.prototype.hide = function() {
	this.el.classList.remove('showing');
};
