var asEmitter = require('../helpers/emitter.js');


function TrackButtonView() {
	asEmitter(this);

	var el = this.el = document.createElement('button');

	el.style.display = 'block';
	el.style.minWidth = '50px';
	el.style.minHeight = '50px';

	el.innerHTML = '<img title="Track Self" alt="Crosshair icon" src="/images/crosshair.png">';

	this.hide();

	var self = this;

	el.addEventListener('click', function() {
		self.emit('click');
	});
}

TrackButtonView.prototype.show = function() {
	this.el.style.display = 'block';
};

TrackButtonView.prototype.hide = function() {
	this.el.style.display = 'none';
};


module.exports = TrackButtonView;
