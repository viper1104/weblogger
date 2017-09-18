const webpack = require('webpack');
const UglifyJsPlugin = webpack.optimize.UglifyJsPlugin;
const DefinePlugin = webpack.DefinePlugin;
const path = require('path');

module.exports = function (env) {
	const plugins = [];
	let outputFile;
	if (env === 'build') {
		plugins.push(new UglifyJsPlugin({
			ie8: false,
			minimize: true,
			output: {
				comments: false,
				beautify: false,
			},
			warnings: false
		}));
		plugins.push(new DefinePlugin({
			'process.env': {
				'NODE_ENV': JSON.stringify('production'),
			}
		}));
		outputFile = 'web-logger.min.js';
	} else {
		outputFile = 'web-logger.js';
		
	}
	
	return {
		entry: __dirname + '/index.js',
		output: {
			path: __dirname + '/dist',
			filename: outputFile,
			libraryTarget: "umd",
		},
		module: {
			rules: [
				{
					test: /\.js|\.jsx$/,
					exclude: /node_modules/,
					use: {
						loader: 'babel-loader',
						options: {
							presets: ['env']
						}
					}
				},
				{
					test: /\.less/,
					exclude: /node_modules/,
					use: [
						'style-loader',
						{
							loader: 'css-loader',
							options: {minimize: true, modules: true},
						},
						'postcss-loader',
						'less-loader',
					],
				},
			]
		},
		resolve: {
			modules: [path.resolve('./node_modules'), path.resolve('./src')],
			extensions: ['.js', '.jsx', '.less']
		},
		plugins: plugins
	};
};
