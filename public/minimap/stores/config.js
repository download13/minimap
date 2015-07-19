var dispatcher = require('../main').dispatcher;

var stateroom = require('../main').stateroom;

var asStore = require('../helpers/store');


var iconUrls = [
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


var configStore = asStore({
	getSelfIconUrl: function() {
		return localStorage.selfIconUrl;
	},
	availableIconUrls: iconUrls
});


// Initialize
if(!configStore.getSelfIconUrl()) {
	var iconIndex = Math.floor(Math.random() * iconUrls.length);

	setSelfIconUrlByIndex(iconIndex);
}

stateroom.set('i', configStore.getSelfIconUrl());

dispatcher.register(function(payload) {
	if(payload.type === 'icon-selected') {
		setSelfIconUrl(payload.url);
	}
});


function setSelfIconUrl(url) {
	localStorage.selfIconUrl = url;

	stateroom.set('i', url);

	configStore.emitChange();
}

function setSelfIconUrlByIndex(index) {
	setSelfIconUrl(iconUrls[iconIndex]);
}


module.exports = configStore;
