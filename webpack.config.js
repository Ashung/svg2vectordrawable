const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
    mode: 'production',
    optimization: {
        minimizer: [new TerserPlugin({
            extractComments: false,
        })],
    },
    entry: './src/svg-to-vectordrawable.js',
    output: {
        libraryTarget: 'umd',
        library: 'svg2vectordrawable',
        filename: 'svg-to-vectordrawable.bundle.js',
        path: path.resolve(__dirname, 'dist')
    }
}