var path = require('path');


module.exports = {
	entry: __dirname + '/main.js',
	module: {
		loaders: [
			{test: /\.css$/, loaders: ['style-loader', 'css-loader']}
		]
	},
	output: {
		path: path.resolve(__dirname + '/../build'),
		filename: 'minimap.js',

	},
	devtool: 'source-map'
};
