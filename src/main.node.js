const { optimize } = require('svgo');
const svg2vectordrawable = require('./svg-to-vectordrawable');
const svgoConfig = require('./svgo-config');
module.exports = function(svgCode, options) {
    let floatPrecision = options ? options.floatPrecision : 2;
    const result = optimize(svgCode, svgoConfig(floatPrecision));
    svgCode = result.data;
    return svg2vectordrawable(svgCode, options)
};