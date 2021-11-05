const { optimize } = require('svgo');
// const convert = require('xml-js');
const CSSselect = require("css-select");
const { Parser } = require("htmlparser2");
const { DomHandler } = require("domhandler");

module.exports = function(svgCode, options) {
    if (options == null) {
        options = {};
    }
    const floatPrecision = options.floatPrecision || 2;
    const strict = options.strict || false;
    const fillBlack = options.fillBlack || false;
    const xmlTag = options.xmlTag || false;
    const tint = options.tint;
    const optimizeSvg = optimize(svgCode, {
        plugins: [
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
                name: 'removeTitle'
            },
            {
                name: 'removeDesc'
            },
            {
                name: 'removeUselessDefs'
            },
            {
                name: 'removeXMLNS',
            },
            {
                name: 'removeEditorsNSData',
            },
            {
                name: 'removeEmptyAttrs',
            },
            {
                name: 'removeHiddenElems',
            },
            {
                name: 'removeEmptyText',
            },
            {
                name: 'removeEmptyContainers',
            },
            {
                name: 'removeViewBox',
                active: false
            },
            {
                name: 'cleanupEnableBackground',
            },
            {
                name: 'minifyStyles',
            },
            {
                name: 'convertStyleToAttrs',
                active: false
            },
            {
                name: 'convertColors',
                params: { shorthex: false, shortname: false }
            },
            {
                name: 'convertPathData',
                params: { floatPrecision: floatPrecision, transformPrecision: floatPrecision, leadingZero: false, makeArcs: false, noSpaceAfterFlags: false, collapseRepeated: false }
            },
            {
                name: 'convertTransform',
                active: false,
                // params: { convertToShorts: false, floatPrecision: floatPrecision, transformPrecision: floatPrecision, leadingZero: false, collapseIntoOne: true, matrixToTransform: false, shortTranslate: false, shortScale: false }
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
                name: 'removeUnusedNS',
            },
            {
                name: 'prefixIds',
            },
            {
                name: 'cleanupIDs',
                active: false
            },
            {
                name: 'cleanupNumericValues',
                params: { floatPrecision: floatPrecision, leadingZero: false }
            },
            {
                name: 'cleanupListOfValues',
                params: { floatPrecision: floatPrecision, leadingZero: false }
            },
            {
                name: 'moveElemsAttrsToGroup',
                active: false
            },
            {
                name: 'moveGroupAttrsToElems'
            },
            {
                name: 'collapseGroups'
            },
            {
                name: 'removeRasterImages',
            },
            {
                name: 'mergePaths',
                active: false
            },
            {
                name: 'convertShapeToPath',
                params: { convertArcs: true, floatPrecision: floatPrecision }
            },
            {
                name: 'convertEllipseToCircle',
            },
            {
                name: 'sortAttrs',
                active: false
            },
            {
                name: 'sortDefsChildren',
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
                name: 'addAttributesToSVGElement',
                active: false
            },
            {
                name: 'removeOffCanvasPaths',
            },
            {
                name: 'removeStyleElement',
            },
            {
                name: 'removeScriptElement',
            },
            {
                name: 'reusePaths',
                active: false
            }
        ]
    });
    return new Promise((resolve, reject) => {
        const handler = new DomHandler((error, dom) => {
            if (error) {
                reject(error);
            } else {
                // Parsing completed, do something
                console.log(optimizeSvg);
                let u = CSSselect.selectAll('path', dom);
                console.log(u);

                console.log(dom);
            }
        });
        const parser = new Parser(handler);
        parser.write(optimizeSvg.data);
        parser.end();
    });
    // const xmlObject = convert.xml2js(optimizeSvg.data, {
    //     // alwaysArray: true,
    //     // alwaysChildren: true,
    //     instructionHasAttributes: true
    // });
    // console.log(JSON.stringify(xmlObject, null, 2));

    // xmlObject
    // xmlObject.elements[0].name = 'vector';

    // console.log(CSSselect.selectAll('svg', xmlObject))

    // return new Promise((resolve, reject) => {


        // refactorData(xmlObject, floatPrecision, strict, fillBlack, tint);
        // let data = svg2js(svgCode);
        // if (data.error) {
        //     reject(data.error);
        // }
        // else {
        //     let xml = new JS2XML().convert(data, floatPrecision, strict, fillBlack, tint);
        //     if (xmlTag) {
        //         xml = '<?xml version="1.0" encoding="utf-8"?>\n' + xml;
        //     }
        //     resolve(xml);
        // }
    // });

    // 
    // console.log(optimizeSvg)

};