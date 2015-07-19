var asEmitter = require('../helpers/emitter');

var $ = require('../helpers/sprint');


module.exports = function() {
	var holder = $('<div>')
	.css({
		display: 'inline'
	});

	var backdrop = $('<div>')
	.css({
		display: 'none',
		background: 'rgba(0, 0, 0, 0.25)',
		position: 'fixed',
		top: 0,
		left: 0,
		width: '100%',
		height: '100%',
		justifyContent: 'center',
		alignItems: 'center'
	})
	.on('click', function() {
		r.emit('backdrop-click');
	})
	.append(holder)
	.appendTo(document.body);


	var r = asEmitter({
		holder: holder.get(0),
		setOpen: function(open) {
			backdrop.css({display: open ? 'flex' : 'none'});
		}
	});

	return r;
};
