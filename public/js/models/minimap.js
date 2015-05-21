function MinimapModel() {
	this.localCoords = null;

	this.trackingSelf = true;

	asModel(this);

	var self = this;

	navigator.geolocation.watchPosition(function(pos) {
		self.localCoords = {lat: pos.coords.latitude, lng: pos.coords.longitude};
	}, function(err) {
		if(err.PERMISSION_DENIED) {
			alert('You must allow the app to see your location or it won\'t work');
		} else if(err.POSITION_UNAVAILABLE) {
			alert('Location information not available from this device.');
		} else if(err.TIMEOUT) {
			alert('Took too long to get location information.');
		} else {
			alert('Unknown error: ' + err);
		}
	}, {
		enableHighAccuracy: true,
		maximumAge: 0
	});
}
