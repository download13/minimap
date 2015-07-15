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
	.on('click', hide)
	.append(holder)
	.appendTo(document.body);


	function show() {
		backdrop.css({display: 'flex'});
	}

	function hide() {
		backdrop.css({display: 'none'});
	}


	return {
		holder: holder.get(0),
		show: show,
		hide: hide
	};
};
