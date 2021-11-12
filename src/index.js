const { optimize } = require('svgo');
const svgpath = require('svgpath');
const Select = require('css-select');
const { Parser, DomUtils, DomHandler } = require('htmlparser2');
// const { DomHandler } = require('domhandler');
const { hasAttrib, getAttributeValue, getChildren, appendChild } = DomUtils;

const WIDTH = 24;
const HEIGHT = 24;
const VIEWPORT_WIDTH = 24;
const VIEWPORT_HEIGHT = 24;
const INDENT = 4;
const INDENT_LEVEL = 0;
let indentLevel = 0;

// https://developer.android.com/reference/android/graphics/drawable/VectorDrawable
const VECTORDRAWABLE_TAGS = [
    // Android vs SVG
    'vector', // svg
    'group', // g
    'path', // path, rect, circle, polygon, ellipse, polyline, line
    'clip-path', // mask
    'aapt:attr',
    'gradient', // linearGradient, radialGradient
    'item' // stop
];
const VECTORDRAWABLE_ATTRS = [
    // Android vs SVG
    'android:name', // id
    // <Vector>
    'xmlns:aapt',
    'android:width', // width
    'android:height', // height
    'android:viewportWidth', 'android:viewportHeight', // viewBox
    'android:tint',
    'android:tintMode',
    'android:autoMirrored',
    'android:alpha',
    // <group>
    'android:rotation', // transform="rotate(<a> [<x> <y>])"
    'android:pivotX',
    'android:pivotY',
    'android:scaleX', // transform="scale(<x> [<y>])"
    'android:scaleY',
    'android:translateX', // transform="translate(<x> [<y>])"
    'android:translateY',
    // <path>
    'android:pathData', // d
    'android:fillColor', // fill
    'android:fillAlpha', // fill-opacity 0..1
    'android:strokeColor', // stroke
    'android:strokeWidth', // stroke-width
    'android:strokeAlpha', // stroke-opacity
    'android:trimPathStart',
    'android:trimPathEnd',
    'android:trimPathOffset',
    'android:strokeLineCap', // stroke-linecap butt, round, square. Default is butt.
    'android:strokeLineJoin', // stroke-linejoin miter, round, bevel. Default is miter.
    'android:strokeMiterLimit', // stroke-miterlimit Default is 4.
    'android:fillType', // fill-rule For SDK 24+, evenOdd, nonZero. Default is nonZero.
    // aapt
    'name',
    'xmlns:aapt',
    // gradient
    'android:type', // linear, radial, sweep
    'android:startX', // x1
    'android:startY', // y1
    'android:endX', // x2
    'android:endY', // y2
    'android:centerX', // cx
    'android:centerY', // cy
    'android:gradientRadius', // r
    'android:startColor', // not support
    'android:centerColor', // not support
    'android:endColor', // not support
    'android:tileMode', // not support, disabled, clamp, repeat, mirror
    // gradient stop
    'android:color', // stop-color
    'android:offset' // offset
];

