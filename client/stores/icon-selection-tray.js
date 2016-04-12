var dispatcher = require('../dispatcher');

var stateroom = require('./stateroom');

var ICON_TRAY_ACTION = require('../actions/icon-tray').type;

var ICON_SELECTED_ACTION = require('../actions/self-icon-selected').type;

var asMapStore = require('../helpers/mapstore');

var configStore = require('./config');


var availableIconUrls = [
	'alligator',
	'ant',
	'bat',
	'bear',
	'bee',
	'bird',
	'blackcock',
	'butterfly',
	'camel',
	'cat',
	'chicken',
	'cow',
	'deer',
	'dog',
	'dolphin',
	'dragon',
	'dragonfly',
	'duck',
	'eggs',
	'elephant',
	'emu',
	'fox',
	'frog',
	'giraffe',
	'hare',
	'kangaroo',
	'leopard',
	'lobster',
	'monkey',
	'moose',
	'oyster',
	'paw',
	'penguin',
	'pig',
	'seal',
	'sealion',
	'shark',
	'snail',
	'snake',
	'spider',
	'squirrel',
	'tiger',
	'turtle',
	'whale'
].map(function(name) {return '/icons/' + name + '.png'});



var iconTray = asMapStore({
	availableIconUrls: availableIconUrls
});

iconTray.set('open', false);

// Initialize
var selfIconUrl = configStore.get('selfIconUrl');

if(!selfIconUrl) {
	var iconIndex = Math.floor(Math.random() * availableIconUrls.length);

	selfIconUrl = availableIconUrls[iconIndex];
}

setSelfIconUrl(selfIconUrl);


dispatcher.register(ICON_TRAY_ACTION, function(payload) {
	iconTray.set('open', payload.open);
});

dispatcher.register(ICON_SELECTED_ACTION, function(payload) {
	setSelfIconUrl(payload.iconUrl);
});


function setSelfIconUrl(url) {
	configStore.set('selfIconUrl', url);

	stateroom.set('i', url);

	iconTray.set('selectedIconUrl', url);
}


module.exports = iconTray;
