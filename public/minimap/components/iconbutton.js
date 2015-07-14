var dom = require('../helpers/dom');


function IconButtonView(dispatcher) {
	var el = dom.create('button');

	dom.css(el, {
		display: 'block',
		width: '50px',
		height: '50px',
	});

	el.innerHTML = '<img title="Change Marker" alt="Map marker icon" src="/images/marker.png">';

	dom.on(el, 'click', function() {
		dispatcher.dispatch('icon-tray', 'open');
	});
}


module.exports = IconButtonView;
