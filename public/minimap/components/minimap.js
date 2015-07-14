var TrackButtonView = require('./trackbutton.js');

var QRButtonView = require('./qrbutton.js');

var IconButtonView = require('./iconbutton.js');


function MinimapView(dispatcher, elementId, uiStore) {
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
}

MinimapView.prototype.ensureMarker = function(id, position) {
	if(!this._markers[id]) {
		this._markers[id] = new google.maps.Marker({
			position: position,
			map: this._map,
			title: id
		});
	}
};

MinimapView.prototype.setMarkerPosition = function(id, position) {
	this.ensureMarker(id, position);

	this._markers[id].setPosition(position);
};

MinimapView.prototype.setMarkerIcon = function(id, iconUrl) {
	this.ensureMarker(id, DEFAULT_MARKER_POSITION);

	this._markers[id].setIcon(iconUrl);
};

MinimapView.prototype.removeMarker = function(id) {
	this._markers[id].setMap(null);

	delete this._markers[id];
};

MinimapView.prototype.panTo = function(coords) {
	this._map.panTo(coords);
};


module.exports = MinimapView;
