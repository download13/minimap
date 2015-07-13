var asModel = require('../helpers/model.js');


var iconUrls = [
	'alligator.png',
	'ant.png',
	'bat.png',
	'bear.png',
	'bee.png',
	'bird.png',
	'blackcock.png',
	'butterfly.png',
	'camel.png',
	'cat.png',
	'chicken.png',
	'cow.png',
	'deer.png',
	'dog.png',
	'dolphin.png',
	'dragon.png',
	'dragonfly.png',
	'duck.png',
	'eggs.png',
	'elephant.png',
	'emu.png',
	'fox.png',
	'frog.png',
	'giraffe.png',
	'hare.png',
	'kangaroo.png',
	'leopard.png',
	'lobster.png',
	'monkey.png',
	'moose.png',
	'oyster.png',
	'paw.png',
	'penguin.png',
	'pig.png',
	'seal.png',
	'sealion.png',
	'shark.png',
	'snail.png',
	'snake.png',
	'spider.png',
	'squirrel.png',
	'tiger.png',
	'turtle.png',
	'whale.png'
].map(function(n) {return '/icons/' + n});


function ProfileModel() {
	this.iconUrl = null;

	asModel(this);

	// Update localStorage with value changes
	this.on('iconUrl', function(iconUrl) {
		localStorage.iconUrl = iconUrl;
	});

	if(this._getIconStorage()) {
		this.iconUrl = this._getIconStorage();
	} else {
		this._ensureIcon();
	}
}

ProfileModel.prototype.getAllIcons = function() {
	return iconUrls;
};

ProfileModel.prototype._ensureIcon = function() {
	if(this._getIconStorage()) {
		this.iconUrl = this._getIconStorage();
	} else {
		var iconIndex = Math.floor(Math.random() * iconUrls.length);

		this.iconUrl = iconUrls[iconIndex];
	}
};

ProfileModel.prototype._getIconStorage = function() {
	return localStorage.iconUrl;
};

ProfileModel.prototype._setIconStorage = function(iconUrl) {
	localStorage.iconUrl = iconUrl;

	this.iconUrl = iconUrl;
};


module.exports = ProfileModel;
