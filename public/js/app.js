var roomname = location.pathname.split('/').pop();


var qrCodeView = new QRCodeView();

var iconTrayView = new IconTrayView();

var minimapView = new MinimapView('map');


var profileModel = new ProfileModel();

var minimapModel = new MinimapModel();

// TODO: Use a durable websocket standin
var stateRoomModel = new StateRoom(new WebSocket('ws://' + location.host + '/ws/' + roomname));


new MinimapPresenter(minimapView, iconTrayView, qrCodeView, minimapModel, stateRoomModel, profileModel);


// TODO
// When you first use the app, create a random profile icon for the user
// Add some icons to the site
// Use them as markers