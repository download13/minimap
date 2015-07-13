function MinimapPresenter(minimapView, iconTrayView, qrCodeView, minimapModel, stateRoomModel, profileModel) {
	// Initialize the icon selector tray with all the options
	iconTrayView.setIcons(profileModel.getAllIcons());


	// View handlers - change models when the user does something
	// Stop tracking when the user looks at something else
	minimapView.on('usermove', function() {
		minimapModel.trackingSelf = false;

		minimapView.showTrackButton();
	});

	// Start tracking when the button is tapped
	minimapView.on('trackButtonClicked', function() {
		minimapModel.trackingSelf = true;

		minimapModel.refresh(); // To make localCoords emit an event

		minimapView.hideTrackButton();
	});

	// Open the QR code tray
	minimapView.on('qrButtonClicked', function() {
		qrCodeView.show(location.href);
	});

	// Open the icon selector
	minimapView.on('iconButtonClicked', function() {
		iconTrayView.show();
	});

	// When an icon is selected in the tray, change our settings
	iconTrayView.on('iconselected', function(iconUrl) {
		profileModel.iconUrl = iconUrl;
	});

	// Settings changes propagate to the UI
	profileModel.on('iconUrl', function(iconUrl) {
		stateRoomModel.set('i', iconUrl);

		iconTrayView.setCurrent(iconUrl);
	});
	profileModel.refresh();

	// When we move, update our position in the model
	minimapModel.on('localCoords', function(latlng) {
		stateRoomModel.set('p', JSON.stringify(latlng));
	});

	// When a member leaves, remove their marker on the map
	stateRoomModel.on('part', function(id) {
		minimapView.removeMarker(id);
	});

	stateRoomModel.on('set', function(memberId, key, value) {
		// When a member's position is updated, show it on the minimap
		if(key === 'p') { // Position
			var position = JSON.parse(value);

			minimapView.setMarkerPosition(memberId, position);

			if(stateRoomModel.id === memberId && minimapModel.trackingSelf) {
				minimapView.panTo(position);
			}
		} else if(key === 'i') { // Icon
			minimapView.setMarkerIcon(memberId, value);
		}
	});
}


module.exports = MinimapPresenter;
