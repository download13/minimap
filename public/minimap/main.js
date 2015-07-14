var QRCodeView = require('./components/qrcode');

var IconTrayView = require('./components/icontray');

var MinimapView = require('./components/minimap');

var ProfileModel = require('./models/profile');

var MinimapModel = require('./models/minimap');

var StateRoom = require('./models/stateroom');

var MinimapPresenter = require('./presenters/minimap');


var roomname = location.pathname.split('/').pop();


var qrCodeView = new QRCodeView();

var iconTrayView = new IconTrayView();

var minimapView = new MinimapView('map');


var profileModel = new ProfileModel();

var minimapModel = new MinimapModel();

// TODO: Use a durable websocket standin
var ws = new WebSocket('ws://' + location.host + '/ws/' + roomname);

var stateRoomModel = new StateRoom(ws);


new MinimapPresenter(minimapView, iconTrayView, qrCodeView, minimapModel, stateRoomModel, profileModel);


// TODO
// When you first use the app, create a random profile icon for the user
// Add some icons to the site
// Use them as markers
