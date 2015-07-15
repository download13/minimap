require('./style.css');


var $ = require('../../helpers/sprint');

var createModalTray = require('../modal-tray');


// TODO: Get this working with dispatcher instead
function IconTrayView(dispatcher, configStore, uiStore) {
	var self = this;

	var tray = self.tray = createModalTray();

	$(tray.holder).addClass('icontray');

	self._imgs = {};

	self._currentImg = null;

	self._dispatcher = dispatcher;


	self._setIcons(configStore.getAllIconUrls());

	configStore.on('self-icon', function(iconUrl) {
		self._setCurrentIcon(iconUrl);
	});

	uiStore.on('icon-tray', function(open) {
		if(open) {
			self.tray.show();
		} else {
			self.tray.hide();
		}
	});
}

IconTrayView.prototype._setIcons = function(urlList) {
	var self = this;

	var holder = $(self.tray.holder);

	holder.children().remove();

	self._imgs = {};

	var iconEls = urlList.map(function(url) {
		var img = $('<img>')
		.attr({src: url})
		.on('click', function() {
			self.hide();

			self._dispatcher.dispatch({type: 'icon-selected', iconUrl: url});
		});

		self._imgs[url] = img;

		return img;
	});

	holder.append(iconEls);
};

IconTrayView.prototype._setCurrentIcon = function(url) {
	if(this._currentImg) {
		$(this._currentImg).removeClass('selected');
	}

	this._currentImg = this._imgs[url];

	$(this._currentImg).addClass('selected');
};


module.exports = IconTrayView;
