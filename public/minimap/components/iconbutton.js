var asEmitter = require('../helpers/emitter.js');


function IconButtonView(dispatcher) {
	var el = document.createElement('button');

	el.style.display = 'block';
	el.style.minWidth = '50px';
	el.style.minHeight = '50px';

	el.innerHTML = '<img title="Change Marker" alt="Map marker icon" src="/images/marker.png">';

	el.addEventListener('click', function() {
		dispatcher.dispatch('open-icon-tray');
	});
}


module.exports = IconButtonView;
