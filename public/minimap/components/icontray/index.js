require('./style.css');


var dom = require('../../helpers/dom');

var createModalTray = require('../modal-tray');


// TODO: Get this working with dispatcher instead
function IconTrayView(dispatcher, configStore, uiStore) {
	var self = this;

	var tray = self.tray = createModalTray();

	dom.addClass(tray.holder, 'icontray');

	self._imgs = {};

	self._currentImg = null;

	self._dispatcher = dispatcher;


	self._setIcons(configStore.getAllIconUrls());

	configStore.on('self-icon', function(iconUrl) {
		self._setCurrentIcon(iconUrl);
	});

	uiStore.on('icon-tray', function(open) {
		if(open) {
			this.tray.show();
		} else {
			this.tray.hide();
		}
	});
}

IconTrayView.prototype._setIcons = function(urlList) {
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

IconTrayView.prototype._setCurrentIcon = function(url) {
	if(this._currentImg) {
		dom.removeClass(this._currentImg, 'selected');
	}

	this._currentImg = this._imgs[url];

	dom.addClass(this._currentImg, 'selected');
};


module.exports = IconTrayView;
