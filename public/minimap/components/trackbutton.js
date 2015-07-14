function TrackButtonView(dispatcher, uiStore) {
	var el = document.createElement('button');

	el.style.display = 'none';
	el.style.width = '50px';
	el.style.height = '50px';

	el.innerHTML = '<img title="Track Self" alt="Crosshair icon" src="/images/crosshair.png">';

	el.addEventListener('click', function() {
		dispatcher.dispatch({type: 'tracking-self', tracking: true});
	});

	uiStore.on('tracking-self', function(tracking) {
		if(tracking) {
			el.style.display = 'none';
		} else {
			el.style.display = 'block';
		}
	});
}


module.exports = TrackButtonView;
