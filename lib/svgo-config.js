
// https://github.com/svg/svgo
module.exports = function(floatPrecision) {
    return {
        info: {
            input: 'string'
        },
        plugins: [
            { cleanupListOfValues: { floatPrecision: floatPrecision, leadingZero: false } },
            { cleanupNumericValues: { floatPrecision: floatPrecision, leadingZero: false } },
            { convertPathData: { floatPrecision: floatPrecision, transformPrecision: floatPrecision, leadingZero: false, makeArcs: false, noSpaceAfterFlags: false, collapseRepeated: false } },
            { convertTransform: { floatPrecision: floatPrecision, transformPrecision: floatPrecision, leadingZero: false, collapseIntoOne: true } },
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
            { moveElemsAttrsToGroup: false }
        ]
    };
};