function refactorData(dom, floatPrecision, fillBlack, tint) {

    // Rounded rect to path, SVGO does not convert round rect to paths.
    const elemRects = Select.selectAll('rect', dom);
    elemRects.forEach(elem => {
        elem.name = 'path';
        let x = hasAttrib(elem, 'x') ? parseFloat(getAttributeValue(elem, 'x')) : 0;
        let y = hasAttrib(elem, 'y') ? parseFloat(getAttributeValue(elem, 'y')) : 0;
        let width = hasAttrib(elem, 'width') ? parseFloat(getAttributeValue(elem, 'width')) : 0;
        let height = hasAttrib(elem, 'height') ? parseFloat(getAttributeValue(elem, 'height')) : 0;
        let rx = 0;
        let ry = 0;
        // see spec here: https://www.w3.org/TR/SVG11/shapes.html#RectElement
        if (hasAttrib(elem, 'rx') && hasAttrib(elem, 'ry')) {
            rx = parseFloat(getAttributeValue(elem, 'rx'));
            ry = parseFloat(getAttributeValue(elem, 'ry'));
        }
        else if (hasAttrib(elem, 'rx')) {
            rx = parseFloat(getAttributeValue(elem, 'rx'));
            ry = rx;
        }
        else if (hasAttrib(elem, 'ry')) {
            ry = parseFloat(getAttributeValue(elem, 'ry'));
            rx = ry;
        }
        x = round(x, floatPrecision);
        y = round(y, floatPrecision);
        width = round(width, floatPrecision);
        height = round(height, floatPrecision);
        rx = round(rx, floatPrecision);
        ry = round(ry, floatPrecision);
        let pathData = rectToPathData(x, y, width, height, rx, ry);
        // Android 8- have a bug when drawing rounded rectangle with arc code in path data.
        if (rx !== 0 || ry !== 0) {
            pathData = svgpath(pathData).unarc().rel().round(floatPrecision).toString();
        }

        // Apply transform to rect.
        if (hasAttrib('transform')) {
            const svgTransform = getAttributeValue(elem, 'transform');
            const number = '((?:-)?\\d+(?:\\.\\d+)?)';
            const separator = '(?:(?:\\s+)|(?:\\s*,\\s*))';
            const translateRegExp = new RegExp(`translate\\(${number}${separator}?${number}?\\)`);
            const scaleRegExp = new RegExp(`scale\\(${number}${separator}?${number}?\\)`);
            const rotateRegExp = new RegExp(`rotate\\(${number}${separator}?${number}?${separator}?${number}?\\)`);
            const translateMatch = translateRegExp.exec(svgTransform);
            const scaleMatch = scaleRegExp.exec(svgTransform);
            const rotateMatch = rotateRegExp.exec(svgTransform);
            if (rotateMatch) {
                const angle = parseFloat(rotateMatch[1]);
                const rx = parseFloat(rotateMatch[2]) || 0;
                const ry = parseFloat(rotateMatch[3]) || 0;
                pathData = svgpath(pathData).rotate(angle, rx, ry).rel().round(floatPrecision).toString();
            }
            if (scaleMatch) {
                const sx = parseFloat(scaleMatch[1]);
                const sy = parseFloat(scaleMatch[2]) || sx;
                pathData = svgpath(pathData).scale(sx, sy).rel().round(floatPrecision).toString();
            }
            if (translateMatch) {
                const x = parseFloat(translateMatch[1]);
                const y = parseFloat(translateMatch[2]) || 0;
                pathData = svgpath(pathData).translate(x, y).rel().round(floatPrecision).toString();
            }
        }
        addAttr(elem, 'd', pathData);
    });

    // svg tag to vector
    const elemSVG = Select.selectOne('svg', dom);
    if (elemSVG) {
        elemSVG.name = 'vector';
        let width = WIDTH;
        let height = HEIGHT;
        let viewportWidth = VIEWPORT_WIDTH;
        let viewportHeight = VIEWPORT_HEIGHT;
        if (hasAttrib(elemSVG, 'width') && hasAttrib(elemSVG, 'height')) {
            width = parseInt(getAttributeValue(elemSVG, 'width'));
            height = parseInt(getAttributeValue(elemSVG, 'height'));
        }
        if (hasAttrib(elemSVG, 'viewBox')) {
            const [x, y, w, h] = getAttributeValue(elemSVG, 'viewBox').split(/\s+/);
            viewportWidth = w;
            viewportHeight = h;
            if (!hasAttrib(elemSVG, 'width') && !hasAttrib(elemSVG, 'height')) {
                width = w;
                height = h;
            }   
        }
        // SVG is not support sweep (angular) gradient
        if (Select.selectAll('linearGradient, radialGradient, sweepGradient', dom).length > 0) {
            addAttr(elemSVG, 'xmlns:aapt', 'http://schemas.android.com/aapt');
        }
        elemSVG.attribs = {};
        addAttr(elemSVG, 'android:width', width + 'dp');
        addAttr(elemSVG, 'android:height', height + 'dp');
        addAttr(elemSVG, 'android:viewportWidth', viewportWidth + '');
        addAttr(elemSVG, 'android:viewportHeight', viewportHeight + '');
        // Tint color
        if (tint) {
            if (/^#[A-F0-9]{1,8}$/i.test(tint)) {
                tint = tint.toUpperCase();
            }
            addAttr(elemSVG, 'android:tint', tint);
        }
    }

    // Tag gradient

    
    // Tag mask to clip-path


    // Tag path
    const elemPaths = Select.selectAll('path', dom);
    elemPaths.forEach(elem => {
        // Fill
        if (hasAttrib(elem, 'fill')) {
            let value = getAttributeValue(elem, 'fill');
            if (!/^url\(#.*\)$/.test(value) && value !== 'none') {
                let color = svgHexToAndroid(value);
                if (hasAttrib(elem, 'fill-opacity')) {
                    color = mergeColorAndOpacity(color, getAttributeValue(elem, 'fill-opacity'));
                    removeAttr(elem, 'fill-opacity');
                }
                addAttr(elem, 'android:fillColor', color);
                removeAttr(elem, 'fill');
            }
        }
        // Fill black?
        else if (fillBlack) {
            addAttr(elem, 'android:fillColor', '#FF000000');
        }

        // Opacity, Android not support path/group alpha
        if (hasAttrib(elem, 'opacity')) {
            addAttr(elem, 'android:fillAlpha', getAttributeValue(elem, 'opacity'));
        }

        // Tag stroke
        if (hasAttrib(elem, 'stroke')) {
            let value = getAttributeValue(elem, 'stroke');
            if (!/^url\(#.*\)$/.test(value) && value !== 'none') {
                let color = svgHexToAndroid(value);
                if (hasAttrib(elem, 'stroke-opacity')) {
                    color = mergeColorAndOpacity(color, getAttributeValue(elem, 'stroke-opacity'));
                    removeAttr(elem, 'stroke-opacity');
                }
                addAttr(elem, 'android:strokeColor', color);
                removeAttr(elem, 'stroke');
            }
            if (hasAttrib(elem, 'opacity')) {
                addAttr(elem, 'android:strokeAlpha', getAttributeValue(elem, 'opacity'))
            }
            // SVG stroke-width default is 1, Android android:strokeWidth default is 0
            let strokeWidth = 0;
            if (!hasAttrib(elem, 'stroke-width')) {
                strokeWidth = 1;
            }
            else {
                strokeWidth = getAttributeValue(elem, 'stroke-width');
                removeAttr(elem, 'stroke-width');
            }
            addAttr(elem, 'android:strokeWidth', strokeWidth);
            let strokeExtraAttrs = ['stroke-linecap', 'stroke-linejoin', 'stroke-miterlimit'];
            let strokeExtraAttrsAndroid = ['strokeLineCap', 'strokeLineJoin', 'strokeMiterLimit'];
            strokeExtraAttrs.forEach((attr, index) => {
                if (hasAttrib(elem, attr)) {
                    addAttr(elem, 'android:' + strokeExtraAttrsAndroid[index], getAttributeValue(elem, attr));
                    removeAttr(elem, attr)

                    // let localName = strokeExtraAttrsAndroid[index];
                    // elem.addAttr({ name: 'android:' + localName, value: elem.attr(attr).value, prefix: 'android', local: localName });
                    // elem.removeAttr('attr');
                }
            });
        }

        // // Opacity, Android not support path/group alpha
        // if (elem.hasAttr('opacity')) {
        //     elem.removeAttr('opacity');
        // }
        // // Fill-rule
        // elem.removeAttr('fill-rule', 'nonzero');
        // if (elem.hasAttr('fill-rule', 'evenodd')) {
        //     elem.addAttr({ name: 'android:fillType', value: 'evenOdd', prefix: 'android', local: 'fillType' });
        //     elem.removeAttr('fill-rule', 'evenodd');
        // }
        // Path data
        if (hasAttrib(elem, 'd')) {
            addAttr(elem, 'android:pathData', getAttributeValue(elem, 'd'));
            removeAttr(elem, 'd');
        }
    });

}

function convert(data, floatPrecision, strict, fillBlack, tint) {
    refactorData(data, floatPrecision, fillBlack, tint);
    return travelConvert(data, strict);
}

function travelConvert(data, strict) {
    let xml = '';
    indentLevel ++;
    getChildren(data).forEach(item => {
        if (VECTORDRAWABLE_TAGS.includes(item.name)) {
            xml += createTagString(item, strict);
        }
        else if (strict) {
            throw new Error('Unsupported element ' + item.name);
        }
    });
    indentLevel --;
    return xml;
}

function createTagString(data, strict) {
    if (isEmpty(data)) {
        return createIndent() + '<' + data.name + createAttrsString(data, strict) + '/>\n';
    }
    else {
        let processedData = '';
        processedData += travelConvert(data, strict);
        return createIndent() + '<' + data.name + createAttrsString(data, strict) + '>\n' +
            processedData +
            createIndent() + '</' + data.name + '>\n';
    }
}

function createAttrsString(elem, strict) {
    let attrs = '';
    if (elem.name === 'vector') {
        attrs += ' xmlns:android="http://schemas.android.com/apk/res/android"';
    }
    Object.keys(elem.attribs).forEach(attr => {
        let value = getAttributeValue(elem, attr);
        if (value !== undefined) {
            if (VECTORDRAWABLE_ATTRS.includes(attr)) {
                if ([
                    'android:fillColor', 'android:strokeColor', 'android:color', 
                    'android:startColor', 'android:centerColor', 'android:endColor'
                ].includes(attr)) {
                    value = simplifyAndroidHexCode(value);
                }
                if (elem.name === 'aapt:attr' && attr === 'name') {
                    attrs += ' ' + attr + '="' + value + '"';
                }
                else {
                    attrs += '\n' + createIndent() + ' '.repeat(INDENT) + attr + '="' + value + '"';
                }
            } else if (strict) {
                throw new Error('Unsupported attribute ' + attr);
            }
        }
    });
    return attrs;
}

function svgHexToAndroid(hexColor) {
    // RRGGBBAA to AARRGGBB
    // 8 digit hex code
    if (/^#[0-9a-f]{8}$/i.test(hexColor)) {
        hexColor = '#' + hexColor.substr(7, 2) + hexColor.substr(1, 6);
    }
    // RGBA to AARRGGBB
    // 4 digit hex code
    else if (/^#[0-9a-f]{4}$/i.test(hexColor)) {
        hexColor = '#' + hexColor[4].repeat(2) + hexColor[1].repeat(2) + hexColor[2].repeat(2) + hexColor[3].repeat(2);
    }
    else if (/^#[0-9a-f]{6}$/i.test(hexColor)) {
        hexColor = '#FF' + hexColor.substr(1, 6);
    }
    else if (/^#[0-9a-f]{3}$/i.test(hexColor)) {
        hexColor = '#FF' + hexColor[1].repeat(2) + hexColor[2].repeat(2) + hexColor[3].repeat(2);
    }
    else {
        hexColor = '#FF000000';
    }
    return hexColor.toUpperCase();
}

function simplifyAndroidHexCode(androidColorHex) {
    // Remove alpha is FF
    if (/#FF[A-F0-9]{6}/.test(androidColorHex)) {
        androidColorHex = '#' + androidColorHex.substr(-6);
    }
    let partOdd = androidColorHex.substr(1).split('').filter((item, index) => {
        return index % 2 === 0;
    }).join('');
    let partEven = androidColorHex.substr(1).split('').filter((item, index) => {
        return index % 2 === 1;
    }).join('');
    if (partOdd === partEven) {
        androidColorHex = '#' + partOdd;
    }
    return androidColorHex;
}

function createIndent() {
    let indent = ' '.repeat(INDENT);
    indent = indent.repeat(indentLevel - 1);
    return indent;
}

function rectToPathData(x, y, width, height, rx, ry) {
    let d = '';
    if(rx === 0 && ry === 0) {
        d = 'M' + x + ',' + y + 'h' + width + 'v' + height + 'H' + x + 'z';
    } else {
        d = 'M' + x + ',' + (y + ry) +
            'a' + rx + ' -' + ry + ' 0 0 1 ' + rx + ' -' + ry + 'h' + (width - rx * 2) +
            'a' + rx + ' ' + ry + ' 0 0 1 ' + rx + ' ' + ry + 'v' + (height - ry * 2) +
            'a-' + rx + ' ' + ry + ' 0 0 1 -' + rx + ' ' + ry + 'h-' + (width - rx * 2) +
            'a-' + rx + ' -' + ry + ' 0 0 1 -' + rx + ' -' + ry +
            'z';
    }
    return d;
}

function addAttr(elem, attr, value) {
    elem.attribs[attr] = value;
}

function removeAttr(elem, attr) {
    delete elem.attribs[attr];
}

function mergeColorAndOpacity(androidColorHex, opacity) {
    let opacityFromAndroidColor = parseInt(androidColorHex.substr(1, 2), 16) / 255;
    let opacityHex = Number(Math.round(opacity * opacityFromAndroidColor * 255)).toString(16).toUpperCase();
    if (opacityHex.length === 1) {
        opacityHex = '0' + opacityHex;
    }
    return '#' + opacityHex + androidColorHex.substr(-6);
}

function isPercent(value) {
    return /(-)?\d+(\.d+)?%$/.test(String(value));
}

function round(value, floatPrecision) {
    return Math.round(value * Math.pow(10, floatPrecision)) / Math.pow(10, floatPrecision);
}

function isEmpty(dom) {
    return !getChildren(dom) || getChildren(dom).length === 0;
}

async function createElement(name) {
    return new Promise((resolve, reject) => {
        const handler = new DomHandler((error, dom) => {
            if (error) {
                reject(error);
            } else {
                resolve(dom[0]);
            }
        });
        const parser = new Parser(handler);
        parser.write(`<${name}></${name}>`);
        parser.end();
    });
}

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
        if (optimizeSvg.error) {
            reject(optimizeSvg.error);
        }
        const handler = new DomHandler(async (error, dom) => {
            if (error) {
                reject(error);
            } else {

                console.log(optimizeSvg);
                
                const root = await createElement('root');
                appendChild(root, dom[0]);

                let xml = convert(root, floatPrecision, strict, fillBlack, tint);
                if (xmlTag) {
                    xml = '<?xml version="1.0" encoding="utf-8"?>\n' + xml;
                }
                resolve(xml);
            }
        });
        const parser = new Parser(handler);
        parser.write(optimizeSvg.data);
        parser.end();
    });
};