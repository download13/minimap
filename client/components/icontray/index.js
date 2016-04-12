import React from 'react';


const availableIcons = [
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
].map(name => ({name, url: `/icons/${name}.png`}));


export default ({iconPickerShowing, currentIcon, pickIcon}) => {
	return <div className={`icontray__holder ${iconPickerShowing ? 'showing' : ''}`} onClick={() => pickIcon(currentIcon)}>
		<div className="icontray">
			{ availableIcons.map(icon => {
				return <img
					className={icon.url === currentIcon ? 'selected' : ''}
					key={'icon_' + icon.name}
					src={icon.url}
					onClick={e => {
						e.stopPropagation();
						pickIcon(icon.url);
					}}
				/>
			}) }
		</div>
		<div className="icontray__bg" />
	</div>
}


function IconTrayView() {
	var self = this;

	var tray = self.tray = createModalTray()
	.on('backdrop-click', function() {
		dispatch(iconTrayAction(false));
	});

	$(tray.holder)
	.addClass('icontray')
	.on('click', function(e) {
		e.stopPropagation();
	});

	self._imgs = {};

	self._currentImg = null;


	self._setIcons(iconTrayStore.availableIconUrls);

	// TODO: Add a listener to the modal-tray and find out when it's been clicked, then emit a close action

	iconTrayStore.onChange(function(value, key) {
		switch(key) {
		case 'open':
			self.tray.setOpen(value);
			break;

		case 'selectedIconUrl':
			self._setCurrentIcon(value);
		}
	});
}

IconTrayView.prototype._setIcons = function(urlList) {
	var self = this;

	var holder = $(self.tray.holder);

	holder.children().remove();

	self._imgs = {};

	var iconElements = urlList.map(function(url) {
		return self._imgs[url] =
			$('<img>')
			.attr({src: url})
			.on('click', function(e) {
				dispatch(iconSelectedAction(url));

				// Looks nicer with a slight delay before closing
				setTimeout(function() {
					dispatch(iconTrayAction(false));
				}, 50);
			});
	});

	holder.append(iconElements);
};

IconTrayView.prototype._setCurrentIcon = function(url) {
	var currentImage = this._currentImg;

	if(currentImage) {
		currentImage.removeClass('selected');
	}

	this._currentImg = currentImage = this._imgs[url];

	currentImage.addClass('selected');
};
