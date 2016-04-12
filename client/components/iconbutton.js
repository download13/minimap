var dispatch = require('../dispatcher').dispatch;

var iconTrayAction = require('../actions/icon-tray');

var iconTrayStore = require('../stores/icon-selection-tray');

var $ = require('../helpers/sprint');


function IconButtonView() {
	var img = $('<img>')
	.attr({
		title: 'Change Marker',
		alt: 'Map marker icon'
	});

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
	.append(img)
	.on('click', function() {
		dispatch(iconTrayAction(true));
	});

	this.el = el.get(0);

	iconTrayStore.onChange(function(value, key) {
		if(key === 'selectedIconUrl') {
			img.get(0).src = value;
		}
	});
}


module.exports = IconButtonView;
