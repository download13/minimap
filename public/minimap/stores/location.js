var asEmitter = require('../helpers/emitter');


function LocationStore(initialLatLng) {
	var self = this;

	asEmitter(self);

	self.latlng = initialLatLng || {lat: 0, lng: 0};

	navigator.geolocation.watchPosition(function(pos) {
		self.latlng = {lat: pos.coords.latitude, lng: pos.coords.longitude};

		self.emit('change');
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


module.exports = LocationStore;
