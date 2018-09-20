
// https://github.com/svg/svgo
const SVGO = require('svgo');

module.exports = function(svgstr) {
    const svgo = new SVGO({
        plugins: [
            { cleanupListOfValues: { floatPrecision: 2, leadingZero: false } },
            { cleanupNumericValues: { floatPrecision: 2, leadingZero: false } },
            { convertPathData: { floatPrecision: 2, leadingZero: false } },
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
            .optimize(svgstr, { input: 'string' })
            .then(result => resolve(result.data))
            .catch(err => reject(err));
    });
};
