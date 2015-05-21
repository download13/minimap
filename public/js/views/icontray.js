function IconTrayView() {
	asEmitter(this);

	var el = this.el = document.createElement('div');

	el.className = 'icontray';

	document.body.appendChild(el);

	this._imgs = {};

	this._currentImg = null;
}

IconTrayView.prototype.show = function() {
	this.el.classList.add('showing');
};

IconTrayView.prototype.hide = function() {
	this.el.classList.remove('showing');
};

IconTrayView.prototype.setIcons = function(urlList) {
	while(this.el.firstChild) {
		this.el.removeChild(this.el.firstChild);
	}

	this._imgs = {};

	var self = this;

	urlList.forEach(function(url) {
		var img = new Image();

		img.src = url;

		img.addEventListener('click', function() {
			self.hide();

			self.emit('iconselected', url);
		});

		self._imgs[url] = img;

		self.el.appendChild(img);
	});
};

IconTrayView.prototype.setCurrent = function(url) {
	if(this._currentImg) {
		this._currentImg.classList.remove('selected');
	}

	this._currentImg = this._imgs[url];

	this._currentImg.classList.add('selected');
};
