var dispatch = require('../dispatcher').dispatch;

var trackingSelfAction = require('../actions/tracking-self');

var usersStore = require('../stores/users');

var mapStore = require('../stores/map');

var TrackButtonView = require('./trackbutton.js');

var QRButtonView = require('./qrbutton.js');

var IconButtonView = require('./iconbutton.js');


function MinimapView(elementId) {
	var trackButton = new TrackButtonView();

	var qrButton = new QRButtonView();

	var iconButton = new IconButtonView();

	var mapElement = document.getElementById(elementId);

	var map = new google.maps.Map(mapElement, {
		zoom: 20,
		center: {lat: 0, lng: 0},
		disableDefaultUI: true,
		// TODO Can we enable the scale control but set a min-max?
		mapTypeControl: true
	});

	map.controls[google.maps.ControlPosition.BOTTOM_LEFT].push(iconButton.el);
	map.controls[google.maps.ControlPosition.BOTTOM_LEFT].push(qrButton.el);
	map.controls[google.maps.ControlPosition.BOTTOM_LEFT].push(trackButton.el);


	// Whenever the map is manually moved stop tracking our marker
	google.maps.event.addListener(map, 'drag', function() {
		dispatch(trackingSelfAction(false));
	});


	// Keep the map markers in sync with the users in our room
	var selfMarker = null;

	var markers = {};

	usersStore.onChange(function(user) { // Add
		var marker = markers[user.id] = new google.maps.Marker({
			position: user.position,
			map: map,
			title: user.id,
			icon: user.iconUrl
		});

		if(user.isSelf) {
			selfMarker = marker;
		}

		user.onChange(function() {
			marker.setPosition(user.position);

			if(user.isSelf && mapStore.trackingSelf) {
				map.panTo(user.position);
			}

			marker.setIcon(user.iconUrl);
		});
	}, function(user) { // Remove
		markers[user.id].setMap(null);

		delete markers[user.id];
	});

	mapStore.onChange(function() {
		if(mapStore.trackingSelf && selfMarker) {
			map.panTo(selfMarker.getPosition());
		}
	});
}


module.exports = MinimapView;
