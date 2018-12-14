
const EOL = require('os').EOL;
const svgo = require('./svgo');
const svg2js = require('svgo/lib/svgo/svg2js');
const JSAPI = require('svgo/lib/svgo/jsAPI');
// https://www.npmjs.com/package/svg-path-bounds
const pathBounds = require('svg-path-bounds');

let JS2XML = function() {
    this.width = 24;
    this.height = 24;
    this.viewportWidth = 24;
    this.viewportHeight = 24;
    this.indent = 4;
    this.indentLevel = 0;
    this.floatPrecision = 2;
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
        'android:fillAlpha', // fill-opacity
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

JS2XML.prototype.refactorData = function(data) {

    // Tag g to group
    let elemGroups = data.querySelectorAll('g');
    if (elemGroups) {
        elemGroups.forEach(elem => {
            elem.renameElem('group');
            // remove default attr
            if (elem.hasAttr('fill-rule', 'nonzero')) {
                elem.removeAttr('fill-rule');
            }

            let childPaths = elem.querySelectorAll('path');
            if (childPaths) {
                childPaths.forEach(item => {
                    // Move fill child path
                    if (elem.hasAttr('fill') && !item.hasAttr('fill')) {
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
                            opacity = this.round(elem.attr('opacity').value * item.attr('opacity').value, this.floatPrecision);
                        }
                        item.addAttr({ name: 'opacity', value: opacity, prefix: '', local: 'opacity' });
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
                        elem.addAttr({ name: `android:${key}`, value: this.round(attrs[key], this.floatPrecision), prefix: 'android', local: key });
                    }
                });
                elem.removeAttr('transform');
            }
            else {
                elem.parentNode.spliceContent(elem.parentNode.content.indexOf(elem), 0, elem.content);
                elem.parentNode.spliceContent(elem.parentNode.content.indexOf(elem), 1, []);
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
                        this.addGradientToElement(gradient, path);
                    });
                }
            }
        });
    }

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
            let pathData = this.rectToPathData(x, y, width, height, rx, ry);
            elem.addAttr({ name: 'd', value: pathData, prefix: '', local: 'd' });
        });
    }

    // Tag path
    let elemPaths = data.querySelectorAll('path');
    if (elemPaths) {
        elemPaths.forEach(elem => {
            // Fill
            if (elem.hasAttr('fill')) {
                if (!/^url\(#.*\)$/.test(elem.attr('fill').value) && elem.attr('fill').value !== 'none') {
                    let fillAttr = { name: 'android:fillColor', value: elem.attr('fill').value, prefix: 'android', local: 'fillColor' };
                    if (elem.hasAttr('fill-opacity')) {
                        fillAttr.value = this.mergeColorAndOpacity(fillAttr.value, elem.attr('fill-opacity').value);
                        elem.removeAttr('fill-opacity');
                    }
                    elem.addAttr(fillAttr);
                    elem.removeAttr('fill');
                }
            }
            else {
                let fillAttr = { name: 'android:fillColor', value: '#000000', prefix: 'android', local: 'fillColor' };
                if (elem.hasAttr('fill-opacity')) {
                    fillAttr.value = this.mergeColorAndOpacity(fillAttr.value, elem.attr('fill-opacity').value);
                    elem.removeAttr('fill-opacity');
                }
                elem.addAttr(fillAttr);
            }
            // Opacity, Android not support path/group alpha
            if (elem.hasAttr('opacity')) {
                elem.addAttr({ name: 'android:fillAlpha', value: elem.attr('opacity').value, prefix: 'android', local: 'fillAlpha' });
            }
            // Tag stroke
            if (elem.hasAttr('stroke')) {
                if (!/^url\(#.*\)$/.test(elem.attr('stroke').value) && elem.attr('stroke').value !== 'none') {
                    let strokeAttr = { name: 'android:strokeColor', value: elem.attr('stroke').value, prefix: 'android', local: 'strokeColor' };
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

JS2XML.prototype.addGradientToElement = function(gradient, elem) {
    let vectorDrawableGradient = new JSAPI({ elem: 'gradient', content: [] });
    let vectorDrawableAapt = new JSAPI({ elem: 'aapt:attr', content: [ vectorDrawableGradient ]});

    let gradientId = gradient.attr('id').value;
    if (elem.hasAttr('fill', `url(#${gradientId})`)) {
        vectorDrawableAapt.addAttr({ name: 'name', value: 'android:fillColor', prefix: '', local: 'name'})
    }
    if (elem.hasAttr('stroke', `url(#${gradientId})`)) {
        vectorDrawableAapt.addAttr({ name: 'name', value: 'android:strokeColor', prefix: '', local: 'name'})
    }

    this.adjustGradientCoordinate(gradient, elem);

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
        let color = item.attr('stop-color').value;
        let offset = item.attr('offset').value;
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

JS2XML.prototype.adjustGradientCoordinate = function(gradient, elem) {
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
            attr.value = this.round(attr.value, this.floatPrecision);
        }
    }, this);
};

JS2XML.prototype.mergeColorAndOpacity = function(colorHex, opacity) {
    colorHex = this.formatHexCode(colorHex);
    let opacityHex = Number(Math.round(opacity * 255)).toString(16);
    if (opacityHex.length === 1) {
        opacityHex = '0' + opacityHex;
    }
    return colorHex.slice(0, 1) + opacityHex + colorHex.slice(1);
};

JS2XML.prototype.isPercent = function(value) {
    return /(-)?\d+(\.d+)?%$/.test(String(value));
};

JS2XML.prototype.round = function(value, long) {
    return Math.round(value * Math.pow(10, long)) / Math.pow(10, long);
};

JS2XML.prototype.convert = function(data) {
    this.refactorData(data);
    return this.travelConvert(data);
};

JS2XML.prototype.travelConvert = function(data) {
    let xml = '';
    this.indentLevel ++;
    if (data.content) {
        data.content.forEach(item => {
            if (item.elem && this.vectordrawableTags.indexOf(item.elem) >= 0) {
                xml += this.createElement(item);
            }
        }, this);
    }
    this.indentLevel --;
    return xml;
};

JS2XML.prototype.createElement = function(data) {
    if (data.isEmpty()) {
        return this.createIndent() + '<' + data.elem + this.createAttrs(data) + '/>' + EOL;
    }
    else {
        let processedData = '';
        processedData += this.travelConvert(data);
        return this.createIndent() + '<' + data.elem + this.createAttrs(data) + '>' + EOL +
            processedData +
            this.createIndent() + '</' + data.elem + '>' + EOL;
    }
};

JS2XML.prototype.createAttrs = function(elem) {
    let attrs = '';
    if (elem.elem === 'vector') {
        attrs += ' xmlns:android="http://schemas.android.com/apk/res/android"';
    }
    elem.eachAttr(function(attr) {
        if (attr.value !== undefined && this.vectordrawableAttrs.indexOf(attr.name) >= 0) {
            if (['fillColor', 'strokeColor', 'color'].indexOf(attr.local) >= 0) {
                attr.value = this.formatHexCode(attr.value);
            }
            if (elem.elem === 'aapt:attr' && attr.name === 'name') {
                attrs += ' ' + attr.name + '="' + attr.value + '"';
            }
            else {
                attrs += EOL + this.createIndent() + ' '.repeat(this.indent) + attr.name + '="' + attr.value + '"';
            }
        }
    }, this);
    return attrs;
};

JS2XML.prototype.formatHexCode = function(hexColor) {
    if(/#[0-9a-f]{6}/i.test(hexColor)) {
        return hexColor.toUpperCase();
    }
    if(/#[0-9a-f]{3}/i.test(hexColor)) {
        hexColor = '#' + hexColor[1] + hexColor[1] + hexColor[2] + hexColor[2] + hexColor[3] + hexColor[3];
        return hexColor.toUpperCase();
    }
    return '#000000';
};

JS2XML.prototype.createIndent = function() {
    let indent = ' '.repeat(this.indent);
    indent = indent.repeat(this.indentLevel - 1);
    return indent;
};

JS2XML.prototype.rectToPathData = function(x, y, width, height, rx, ry) {
    let d = '';
    if(rx === 0 && ry === 0) {
        d = 'M' + x + ',' + y + 'L' + (x + width) + ',' + y + 'L' + (x + width) + ',' + (y + height) + 'L' + x + ',' + (y + height) + 'z';
    } else {
        d = 'M' + (x + rx) + ',' + y +
            'L' + (x + width - rx) + ',' + y +
            'Q' + (x + width) + ',' + y + ',' + (x + width) + ',' + (y + ry) +
            'L' + (x + width) + ',' + (y + height - ry) +
            'Q' + (x + width) + ',' + (y + height) + ',' + (x + width - rx) + ',' + (y + height) +
            'L' + (x + rx) + ',' + (y + height) +
            'Q' + x + ',' + (y + height) + ',' + x + ',' + (y + height - ry) +
            'L' + x + ',' + (y + ry) +
            'Q' + x + ',' + y + ',' + (x + rx) + ',' + y + 'z';
    }
    return d;
};

module.exports = function(content) {
    return new Promise((resolve, reject) => {
        svgo(content).then(svgOptimized => {
            // console.log(svgOptimized);
            svg2js(svgOptimized, result => {
                // console.log(result);
                if (result.err) {
                    reject(result.err);
                }
                else {
                    let xml = new JS2XML().convert(result);
                    resolve(xml);
                }
            });
        }).catch(err => reject(err));
    });
};
