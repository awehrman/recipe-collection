require('dotenv').config();
const webpack = require('webpack');
const withCSS = require('@zeit/next-css');

module.exports = withCSS({
	webpack: (config) => {
		config.plugins.push(new webpack.EnvironmentPlugin(process.env));
		config.module.rules.push({
			test: /\.(eot|woff|woff2|ttf|svg|png|jpg|gif)$/,
			use: {
				loader: 'url-loader',
				options: {
					limit: 100000,
					name: '[name].[ext]',
				},
			},
		});
		return config;
	},
});
