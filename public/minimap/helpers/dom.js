function create(name, attributes) {
	var el = document.createElement(name);

	if(attributes) {
		attr(el, attributes);
	}

	return el;
}

function attr(el, name) {
	if(typeof name === 'string') {
		return el.getAttribute(name);
	}

	var attributes = name;

	if(typeof attributes !== 'object') {
		throw new Error('dom.attr takes a string or object, not: ' + name);
	}

	Object.keys(attributes).forEach(function(name) {
		el.setAttribute(name, attributes[name]);
	});
}

function append(refEl, el) {
	if(Array.isArray(el)) {
		return el.forEach(function(el) {
			refEl.appendChild(el);
		}, this);
	}

	refEl.appendChild(el);
}



module.exports = {
	$: function(selector, context) {
		return (context || document).querySelector(selector);
	},
	,
	,
	,
	remove: function(refEl, el) {
		if(el) { // Remove one
			refEl.removeChild(el);
		} else { // Or remove all
			while(refEl.firstChild) {
				refEl.removeChild(refEl.firstChild);
			}
		}
	},

	// Styles
	addClass: function(el, className) {
		el.classList.add(className);
	},
	removeClass: function(el, className) {
		el.classList.remove(className);
	},
	css: function(el, styles) {
		Object.keys(styles).forEach(function(property) {
			el.style[property] = styles[property];
		});
	},

	// Events
	on: function(el, eventName, fn, capture) {
		el.addEventListener(eventName, fn, capture);
	},
	off: function(el, eventName, fn, capture) {
		el.removeEventListener(eventName, fn, capture);
	},
	once: function(el, eventName, fn, capture) {
		var self = this;

		self.on(el, eventName, handle, capture);

		function handle() {
			self.off(el, eventName, handle, capture);

			fn.apply(this, arguments);
		}
	}
};
