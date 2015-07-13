var asEmitter = require('../helpers/emitter.js');


function IconButtonView() {
	asEmitter(this);

	var el = this.el = document.createElement('button');

	el.style.display = 'block';
	el.style.minWidth = '50px';
	el.style.minHeight = '50px';

	el.innerHTML = '<img title="Change Marker" alt="Map marker icon" src="/images/marker.png">';

	var self = this;

	el.addEventListener('click', function() {
		self.emit('click');
	});
}


module.exports = IconButtonView;
