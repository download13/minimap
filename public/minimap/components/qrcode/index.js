require('./style.css');


var QRCode = require('../../helpers/qrcode.min.js');

var dom = require('../../helpers/dom');

var createModalTray = require('../modal-tray');


function QRCodeView() {
	var self = this;

	var tray = self.tray = createModalTray();

	dom.addClass(tray.holder, 'qrcode');

	self.qrcode = new QRCode(tray.holder);

	dom.on(tray.holder, 'click', function() {
		self.hide();
	});
}

QRCodeView.prototype.show = function(url) {
	this.qrcode.makeCode(url);

	this.tray.show();
};

QRCodeView.prototype.hide = function() {
	this.tray.hide();
};


module.exports = QRCodeView;
