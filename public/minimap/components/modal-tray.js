var dom = require('../helpers/dom');


module.exports = function() {
	var holder = dom.create('div');

	dom.css(holder, {
		display: 'inline'
	});

	var backdrop = dom.create('div');

	dom.css(backdrop, {
		display: 'none',
		background: 'rgba(0, 0, 0, 0.25)',
		position: 'fixed',
		top: 0,
		left: 0,
		width: '100%',
		height: '100%',
		justifyContent: 'center',
		alignItems: 'center'
	});

	dom.on(backdrop, 'click', hide);


	backdrop.appendChild(holder);
	document.body.appendChild(backdrop);


	function show() {
		dom.css(backdrop, {display: 'flex'});
	}

	function hide() {
		dom.css(backdrop, {display: 'none'});
	}


	return {
		holder: holder,
		show: show,
		hide: hide
	};
};
