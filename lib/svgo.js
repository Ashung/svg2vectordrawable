
// https://github.com/svg/svgo
const SVGO = require('svgo');

const info = {
    input: 'string'
};

function config(floatPrecision) {
    return {
        plugins: [
            { cleanupListOfValues: { floatPrecision: floatPrecision, leadingZero: false } },
            { cleanupNumericValues: { floatPrecision: floatPrecision, leadingZero: false } },
            { convertPathData: { floatPrecision: floatPrecision, transformPrecision: floatPrecision, leadingZero: false, makeArcs: false } },
            { convertTransform: { floatPrecision: floatPrecision, transformPrecision: floatPrecision, leadingZero: false } },
            { convertColors: { shorthex: false, shortname: false } },
            { removeUnknownsAndDefaults: { unknownContent: false, unknownAttrs: false } },
            { convertShapeToPath: { convertArcs: true } },
            { mergePaths: false },
            { cleanupIDs: false },
            { removeRasterImages: true },
            { removeStyleElement: true },
            { inlineStyles: { onlyMatchedOnce: false } },
            { removeScriptElement: true },
            { removeXMLNS: true },
            { removeViewBox: false },
            { removeOffCanvasPaths: true },
            { moveGroupAttrsToElems: false },
            { moveElemsAttrsToGroup: false }
        ]
    };
}

/**
 * @param {String} svgCode SVG code
 * @param {Number} floatPrecision Integer number
 * @returns {Promise<any>}
 */
function svgOptimize(svgCode, floatPrecision) {
    const svgo = new SVGO(config(floatPrecision));
    return new Promise((resolve, reject) => {
        svgo
            .optimize(svgCode, info)
            .then(result => resolve(result.data))
            .catch(err => reject(err));
    });
}

module.exports.config = config;
module.exports.info = info;
module.exports.svgOptimize = svgOptimize;
