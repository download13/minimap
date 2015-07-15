var StateRoom = require('./helpers/stateroom');

var Dispatcher = require('flux').Dispatcher;

var QRCodeView = require('./components/qrcode');

var IconTrayView = require('./components/icontray');

var MinimapView = require('./components/minimap');

var ConfigStore = require('./stores/config');

var UIStore = require('./stores/ui');

var LocationStore = require('./stores/location');

var RoomStore = require('./stores/room');


var roomname = location.pathname.split('/').pop();


var dispatcher = new Dispatcher();

// TODO: Use a durable websocket standin
var ws = new WebSocket('ws://' + location.host + '/ws/' + roomname);

var stateroom = new StateRoom(ws);



// Stores
var configStore = new ConfigStore(dispatcher);

var uiStore = new UIStore(dispatcher);

var locationStore = new LocationStore(stateroom);

var roomStore = new RoomStore(dispatcher, stateroom);


// Components
new QRCodeView(uiStore);

new IconTrayView(dispatcher, configStore, uiStore);

new MinimapView(dispatcher, 'map', uiStore, roomStore);
