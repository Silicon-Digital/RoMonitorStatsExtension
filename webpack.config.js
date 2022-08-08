const path = require('path');

module.exports = {
    mode: 'development',
    entry: './src/romoext.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'romoext.bundle.js',
    },

    // Required to allow dev mode to not throw errors.
    devtool: 'cheap-module-source-map'
};