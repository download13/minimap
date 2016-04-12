module.exports = [
	{
		entry: './client/index.js',
		output: {
			path: 'dist/public/js',
			filename: 'minimap.js'
		},
		module: {
			loaders: [
				{
					test: /\.js$/,
					loader: 'babel-loader',
					exclude: /node_modules/,
					query: {
						presets: ['babel-preset-es2015'],
						plugins: [
							'babel-plugin-syntax-jsx',
							'babel-plugin-transform-react-jsx',
							'babel-plugin-transform-object-rest-spread'
						]
					}
				}
			]
		}
	},
	{
		entry: './server/index.js',
		output: {
			path: 'dist',
			filename: 'server.js',
			libraryTarget: 'commonjs'
		},
		module: {
			loaders: [
				{
					test: /\.js$/,
					loader: 'babel-loader',
					exclude: /node_modules/,
					query: {
						presets: ['babel-preset-es2015']
					}
				}
			]
		},
		externals: [
			'express',
			'express-ws'
		],
		target: 'node'
	}
]
