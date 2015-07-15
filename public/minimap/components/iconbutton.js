var $ = require('../helpers/sprint');


function IconButtonView(dispatcher) {
	var el = $('<button>')
	.css({
		display: 'block',
		width: '50px',
		height: '50px'
	})
	.html('<img title="Change Marker" alt="Map marker icon" src="/images/marker.png">')
	.on('click', function() {
		dispatcher.dispatch({
			type: 'icon-tray',
			open: true,
			url: location.href
		});
	});

	this.el = el.get(0);
}


module.exports = IconButtonView;
