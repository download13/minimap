var dispatch = require('../dispatcher').dispatch;

var iconTrayAction = require('../actions/icon-tray');

var $ = require('../helpers/sprint');


function IconButtonView() {
	var el = $('<button>')
	.css({
		display: 'block',
		width: '50px',
		height: '50px',
		border: '4px black solid',
		borderRadius: '25px',
		background: 'white',
		padding: '4px 0 0 0',
		outline: 'none',
		margin: '8px'
	})
	.html('<img title="Change Marker" alt="Map marker icon" src="/images/marker.png">')
	.on('click', function() {
		dispatch(iconTrayAction(true));
	});

	this.el = el.get(0);
}


module.exports = IconButtonView;
