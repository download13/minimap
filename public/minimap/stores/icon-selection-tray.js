var dispatcher = require('../main').dispatcher;

var asStore = require('../helpers/store');


var iconTray = asStore({
	open: false
});


dispatcher.register(function(payload) {
	if(payload.type === 'icon-tray') {
		iconTray.open = payload.open;

		iconTray.emitChange();
	}
});


module.exports = iconTray;
