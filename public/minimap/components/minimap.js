var TrackButtonView = require('./trackbutton.js');

var QRButtonView = require('./qrbutton.js');

var IconButtonView = require('./iconbutton.js');


function MinimapView(dispatcher, elementId, uiStore, roomStore) {
	var self = this;

	var trackButton = new TrackButtonView(dispatcher, uiStore);

	var qrButton = new QRButtonView(dispatcher);

	var iconButton = new IconButtonView(dispatcher);

	var map = this._map = new google.maps.Map(document.getElementById(elementId), {
		zoom: 20,
		center: {lat: 0, lng: 0},
		disableDefaultUI: true,
		// TODO Can we enable the scale control but set a min-max?
		mapTypeControl: true
	});

	map.controls[google.maps.ControlPosition.BOTTOM_LEFT].push(iconButton.el);
	map.controls[google.maps.ControlPosition.BOTTOM_LEFT].push(qrButton.el);
	map.controls[google.maps.ControlPosition.BOTTOM_LEFT].push(trackButton.el);

	this._markers = {};


	google.maps.event.addListener(map, 'drag', function() {
		dispatcher.dispatch({type: 'tracking-self', tracking: false});
	});

	roomStore.on('remove', function(id) {
		self._markers[id].setMap(null);

		delete self._markers[id];
	});

	roomStore.on('user-position', function(latlng, memberId, isSelf) {
		if(!self._markers[memberId]) {
			self._markers[memberId] = new google.maps.Marker({
				position: latlng,
				map: map,
				title: memberId,
				icon: roomStore.getMemberIcon(memberId)
			});
		}

		self._markers[id].setPosition(position);

		if(isSelf && uiStore.trackingSelf) {
			map.panTo(position);
		}
	});

	roomStore.on('user-icon', function(iconUrl, memberId) {
		if(self._markers[memberId]) {
			self._markers[memberId].setIcon(iconUrl);
		}
	});
}


module.exports = MinimapView;
