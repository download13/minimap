var stateroom = require('./stateroom');


var latlng = {lat: 0, lng: 0};


navigator.geolocation.watchPosition(function(pos) {
	setLatLng(pos.coords.latitude, pos.coords.longitude);
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


setLatLng(0, 0);


function setLatLng(lat, lng) {
	latlng.lat = lat;
	latlng.lng = lng;

	stateroom.set('p', JSON.stringify(latlng));
}
