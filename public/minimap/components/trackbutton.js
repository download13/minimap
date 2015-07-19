var dispatch = require('../dispatcher').dispatch;

var trackingSelfAction = require('../actions/tracking-self');

var mapStore = require('../stores/map');

var $ = require('../helpers/sprint');


function TrackButtonView() {
	var el = $('<button>')
	.css({
		display: 'none',
		width: '50px',
		height: '50px'
	})
	.html('<img title="Track Self" alt="Crosshair icon" src="/images/crosshair.png">')
	.on('click', function() {
		dispatch(trackingSelfAction(true));
	});

	mapStore.onChange(function() {
		el.css({display: mapStore.trackingSelf ? 'none' : 'block'});
	});

	this.el = el.get(0);
}


module.exports = TrackButtonView;
