require('./style.css');


var dom = require('../../helpers/dom');

var createModalTray = require('../modal-tray');


// TODO: Get this working with dispatcher instead
function IconTrayView(dispatcher) {
	var tray = this.tray = createModalTray();

	dom.addClass(tray.holder, 'icontray');

	this._imgs = {};

	this._currentImg = null;

	this._dispatcher = dispatcher;
}

IconTrayView.prototype.show = function() {
	this.tray.show();
};

IconTrayView.prototype.hide = function() {
	this.tray.hide();
};

IconTrayView.prototype.setIcons = function(urlList) {
	var self = this;

	dom.remove(self.tray.holder);

	self._imgs = {};

	var iconEls = urlList.map(function(url) {
		var img = dom.create('img', {src: url});

		dom.on(img, 'click', function() {
			self.hide();

			self._dispatcher.dispatch({type: 'icon-selected', iconUrl: url});
		});

		self._imgs[url] = img;

		return img;
	});

	dom.append(self.tray.holder, iconEls);
};

IconTrayView.prototype.setCurrent = function(url) {
	if(this._currentImg) {
		dom.removeClass(this._currentImg, 'selected');
	}

	this._currentImg = this._imgs[url];

	dom.addClass(this._currentImg, 'selected');
};


module.exports = IconTrayView;
