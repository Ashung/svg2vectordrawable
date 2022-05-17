const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
    mode: 'production',
    optimization: {
        minimizer: [new TerserPlugin({
            extractComments: false,
        })],
    },
    entry: './src/main.browser.js',
    output: {
        libraryTarget: 'umd',
        library: 'svg2vectordrawable',
        filename: 'svg-to-vectordrawable.browser.umd.js',
        path: path.resolve(__dirname, 'dist')
    }
}