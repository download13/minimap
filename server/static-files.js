var path = require('path');

var fileMw = require('file-mw');


var publicPath = path.resolve(__dirname, '..', 'public');

module.exports = fileMw(publicPath, {
	buffer: true,
	watch: true
	// TODO: Caching
});
