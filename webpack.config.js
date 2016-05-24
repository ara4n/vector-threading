var path = require('path');
var webpack = require('webpack');

module.exports = {
    module: {
        preLoaders: [
            { test: /\.js$/, loader: "source-map-loader" }
        ],
        loaders: [
            { test: /\.json$/, loader: "json" },
            {
                test: /\.js$/,
                loader: "babel",
                query: {
                    presets: ['es2015', 'react', 'stage-0'],
                    "plugins": [
                        "add-module-exports",
                        "transform-object-assign"
                    ]
                },
                include: path.resolve('./src')
            },
        ],
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify(process.env.NODE_ENV)
            }
        }),
    ],
    devtool: 'source-map',
};
