const webpack = require('webpack');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const DefinePlugin = webpack.DefinePlugin;
const path = require('path');

module.exports = function (env) {
	const plugins = [];
	let outputFile;
	if (env === 'build') {
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
		mode: env === 'build' ? 'production' : 'development',
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
					}
				},
				{
					test: /\.less/,
					exclude: /node_modules/,
					use: [
						'style-loader',
						{
							loader: 'css-loader',
							options: {modules: true},
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
		plugins: plugins,
		optimization: {
			minimize: env === 'build',
			minimizer: [new UglifyJsPlugin({
				exclude: /polyfill/,
				cache: true,
				parallel: true,
				uglifyOptions: {
					mangle: true,
					warnings: false,
					ie8: false,
					compress: {
						unsafe: true,
					},
					output: {
						comments: false,
					},
				},
			}),],
			splitChunks: {name: false},
		},
	};
};
