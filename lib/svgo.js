
// https://github.com/svg/svgo
const SVGO = require('svgo');

/**
 * @param {String} svgCode SVG code
 * @param {Number} floatPrecision Integer number
 * @returns {Promise<any>}
 */
module.exports = function(svgCode, floatPrecision) {
    const svgo = new SVGO({
        plugins: [
            { cleanupListOfValues: { floatPrecision: floatPrecision, leadingZero: false } },
            { cleanupNumericValues: { floatPrecision: floatPrecision, leadingZero: false } },
            { convertPathData: { floatPrecision: floatPrecision, transformPrecision: floatPrecision, leadingZero: false, makeArcs: false } },
            { convertColors: { shorthex: false, shortname: false } },
            { removeUnknownsAndDefaults: { unknownContent: false } },
            { convertShapeToPath: { convertArcs: true } },
            { mergePaths: false },
            { removeRasterImages: true },
            { removeStyleElement: true },
            { inlineStyles: { onlyMatchedOnce: false } },
            { removeScriptElement: true },
            { removeXMLNS: true },
            { removeViewBox: false },
            { moveGroupAttrsToElems: false },
            { moveElemsAttrsToGroup: false }
        ]
    });

    return new Promise((resolve, reject) => {
        svgo
            .optimize(svgCode, { input: 'string' })
            .then(result => resolve(result.data))
            .catch(err => reject(err));
    });
};
