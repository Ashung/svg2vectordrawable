
const EOL = require('os').EOL;
const svgoConfig = require('./svgo-config');
const config = require('svgo/lib/svgo/config');
const svgoUsePlugins = require('svgo/lib/svgo/plugins');
const svg2js = require('svgo/lib/svgo/svg2js');
// const js2svg = require('svgo/lib/svgo/js2svg');
const JSAPI = require('svgo/lib/svgo/jsAPI');
// https://www.npmjs.com/package/svg-path-bounds
const pathBounds = require('svg-path-bounds');
// https://github.com/fontello/svgpath
const svgpath = require('svgpath');

let JS2XML = function() {
    this.width = 24;
    this.height = 24;
    this.viewportWidth = 24;
    this.viewportHeight = 24;
    this.indent = 4;
    this.indentLevel = 0;
    // https://developer.android.com/reference/android/graphics/drawable/VectorDrawable
    this.vectordrawableTags = [
        // Android vs SVG
        'vector', // svg
        'group', // g
        'path', // path, rect, circle, polygon, ellipse, polyline, line
        'clip-path', // mask
        'aapt:attr',
        'gradient', // linearGradient, radialGradient
        'item' // stop
    ];
    this.vectordrawableAttrs = [
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
};

JS2XML.prototype.refactorData = function(data, floatPrecision, fillBlack) {

    // Tag use to original
    let elemUses = data.querySelectorAll('use');
    if (elemUses) {
        elemUses.forEach(elem => {
            if (elem.hasAttr('xlink:href')) {

                let originalElem = data.querySelector(elem.attr('xlink:href').value);
                let newElem = new JSAPI({ elem: originalElem.elem });
                elem.eachAttr(attr => {
                    if (attr.name !== 'xlink:href' && attr.name !== 'id') {
                        newElem.addAttr(attr);
                    }
                });
                originalElem.eachAttr(attr => {
                    if (attr.name !== 'xlink:href' && attr.name !== 'id') {
                        newElem.addAttr(attr);
                    }
                });
                elem.parentNode.spliceContent(elem.parentNode.content.indexOf(elem), 0, newElem);
                elem.parentNode.spliceContent(elem.parentNode.content.indexOf(elem), 1, []);
            }
        });
    }

    // Remove id attribute in some elements.
    // SVGO do not move transform from group to child elements which have id attribute.
    let elemHaveIds = data.querySelectorAll('path, g, circle, ellipse, line, polygon, polyline, rect');
    elemHaveIds.forEach(elem => {
        elem.removeAttr('id');
    });

    // SVG Optimize use SVGO
    let plugins = config(svgoConfig(floatPrecision)).plugins;
    let info = svgoConfig.info;
    svgoUsePlugins(data, info, plugins);

    // console.log(js2svg(data).data);

    // Apply transform to path
    // SVGO do not apply transform to path, when some attribute value is "url()". svgo/plugins/_path.js
    let elemTransformPaths = data.querySelectorAll('path[transform*="("]');
    if (elemTransformPaths) {
        elemTransformPaths.forEach(elem => {
            elem.eachAttr(attr => {
                if (attr.value.indexOf('url(') > -1) {
                    elem.removeAttr(attr.name);
                    elem.addAttr({ name: '_' + attr.name, value: attr.value, prefix: '', local: '_' + attr.name });
                }
            }, this);
        });
        svgoUsePlugins(data, info, plugins);
        elemTransformPaths.forEach(elem => {
            elem.eachAttr(attr => {
                if (attr.value.indexOf('url(') > -1) {
                    elem.removeAttr(attr.name);
                    elem.addAttr({ name: attr.name.substr(1), value: attr.value, prefix: '', local: attr.name.substr(1) });
                }
            }, this);
        });
    }

    // Rounded rect to path, SVGO does not convert round rect to paths.
    let elemRects = data.querySelectorAll('rect');
    if (elemRects) {
        elemRects.forEach(elem => {
            elem.renameElem('path');
            let x = elem.hasAttr('x') ? parseFloat(elem.attr('x').value) : 0;
            let y = elem.hasAttr('y') ? parseFloat(elem.attr('y').value) : 0;
            let width = elem.hasAttr('width') ? parseFloat(elem.attr('width').value) : 0;
            let height = elem.hasAttr('height') ? parseFloat(elem.attr('height').value) : 0;
            let rx = 0;
            let ry = 0;
            // see spec here: https://www.w3.org/TR/SVG11/shapes.html#RectElement
            if (elem.hasAttr('rx') && elem.hasAttr('ry')) {
                rx = parseFloat(elem.attr('rx').value);
                ry = parseFloat(elem.attr('ry').value);
            }
            else if (elem.hasAttr('rx')) {
                rx = parseFloat(elem.attr('rx').value);
                ry = rx;
            }
            else if (elem.hasAttr('ry')) {
                ry = parseFloat(elem.attr('ry').value);
                rx = ry;
            }
            x = this.round(x, floatPrecision);
            y = this.round(y, floatPrecision);
            width = this.round(width, floatPrecision);
            height = this.round(height, floatPrecision);
            rx = this.round(rx, floatPrecision);
            ry = this.round(ry, floatPrecision);
            let pathData = this.rectToPathData(x, y, width, height, rx, ry);
            // Android 8- have a bug when drawing rounded rectangle with arc code in path data.
            if (rx !== 0 || ry !== 0) {
                pathData = svgpath(pathData).unarc().rel().round(floatPrecision).toString();
            }

            // Apply transform to rect.
            if (elem.hasAttr('transform')) {
                let svgTransform = elem.attr('transform').value;
                let number = '((?:-)?\\d+(?:\\.\\d+)?)';
                let separator = '(?:(?:\\s+)|(?:\\s*,\\s*))';
                let translateRegExp = new RegExp(`translate\\(${number}${separator}?${number}?\\)`);
                let scaleRegExp = new RegExp(`scale\\(${number}${separator}?${number}?\\)`);
                let rotateRegExp = new RegExp(`rotate\\(${number}${separator}?${number}?${separator}?${number}?\\)`);
                let translateMatch = translateRegExp.exec(svgTransform);
                let scaleMatch = scaleRegExp.exec(svgTransform);
                let rotateMatch = rotateRegExp.exec(svgTransform);
                if (rotateMatch) {
                    let angle = parseFloat(rotateMatch[1]);
                    let rx = parseFloat(rotateMatch[2]) || 0;
                    let ry = parseFloat(rotateMatch[3]) || 0;
                    pathData = svgpath(pathData).rotate(angle, rx, ry).round(floatPrecision).toString();
                }
                if (scaleMatch) {
                    let sx = parseFloat(scaleMatch[1]);
                    let sy = parseFloat(scaleMatch[2]) || sx;
                    pathData = svgpath(pathData).scale(sx, sy).round(floatPrecision).toString();
                }
                if (translateMatch) {
                    let x = parseFloat(translateMatch[1]);
                    let y = parseFloat(translateMatch[2]) || 0;
                    pathData = svgpath(pathData).translate(x, y).round(floatPrecision).toString();
                }
            }
            elem.addAttr({ name: 'd', value: pathData, prefix: '', local: 'd' });
        });
    }

    // Tag g to group
    let elemGroups = data.querySelectorAll('g');
    if (elemGroups) {
        elemGroups.forEach(elem => {
            let childPaths = elem.querySelectorAll('path');
            if (childPaths) {
                childPaths.forEach(item => {
                    // Move fill child path
                    if (elem.hasAttr('fill') && !elem.hasAttr('fill', 'none') && !item.hasAttr('fill') && !item.hasAttr('fill', 'none')) {
                        item.addAttr({ name: 'fill', value: elem.attr('fill').value, prefix: '', local: 'fill' });
                    }
                    // Move fill-opacity to child path
                    if (elem.hasAttr('fill-opacity') && !item.hasAttr('fill-opacity')) {
                        item.addAttr({ name: 'fill-opacity', value: elem.attr('fill-opacity').value, prefix: '', local: 'fill-opacity' });
                    }
                    // Move stroke to child path
                    if (elem.hasAttr('stroke') && !item.hasAttr('stroke')) {
                        item.addAttr({ name: 'stroke', value: elem.attr('stroke').value, prefix: '', local: 'stroke' });
                    }
                    // Move stroke-width to child path
                    if (elem.hasAttr('stroke-width') && !item.hasAttr('stroke-width')) {
                        item.addAttr({ name: 'stroke-width', value: elem.attr('stroke-width').value, prefix: '', local: 'stroke-width' });
                    }
                    // Move stroke-opacity to child path
                    if (elem.hasAttr('stroke-opacity') && !item.hasAttr('stroke-opacity')) {
                        item.addAttr({ name: 'stroke-opacity', value: elem.attr('stroke-opacity').value, prefix: '', local: 'stroke-opacity' });
                    }
                    // Move stroke-linecap to child path
                    if (elem.hasAttr('stroke-linecap') && !item.hasAttr('stroke-linecap')) {
                        item.addAttr({ name: 'stroke-linecap', value: elem.attr('stroke-linecap').value, prefix: '', local: 'stroke-linecap' });
                    }
                    // Move stroke-linejoin to child path
                    if (elem.hasAttr('stroke-linejoin') && !item.hasAttr('stroke-linejoin')) {
                        item.addAttr({ name: 'stroke-linejoin', value: elem.attr('stroke-linejoin').value, prefix: '', local: 'stroke-linejoin' });
                    }
                    // Move opacity to child node
                    if (elem.hasAttr('opacity')) {
                        let opacity = elem.attr('opacity').value;
                        if (item.hasAttr('opacity')) {
                            opacity = this.round(elem.attr('opacity').value * item.attr('opacity').value, floatPrecision);
                        }
                        item.addAttr({ name: 'opacity', value: opacity, prefix: '', local: 'opacity' });
                    }
                    // Move fill-rule to child node
                    if (elem.hasAttr('fill-rule', 'evenodd')) {
                        if (!item.hasAttr('fill-rule', 'nonzero')) {
                            item.addAttr({ name: 'android:fillType', value: 'evenOdd', prefix: 'android', local: 'fillType' });
                        }
                    }
                });
                elem.removeAttr('fill');
                elem.removeAttr('fill-opacity');
                elem.removeAttr('stroke');
                elem.removeAttr('stroke-width');
                elem.removeAttr('stroke-opacity');
                elem.removeAttr('stroke-linecap');
                elem.removeAttr('stroke-linejoin');
                elem.removeAttr('opacity');
                elem.removeAttr('fill-rule');
            }

            // Group transform
            if (elem.hasAttr('transform')) {
                let svgTransform = elem.attr('transform').value;
                let number = '((?:-)?\\d+(?:\\.\\d+)?)';
                let separator = '(?:(?:\\s+)|(?:\\s*,\\s*))';
                let translateRegExp = new RegExp(`translate\\(${number}${separator}?${number}?\\)`);
                let scaleRegExp = new RegExp(`scale\\(${number}${separator}?${number}?\\)`);
                let rotateRegExp = new RegExp(`rotate\\(${number}${separator}?${number}?${separator}?${number}?\\)`);
                let translateMatch = translateRegExp.exec(svgTransform);
                let scaleMatch = scaleRegExp.exec(svgTransform);
                let rotateMatch = rotateRegExp.exec(svgTransform);
                let attrs = { rotation: '', pivotX: '', pivotY: '', scaleX: '', scaleY: '', translateX: '', translateY: ''};
                if (rotateMatch) {
                    attrs.rotation = rotateMatch[1];
                    attrs.pivotX = rotateMatch[2] || '';
                    attrs.pivotY = rotateMatch[3] || '';
                }
                if (scaleMatch) {
                    attrs.scaleX = scaleMatch[1];
                    attrs.scaleY = scaleMatch[2] || scaleMatch[1];
                }
                if (translateMatch) {
                    attrs.translateX = translateMatch[1];
                    attrs.translateY = translateMatch[2] || '';
                }
                Object.keys(attrs).forEach(key => {
                    if (attrs[key] !== '' && (attrs[key] !== '0' && (key !== 'scaleX' || key !== 'scaleY'))) {
                        elem.addAttr({ name: `android:${key}`, value: this.round(attrs[key], floatPrecision), prefix: 'android', local: key });
                    }
                });
                elem.removeAttr('transform');
            }
        });
    }

    // Rename g to group, and remove useless g tag.
    elemGroups = data.querySelectorAll('g');
    if (elemGroups) {
        elemGroups.forEach(elem => {
            if (elem.attrs === undefined) {
                elem.parentNode.spliceContent(elem.parentNode.content.indexOf(elem), 0, elem.content);
                elem.parentNode.spliceContent(elem.parentNode.content.indexOf(elem), 1, []);
            } else {
                elem.renameElem('group');
            }
        });
    }

    // Tag gradient
    let elemGradients = data.querySelectorAll('linearGradient, radialGradient, sweepGradient');
    if (elemGradients) {
        elemGradients.forEach(gradient => {
            if (gradient.hasAttr('id')) {
                let gradientId = gradient.attr('id').value;
                let gradientPaths = data.querySelectorAll(`path[fill="url(#${gradientId})"], path[stroke="url(#${gradientId})"]`);
                if (gradientPaths) {
                    gradientPaths.forEach(path => {
                        this.addGradientToElement(gradient, path, floatPrecision);
                    });
                }
            }
        });
    }

    // Tag mask to clip-path
    let elemMasks = data.querySelectorAll('mask');
    if (elemMasks) {
        elemMasks.forEach(elem => {
            if (elem.hasAttr('id')) {
                let maskId = elem.attr('id').value;
                let clipMaskElem = elem.content[0];
                let maskedElems = data.querySelectorAll(`*[mask="url(#${maskId})"]`);
                let pathData = clipMaskElem.attr('d').value;
                // Create a group for mask
                let maskGroup = new JSAPI({ elem: 'group', attrs: {}, content: [] });
                clipMaskElem.renameElem('clip-path');
                clipMaskElem.attrs = {};
                clipMaskElem.addAttr({ name: 'android:pathData', value: pathData, prefix: 'android', local: 'pathData' });
                maskGroup.content.push(clipMaskElem);
                // Move masked layer to mask group
                maskedElems.forEach(item => {
                    item.removeAttr('mask');
                    maskGroup.content.push(item);
                });
                elem.parentNode.spliceContent(elem.parentNode.content.indexOf(maskedElems[0]), maskedElems.length, maskGroup);
            }
        });
    }

    // Tag svg to vector
    let elemSVG = data.querySelector('svg');
    if (elemSVG) {
        elemSVG.renameElem('vector');
        if (elemSVG.hasAttr('width') && elemSVG.hasAttr('height')) {
            this.width = parseInt(elemSVG.attr('width').value);
            this.height = parseInt(elemSVG.attr('height').value);
        }
        if (elemSVG.hasAttr('viewBox')) {
            let [x, y, w, h] = elemSVG.attr('viewBox').value.split(/\s+/);
            this.viewportWidth = w;
            this.viewportHeight = h;
            if (!elemSVG.hasAttr('width') && !elemSVG.hasAttr('height')) {
                this.width = w;
                this.height = h;
            }
        }
        elemSVG.attrs = {};
        // SVG is not support sweep (angular) gradient
        if (data.querySelector("linearGradient, radialGradient, sweepGradient, aapt\\:attr")) {
            elemSVG.addAttr({ name: 'xmlns:aapt', value: 'http://schemas.android.com/aapt', prefix: 'xmlns', local: 'aapt' });
        }
        elemSVG.addAttr({ name: 'android:width', value: this.width + 'dp', prefix: 'android', local: 'width' });
        elemSVG.addAttr({ name: 'android:height', value: this.height + 'dp', prefix: 'android', local: 'height' });
        elemSVG.addAttr({ name: 'android:viewportWidth', value: this.viewportWidth, prefix: 'android', local: 'viewportWidth' });
        elemSVG.addAttr({ name: 'android:viewportHeight', value: this.viewportHeight, prefix: 'android', local: 'viewportHeight' });
    }

    // Tag path
    let elemPaths = data.querySelectorAll('path');
    if (elemPaths) {
        elemPaths.forEach(elem => {
            // Fill
            if (elem.hasAttr('fill')) {
                if (!/^url\(#.*\)$/.test(elem.attr('fill').value) && elem.attr('fill').value !== 'none') {
                    let color = this.svgHexToAndroid(elem.attr('fill').value);
                    let fillAttr = { name: 'android:fillColor', value: color, prefix: 'android', local: 'fillColor' };
                    if (elem.hasAttr('fill-opacity')) {
                        fillAttr.value = this.mergeColorAndOpacity(fillAttr.value, elem.attr('fill-opacity').value);
                        elem.removeAttr('fill-opacity');
                    }
                    elem.addAttr(fillAttr);
                    elem.removeAttr('fill');
                }
            }
            // Fill black?
            else if (fillBlack) {
                let fillAttr = { name: 'android:fillColor', value: "#000", prefix: 'android', local: 'fillColor' };
                elem.addAttr(fillAttr);
            }

            // Opacity, Android not support path/group alpha
            if (elem.hasAttr('opacity')) {
                elem.addAttr({ name: 'android:fillAlpha', value: elem.attr('opacity').value, prefix: 'android', local: 'fillAlpha' });
            }
            // Tag stroke
            if (elem.hasAttr('stroke')) {
                if (!/^url\(#.*\)$/.test(elem.attr('stroke').value) && elem.attr('stroke').value !== 'none') {
                    let color = this.svgHexToAndroid(elem.attr('stroke').value);
                    let strokeAttr = { name: 'android:strokeColor', value: color, prefix: 'android', local: 'strokeColor' };
                    if (elem.hasAttr('stroke-opacity')) {
                        strokeAttr.value = this.mergeColorAndOpacity(strokeAttr.value, elem.attr('stroke-opacity').value);
                        elem.removeAttr('stroke-opacity');
                    }
                    elem.addAttr(strokeAttr);
                    elem.removeAttr('stroke');
                }
                if (elem.hasAttr('opacity')) {
                    elem.addAttr({ name: 'android:strokeAlpha', value: elem.attr('opacity').value, prefix: 'android', local: 'strokeAlpha' });
                }
                // SVG stroke-width default is 1, Android android:strokeWidth default is 0
                let strokeWidthAttr = { name: 'android:strokeWidth', value: 0, prefix: 'android', local: 'strokeWidth' };
                if (!elem.hasAttr('stroke-width')) {
                    strokeWidthAttr.value = 1;
                }
                else {
                    strokeWidthAttr.value = elem.attr('stroke-width').value;
                    elem.removeAttr('stroke-width');
                }
                elem.addAttr(strokeWidthAttr);
                let strokeExtraAttrs = ['stroke-linecap', 'stroke-linejoin', 'stroke-miterlimit'];
                let strokeExtraAttrsAndroid = ['strokeLineCap', 'strokeLineJoin', 'strokeMiterLimit'];
                strokeExtraAttrs.forEach((attr, index) => {
                    if (elem.hasAttr(attr)) {
                        let localName = strokeExtraAttrsAndroid[index];
                        elem.addAttr({ name: 'android:' + localName, value: elem.attr(attr).value, prefix: 'android', local: localName });
                        elem.removeAttr('attr');
                    }
                });
            }
            // Opacity, Android not support path/group alpha
            if (elem.hasAttr('opacity')) {
                elem.removeAttr('opacity');
            }
            // Fill-rule
            elem.removeAttr('fill-rule', 'nonzero');
            if (elem.hasAttr('fill-rule', 'evenodd')) {
                elem.addAttr({ name: 'android:fillType', value: 'evenOdd', prefix: 'android', local: 'fillType' });
                elem.removeAttr('fill-rule', 'evenodd');
            }
            // Path data
            if (elem.hasAttr('d')) {
                elem.addAttr({ name: 'android:pathData', value: elem.attr('d').value, prefix: 'android', local: 'pathData' });
                elem.removeAttr('d');
            }
        });
    }
};

JS2XML.prototype.addGradientToElement = function(gradient, elem, floatPrecision) {
    let vectorDrawableGradient = new JSAPI({ elem: 'gradient', content: [] });
    let vectorDrawableAapt = new JSAPI({ elem: 'aapt:attr', content: [ vectorDrawableGradient ]});

    let gradientId = gradient.attr('id').value;
    if (elem.hasAttr('fill', `url(#${gradientId})`)) {
        vectorDrawableAapt.addAttr({ name: 'name', value: 'android:fillColor', prefix: '', local: 'name'})
    }
    if (elem.hasAttr('stroke', `url(#${gradientId})`)) {
        vectorDrawableAapt.addAttr({ name: 'name', value: 'android:strokeColor', prefix: '', local: 'name'})
    }

    this.adjustGradientCoordinate(gradient, elem, floatPrecision);

    if (gradient.elem === 'linearGradient') {
        vectorDrawableGradient.addAttr({ name: 'android:type', value: 'linear', prefix: 'android', local: 'type'});
        let startX = gradient.hasAttr('x1') ? gradient.attr('x1').value : '0';
        let startY = gradient.hasAttr('y1') ? gradient.attr('y1').value : '0';
        let endX = gradient.hasAttr('x2') ? gradient.attr('x2').value : this.viewportWidth;
        let endY = gradient.hasAttr('y2') ? gradient.attr('y2').value : '0';
        vectorDrawableGradient.addAttr({ name: 'android:startX', value: startX, prefix: 'android', local: 'startX'});
        vectorDrawableGradient.addAttr({ name: 'android:startY', value: startY, prefix: 'android', local: 'startY'});
        vectorDrawableGradient.addAttr({ name: 'android:endX', value: endX, prefix: 'android', local: 'endX'});
        vectorDrawableGradient.addAttr({ name: 'android:endY', value: endY, prefix: 'android', local: 'endY'});
    }
    if (gradient.elem === 'radialGradient') {
        vectorDrawableGradient.addAttr({ name: 'android:type', value: 'radial', prefix: 'android', local: 'type'});
        let centerX = gradient.hasAttr('cx') ? gradient.attr('cx').value : this.viewportWidth / 2;
        let centerY = gradient.hasAttr('cy') ? gradient.attr('cy').value : this.viewportHeight / 2;
        if (gradient.hasAttr('rx')) centerX = gradient.attr('rx').value;
        if (gradient.hasAttr('ry')) centerY = gradient.attr('ry').value;
        let gradientRadius = gradient.hasAttr('r') ? gradient.attr('r').value : Math.max(this.viewportWidth, this.viewportHeight) / 2;
        vectorDrawableGradient.addAttr({ name: 'android:centerX', value: centerX, prefix: 'android', local: 'centerX'});
        vectorDrawableGradient.addAttr({ name: 'android:centerY', value: centerY, prefix: 'android', local: 'centerY'});
        vectorDrawableGradient.addAttr({ name: 'android:gradientRadius', value: gradientRadius, prefix: 'android', local: 'gradientRadius'});
    }
    // SVG is not support sweepGradient
    if (gradient.elem === 'sweepGradient') {
        vectorDrawableGradient.addAttr({ name: 'android:type', value: 'sweep', prefix: 'android', local: 'type'});
        let centerX = gradient.hasAttr('cx') ? gradient.attr('cx').value : this.viewportWidth / 2;
        let centerY = gradient.hasAttr('cy') ? gradient.attr('cy').value : this.viewportHeight / 2;
        vectorDrawableGradient.addAttr({ name: 'android:centerX', value: centerX, prefix: 'android', local: 'centerX'});
        vectorDrawableGradient.addAttr({ name: 'android:centerY', value: centerY, prefix: 'android', local: 'centerY'});
    }
    // Color stops
    gradient.content.forEach(item => {
        let colorStop = new JSAPI({ elem: 'item' });
        const stopColorAttr = item.attr('stop-color');
        let color = this.svgHexToAndroid(stopColorAttr == null ? '#000' : stopColorAttr.value);
        const offsetAttr = item.attr('offset');
        let offset = offsetAttr == null ? 0 : offsetAttr.value;
        if (this.isPercent(offset)) {
            offset = Math.round(parseFloat(offset)) / 100;
        }
        if (item.hasAttr('stop-opacity')) {
            color = this.mergeColorAndOpacity(color, item.attr('stop-opacity').value);
        }
        colorStop.addAttr({ name: 'android:color', value: color, prefix: 'android', local: 'color'});
        colorStop.addAttr({ name: 'android:offset', value: offset, prefix: 'android', local: 'offset'});
        vectorDrawableGradient.content.push(colorStop);
    });

    if (!elem.content) elem.content = [];
    elem.content.push(vectorDrawableAapt);
};

JS2XML.prototype.adjustGradientCoordinate = function(gradient, elem, floatPrecision) {
    // Default value
    if (gradient.elem === 'linearGradient') {
        if (!gradient.hasAttr('x1')) {
            gradient.addAttr({ name: 'x1', value: '0', prefix: '', local: 'x1'});
        }
        if (!gradient.hasAttr('y1')) {
            gradient.addAttr({ name: 'y1', value: '0', prefix: '', local: 'y1'});
        }
        if (!gradient.hasAttr('x2')) {
            gradient.addAttr({ name: 'x2', value: '100%', prefix: '', local: 'x2'});
        }
        if (!gradient.hasAttr('y2')) {
            gradient.addAttr({ name: 'y2', value: '100%', prefix: '', local: 'y2'});
        }
    }
    if (gradient.elem === 'radialGradient') {
        if (!gradient.hasAttr('cx')) {
            gradient.addAttr({ name: 'cx', value: '50%', prefix: '', local: 'cx'});
        }
        if (!gradient.hasAttr('cy')) {
            gradient.addAttr({ name: 'cy', value: '50%', prefix: '', local: 'cy'});
        }
        if (!gradient.hasAttr('r')) {
            gradient.addAttr({ name: 'r', value: '50%', prefix: '', local: 'r'});
        }
    }
    if (gradient.elem === 'sweepGradient') {
        if (!gradient.hasAttr('cx')) {
            gradient.addAttr({ name: 'cx', value: '50%', prefix: '', local: 'cx'});
        }
        if (!gradient.hasAttr('cy')) {
            gradient.addAttr({ name: 'cy', value: '50%', prefix: '', local: 'cy'});
        }
    }
    gradient.eachAttr(attr => {
        let positionAttrs = [
            // SVG linearGradient
            'x1', 'y1', 'x2', 'y2',
            // SVG radialGradient, Android VectorDrawable not support 'fx' and 'fy'.
            'cx', 'cy', 'r', 'fx', 'fy'
        ];
        if (positionAttrs.indexOf(attr.name) >= 0) {
            // Android gradient use gradientUnits="userSpaceOnUse", SVG default is objectBoundingBox.
            if (!gradient.hasAttr('gradientUnits', 'userSpaceOnUse')) {
                let [x1, y1, x2, y2] = pathBounds(elem.attr('d').value);
                // Percent to float.
                if (this.isPercent(attr.value)) {
                    let valueFloat = parseFloat(attr.value) / 100;
                    if (attr.name === 'x1' || attr.name === 'x2' || attr.name === 'cx' || attr.name === 'fx') {
                        attr.value = x1 + (x2 - x1) * valueFloat;
                    }
                    if (attr.name === 'y1' || attr.name === 'y2' || attr.name === 'cy' || attr.name === 'fy') {
                        attr.value = y1 + (y2 - y1) * valueFloat;
                    }
                    if (attr.name === 'r') {
                        attr.value = Math.max(x2 - x1, y2 - y1) * valueFloat;
                    }
                }
                else {
                    if (attr.name === 'x1' || attr.name === 'x2' || attr.name === 'cx' || attr.name === 'fx') {
                        attr.value = x1 + attr.value;
                    }
                    if (attr.name === 'y1' || attr.name === 'y2' || attr.name === 'cy' || attr.name === 'fy') {
                        attr.value = y1 + attr.value;
                    }
                }
            }
            else {
                if (this.isPercent(attr.value)) {
                    let valueFloat = parseFloat(attr.value) / 100;
                    if (attr.name === 'x1' || attr.name === 'x2' || attr.name === 'cx' || attr.name === 'fx') {
                        attr.value = this.viewportWidth * valueFloat;
                    }
                    if (attr.name === 'y1' || attr.name === 'y2' || attr.name === 'cy' || attr.name === 'fy') {
                        attr.value = this.viewportHeight * valueFloat;
                    }
                    if (attr.name === 'r') {
                        attr.value = Math.max(this.viewportWidth, this.viewportHeight) * valueFloat;
                    }
                }
            }
            attr.value = this.round(attr.value, floatPrecision);
        }
    }, this);
};

JS2XML.prototype.mergeColorAndOpacity = function(androidColorHex, opacity) {
    let opacityFromAndroidColor = parseInt(androidColorHex.substr(1, 2), 16) / 255;
    let opacityHex = Number(Math.round(opacity * opacityFromAndroidColor * 255)).toString(16).toUpperCase();
    if (opacityHex.length === 1) {
        opacityHex = '0' + opacityHex;
    }
    return '#' + opacityHex + androidColorHex.substr(-6);
};

JS2XML.prototype.isPercent = function(value) {
    return /(-)?\d+(\.d+)?%$/.test(String(value));
};

JS2XML.prototype.round = function(value, floatPrecision) {
    return Math.round(value * Math.pow(10, floatPrecision)) / Math.pow(10, floatPrecision);
};

JS2XML.prototype.convert = function(data, floatPrecision, strict, fillBlack) {
    this.refactorData(data, floatPrecision, fillBlack);
    return this.travelConvert(data, strict);
};

JS2XML.prototype.travelConvert = function(data, strict) {
    let xml = '';
    this.indentLevel ++;
    if (data.content) {
        data.content.forEach(item => {
            if (item.elem) {
                if (this.vectordrawableTags.indexOf(item.elem) >= 0) {
                    xml += this.createElement(item, strict);
                } else if (strict) {
                    throw new Error('Unsupported element ' + item.elem);
                }
            }
        }, this);
    }
    this.indentLevel --;
    return xml;
};

JS2XML.prototype.createElement = function(data, strict) {
    if (data.isEmpty()) {
        return this.createIndent() + '<' + data.elem + this.createAttrs(data, strict) + '/>' + EOL;
    }
    else {
        let processedData = '';
        processedData += this.travelConvert(data, strict);
        return this.createIndent() + '<' + data.elem + this.createAttrs(data, strict) + '>' + EOL +
            processedData +
            this.createIndent() + '</' + data.elem + '>' + EOL;
    }
};

JS2XML.prototype.createAttrs = function(elem, strict) {
    let attrs = '';
    if (elem.elem === 'vector') {
        attrs += ' xmlns:android="http://schemas.android.com/apk/res/android"';
    }
    elem.eachAttr(function(attr) {
        if (attr.value !== undefined) {
            if (this.vectordrawableAttrs.indexOf(attr.name) >= 0) {
                if (['fillColor', 'strokeColor', 'color'].indexOf(attr.local) >= 0) {
                    attr.value = this.simplifyAndroidHexCode(attr.value);
                }
                if (elem.elem === 'aapt:attr' && attr.name === 'name') {
                    attrs += ' ' + attr.name + '="' + attr.value + '"';
                }
                else {
                    attrs += EOL + this.createIndent() + ' '.repeat(this.indent) + attr.name + '="' + attr.value + '"';
                }
            } else if (strict) {
                throw new Error('Unsupported attribute ' + attr.name);
            }
        }
    }, this);
    return attrs;
};

JS2XML.prototype.svgHexToAndroid = function(hexColor) {
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
};

JS2XML.prototype.simplifyAndroidHexCode = function(androidColorHex) {
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
};

JS2XML.prototype.createIndent = function() {
    let indent = ' '.repeat(this.indent);
    indent = indent.repeat(this.indentLevel - 1);
    return indent;
};

JS2XML.prototype.rectToPathData = function(x, y, width, height, rx, ry) {
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
};

/**
 * @param {String} svgCode SVG code
 * @param {Number} floatPrecision Integer number
 * @param {Boolean} strict Set strict mode
 * @param {Boolean} fillBlack Add black fill to paths with no fill
 * @returns {Promise<string>}
 */
module.exports = function(svgCode, floatPrecision, strict, fillBlack) {
    if (floatPrecision === undefined) {
        floatPrecision = 2;
    }
    if (strict === undefined) {
        strict = false;
    }
    if (fillBlack === undefined) {
        fillBlack = false;
    }
    return new Promise((resolve, reject) => {
        svg2js(svgCode, data => {
            if (data.error) {
               reject(data.error);
            }
            else {
                let xml = new JS2XML().convert(data, floatPrecision, strict, fillBlack);
                resolve(xml);
            }
        });
    });
};
