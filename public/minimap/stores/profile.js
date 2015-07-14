var asEmitter = require('../helpers/emitter');


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


function ProfileStore(dispatcher) {
	var self = this;

	asEmitter(self);

	self._initstate();

	dispatcher.register(function(payload) {
		if(payload.type === 'icon-selected') {
			self._setIconUrl(payload.iconUrl);
		}
	});
}

ProfileStore.prototype.getAllIconUrls = function() {
	return iconUrls;
};

ProfileStore.prototype._initstate = function() {
	if(!this.getIconUrl()) {
		var iconIndex = Math.floor(Math.random() * iconUrls.length);

		this._setIconUrl(iconUrls[iconIndex]);
	}
};

ProfileStore.prototype.getIconUrl = function() {
	return localStorage.iconUrl;
};

ProfileStore.prototype._setIconUrl = function(iconUrl) {
	localStorage.iconUrl = iconUrl;

	this.emit('change');
};


module.exports = ProfileStore;
