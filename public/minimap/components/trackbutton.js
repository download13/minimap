function TrackButtonView(dispatcher) {
	var el = this.el = document.createElement('button');

	el.style.display = 'none';
	el.style.width = '50px';
	el.style.height = '50px';

	el.innerHTML = '<img title="Track Self" alt="Crosshair icon" src="/images/crosshair.png">';

	el.addEventListener('click', function() {
		dispatcher.dispatch({type: 'track-marker', status: true});
	});
}

TrackButtonView.prototype.show = function() {
	this.el.style.display = 'block';
};

TrackButtonView.prototype.hide = function() {
	this.el.style.display = 'none';
};


module.exports = TrackButtonView;
