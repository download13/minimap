var $ = require('../helpers/sprint');


function TrackButtonView(dispatcher, uiStore) {
	var el = $('<button>')
	.css({
		display: 'none',
		width: '50px',
		height: '50px'
	})
	.html('<img title="Track Self" alt="Crosshair icon" src="/images/crosshair.png">')
	.on('click', function() {
		dispatcher.dispatch({type: 'tracking-self', tracking: true});
	});

	uiStore.on('tracking-self', function(tracking) {
		if(tracking) {
			el.css({display: 'none'});
		} else {
			el.css({display: 'block'});
		}
	});
}


module.exports = TrackButtonView;
