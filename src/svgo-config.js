// SVGO plugins config
module.exports = function(floatPrecision = 2) {
    const svgoConfig = {
        info: {
            input: 'string'
        },
        plugins: [
            {
                name: 'removeDoctype'
            },
            {
                name: 'removeXMLProcInst'
            },
            {
                name: 'removeComments'
            },
            {
                name: 'removeMetadata'
            },
            {
                name: 'removeEditorsNSData',
            },
            {
                name: 'cleanupAttrs'
            },
            {
                name: 'mergeStyles'
            },
            {
                name: 'inlineStyles',
                params: { onlyMatchedOnce: false }
            },
            {
                name: 'minifyStyles',
            },
            {
                name: 'cleanupIDs',
                active: false
            },
            {
                name: 'removeUselessDefs'
            },
            {
                name: 'cleanupNumericValues',
                params: { floatPrecision: floatPrecision, leadingZero: false }
            },
            {
                name: 'convertColors',
                params: { shorthex: false, shortname: false }
            },
            {
                name: 'removeUnknownsAndDefaults',
                params: { unknownContent: false, unknownAttrs: false }
            },
            {
                name: 'removeNonInheritableGroupAttrs',
            },
            {
                name: 'removeUselessStrokeAndFill',
            },
            {
                name: 'removeViewBox',
                active: false
            },
            {
                name: 'cleanupEnableBackground',
            },
            {
                name: 'removeHiddenElems',
            },
            {
                name: 'removeEmptyText',
            },
            {
                name: 'convertShapeToPath',
                params: { convertArcs: true, floatPrecision: floatPrecision }
            },
            {
                name: 'convertEllipseToCircle',
            },
            {
                name: 'moveElemsAttrsToGroup',
                active: false
            },
            {
                name: 'moveGroupAttrsToElems',
            },
            {
                name: 'collapseGroups'
            },
            {
                name: 'convertPathData',
                params: { floatPrecision: floatPrecision, transformPrecision: floatPrecision, leadingZero: false, makeArcs: false, noSpaceAfterFlags: false, collapseRepeated: false }
            },
            {
                name: 'convertTransform',
            },
            {
                name: 'removeEmptyAttrs',
            },
            {
                name: 'removeEmptyContainers',
            },
            {
                name: 'mergePaths',
                active: false
            },
            {
                name: 'removeUnusedNS',
            },
            {
                name: 'sortDefsChildren',
            },
            {
                name: 'removeTitle'
            },
            {
                name: 'removeDesc'
            },
            {
                name: 'removeXMLNS',
                active: false
            },
            {
                name: 'removeRasterImages'
            },
            {
                name: 'cleanupListOfValues',
                params: { floatPrecision: floatPrecision, leadingZero: false }
            },
            {
                name: 'sortAttrs',
                active: false
            },
            {
                name: 'convertStyleToAttrs',
                active: false
            },
            {
                name: 'prefixIds',
                active: false
            },
            {
                name: 'removeDimensions',
                active: false
            },
            {
                name: 'removeAttrs',
                active: false
            },
            {
                name: 'removeAttributesBySelector',
                active: false
            },
            {
                name: 'removeElementsByAttr',
                active: false
            },
            {
                name: 'addClassesToSVGElement',
                active: false
            },
            {
                name: 'removeStyleElement',
                active: false
            },
            {
                name: 'removeScriptElement',
                active: false
            },
            {
                name: 'addAttributesToSVGElement',
                active: false
            },
            {
                name: 'removeOffCanvasPaths',
                active: false
            },
            {
                name: 'reusePaths',
                active: false
            },
        ]
    };
    return svgoConfig;
}