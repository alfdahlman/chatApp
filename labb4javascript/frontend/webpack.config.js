var path = require('path');

module.exports = {
    entry: './index.js',
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'eslint-loader'
            },
            {
                test: /\.js$/,
                loader: 'babel-loader',
                query: {
                    presets: ['env']
                }
            },
            {
                exclude: /node_modules/,
                loader: 'babel-loader',
                query: {
                    presets: ['env', 'react']
                },
                test: /\.jsx$/
            },
            {
                exclude: /node_modules/,
                test: /\.css/,
                use: [ 'style-loader', 'css-loader' ]
            }
        ]
    },
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname)
    }

};
