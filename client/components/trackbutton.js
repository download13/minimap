var dispatch = require('../dispatcher').dispatch;

var trackingSelfAction = require('../actions/tracking-self');

var mapStore = require('../stores/map');

var $ = require('../helpers/sprint');


function TrackButtonView() {
	var el = $('<button>')
	.css({
		display: 'none',
		width: '50px',
		height: '50px',
		border: '4px black solid',
		borderRadius: '25px',
		background: 'white',
		padding: '2px 0 0 0',
		outline: 'none',
		margin: '8px'
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
