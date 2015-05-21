// var DEATH_STAR_POSITION = {lat: 38.5430268, lng: -121.7479138};

var qrCodeView = new QRCodeView();

var iconTrayView = new IconTrayView();

var minimapView = new MinimapView('map');


var profileModel = new ProfileModel();

var minimapModel = new MinimapModel();

var stateRoomModel = new StateRoomModel('ws://' + location.hostname + location.pathname);


new MinimapPresenter(minimapView, iconTrayView, qrCodeView, minimapModel, stateRoomModel, profileModel);


// TODO
// When you first use the app, create a random profile icon for the user
// Add some icons to the site
// Use them as markers