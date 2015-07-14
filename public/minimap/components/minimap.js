var asEmitter = require('../helpers/emitter.js');

var TrackButtonView = require('./trackbutton.js');

var QRButtonView = require('./qrbutton.js');

var IconButtonView = require('./iconbutton.js');


var DEFAULT_MARKER_POSITION = {lat: 38.152369, lng: -129.458013};


function MinimapView(elementId, defaultPosition) {
	asEmitter(this);

	this._trackButtonView = new TrackButtonView();

	this._qrButtonView = new QRButtonView();

	this._iconButtonView = new IconButtonView();

	this._map = new google.maps.Map(document.getElementById(elementId), {
		zoom: 20,
		center: defaultPosition,
		disableDefaultUI: true,
		// TODO Can we enable the scale control but set a min-max?
		mapTypeControl: true
	});

	this._map.controls[google.maps.ControlPosition.BOTTOM_LEFT].push(this._iconButtonView.el);
	this._map.controls[google.maps.ControlPosition.BOTTOM_LEFT].push(this._qrButtonView.el);
	this._map.controls[google.maps.ControlPosition.BOTTOM_LEFT].push(this._trackButtonView.el);

	this._markers = {};

	var self = this;

	this._iconButtonView.on('click', function() {
		self.emit('iconButtonClicked');
	});

	this._qrButtonView.on('click', function() {
		self.emit('qrButtonClicked');
	});

	this._trackButtonView.on('click', function() {
		self.emit('trackButtonClicked');
	});

	google.maps.event.addListener(this._map, 'drag', function() {
		self.emit('usermove');
	});
}

MinimapView.prototype.hideTrackButton = function() {
	this._trackButtonView.hide();
};

MinimapView.prototype.showTrackButton = function() {
	this._trackButtonView.show();
};

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
