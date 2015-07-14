function jsonml(ml) {
	if(typeof ml === 'string') {
		return document.createTextNode(ml);
	}

	if(!Array.isArray(ml)) {
		throw new Error('Must be array');
	}

	var name = ml.shift();

	var attributes = {};

	if(typeof ml[0] === 'object' && !Array.isArray(ml[0])) {
		attributes = ml.shift();
	}

	var el = document.createElement(name);

	Object.keys(attributes).forEach(function(attrName) {
		el.setAttribute(attrName, attributes[attrName]);
	});

	while(ml.length > 0) {
		var content = jsonml(ml.shift());

		el.appendChild(content);
	}

	return el;
}


module.exports = jsonml;
