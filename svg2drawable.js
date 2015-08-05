

var xml = require("node-xml-lite");
var fs = require("fs");
var path = require("path");


var DEBUG_MODE = true;

/*
 * String: svgFilePath '/dir/vector.svg'
 * String: drawableFilePath  '/dir/vectorDrawable.xml'
 * String|Number: density ldpi|mdpi|hdpi|xhdpi|xxhdpi|xxxhdpi|number|[number]
 */
function svg2drawable(svgFilePath, drawableFilePath, density) {

    var svg = xml.parseFileSync(svgFilePath);
    var style = getStyle(svg.childs);
    //console.log(svg);

    // Default
    var width = 1000;
    var height = 1000;
    var viewportWidth = 1000;
    var viewportHeight = 1000;
    
    
    var errorInfo = '';

    if(hasArrtib(svg.attrib, 'width')) {
        width = parseInt(svg.attrib.width);
    } else if(hasArrtib(svg.attrib, 'viewBox')) {
        width = svg.attrib.viewBox.split(' ')[2];
    }

    if(hasArrtib(svg.attrib, 'height')) {
        height = parseInt(svg.attrib.height);
    } else if(hasArrtib(svg.attrib, 'viewBox')) {
        height = svg.attrib.viewBox.split(' ')[3];
    }

    if(hasArrtib(svg.attrib, 'viewBox')) {
        viewportWidth = svg.attrib.viewBox.split(' ')[2];
        viewportHeight = svg.attrib.viewBox.split(' ')[3];
    } else {
        if(hasArrtib(svg.attrib, 'width')) {
            viewportWidth = parseInt(svg.attrib.width);
        }
        if(hasArrtib(svg.attrib, 'height')) {
            viewportHeight = parseInt(svg.attrib.height);
        }
    }
    
    width = Math.ceil(width/densityToRatio(density));
    height = Math.ceil(height/densityToRatio(density));
    
    

    var vectorDrawableXML = 
'\
<?xml version="1.0" encoding="utf-8"?>\n\
<vector xmlns:android="http://schemas.android.com/apk/res/android"\n\
    android:width="' + width + 'dp"\n\
    android:height="' + height + 'dp"\n\
    android:viewportWidth="' + viewportWidth + '"\n\
    android:viewportHeight="' + viewportHeight + '">\n\
';

    function travel(obj, indent) {
        indent ++;

        try{
            for(var i = 0; i < obj.length; i ++) {
                // g = group
                // path = path
                if(obj[i].name == 'g') {
                    vectorDrawableXML += repeatString(' ', indent) + '<group>\n';
                    travel(obj[i].childs, indent);
                    vectorDrawableXML += repeatString(' ', indent) + '</group>\n';
                } else if(/(path|rect|circle|polygon|polyline|line|ellipse)/i.test(obj[i].name)) {
                    vectorDrawableXML += repeatString(' ', indent) + '<path\n';

                    
                    
                    // stroke, stroke-opacity = strokeColor
                    // stroke-width = strokeWidth
                    // stroke-linejoin = strokeLineJoin
                    // stroke-miterlimit = strokeMiterLimit
                    // stroke-linecap = strokeLineCap

                    // fill, opacity -> fillColor
                    var fill = '000000';
                    var opacity = 1;
                    
                    if(style && hasArrtib(obj[i].attrib, 'class')) {
                        if(getValueFromStyle('.' + obj[i].attrib.class, 'fill', style)) {
                            fill = getValueFromStyle('.' + obj[i].attrib.class, 'fill', style).replace('#', '');
                        }
                        if(getValueFromStyle('.' + obj[i].attrib.class, 'opacity', style)) {
                            opacity = getValueFromStyle('.' + obj[i].attrib.class, 'opacity', style);
                        }
                    }
                    
                    if(hasArrtib(obj[i].attrib, 'style')) {
                        if(getValueFromStyleInline('fill', getStyleInline(obj[i].attrib))) {
                            fill = getValueFromStyleInline('fill', getStyleInline(obj[i].attrib)).replace('#', '');
                        }
                        if(getValueFromStyleInline('opacity', getStyleInline(obj[i].attrib))) {
                            opacity = getValueFromStyleInline('opacity', getStyleInline(obj[i].attrib));
                        }
                    }
                    
                    if(hasArrtib(obj[i].attrib, 'fill')) {
                        fill = obj[i].attrib['fill'].replace('#', '');
                    }
                    if(hasArrtib(obj[i].attrib, 'opacity')) {
                        opacity = obj[i].attrib['opacity'];
                    }
                    
                    fill = formatHexColor(fill);
                    
                    // todo opacity+fill = fillColor
                    // opacity -> hex
                    
                    console.log(obj[i].name + '->' + fill + ', ' + opacity);
                    
                    
                    
                                      
                    
                    
                    
                    
//                    
//                  if(styleInline != '') {
//                    console.log(getValueFromStyleInline('fill', styleInline))
//                }       
                    
                    
//          if(style != '') {
//        console.log(getValueFromStyle('.cls-3', 'fillx', style))
//    }              
//                    if(hasArrtib(obj[i].attrib, 'fill')) {
//                        vectorDrawableXML += repeatString(' ', indent) + '    android:fillColor="' + getArrtibValue(obj[i].attrib, 'fill') + '"\n'
//                    } else {
//                        vectorDrawableXML += repeatString(' ', indent) + '    android:fillColor="#000"\n'
//                    }
//
//                    // FillAlpha
//                    if(hasArrtib(obj[i].attrib, 'opacity')) {
//                        vectorDrawableXML += repeatString(' ', indent) + '    android:fillAlpha="' + (Number(getArrtibValue(obj[i].attrib, 'opacity'))/100) + '"\n'
//                    }
                    
                    
                    
//                    vectorDrawableXML += repeatString(' ', indent) + '    android:fillColor="#' + fillColor + '"\n'
//
//                    // d -> pathData
//                    var d = '';
//                    if(/(rect)/i.test(obj[i].name)) {
//                        var x = obj[i].attrib.x ? parseFloat(obj[i].attrib.x) : 0;
//                        var y = obj[i].attrib.y ? parseFloat(obj[i].attrib.y) : 0;
//                        var width = parseFloat(obj[i].attrib.width);
//                        var height = parseFloat(obj[i].attrib.height);
//                        var rx = obj[i].attrib.rx ? parseFloat(obj[i].attrib.rx) : 0;
//                        var ry = obj[i].attrib.ry ? parseFloat(obj[i].attrib.ry) : 0;
//                        if(ry == 0) {
//                            ry = rx;
//                        } else if(rx == 0) {
//                            rx = ry;
//                        }
//                        d = rectToPath(x, y, width, height, rx, ry);
//                    } else if(/(circle)/i.test(obj[i].name)) {
//                        var cx = obj[i].attrib.cx ? parseFloat(obj[i].attrib.cx) : 0;
//                        var cy = obj[i].attrib.cy ? parseFloat(obj[i].attrib.cy) : 0;
//                        var r = parseFloat(obj[i].attrib.r);
//                        d = circleToPath(cx, cy, r);
//                    } else if(/(polygon|polyline|line)/i.test(obj[i].name)) {
//                        d = polygonToPath(obj[i].attrib.points);
//                    } else if(/(ellipse)/i.test(obj[i].name)) {
//                        var cx = obj[i].attrib.cx ? parseFloat(obj[i].attrib.cx) : 0;
//                        var cy = obj[i].attrib.cy ? parseFloat(obj[i].attrib.cy) : 0;
//                        var rx = obj[i].attrib.rx ? parseFloat(obj[i].attrib.rx) : 0;
//                        var ry = obj[i].attrib.ry ? parseFloat(obj[i].attrib.ry) : 0;
//                        d = ellipseToPath(cx, cy, rx, ry);
//                    } else {
//                        d = obj[i].attrib.d;
//                    }
//                    vectorDrawableXML += repeatString(' ', indent) + '    android:pathData="' + d + '"/>\n';
                    
                    
                    
                }
            }
        } catch(e) {}
    }

    travel(svg.childs, 0);
    
    console.log(svg.childs.length)

    vectorDrawableXML += '</vector>';

    if(DEBUG_MODE == true) {
//        console.log(svg);
//        console.log('---------------------------------------------------------');
//        console.log(vectorDrawableXML);
    } else {
        
        // Write vectorDrawable XML file
        if(fs.existsSync(path.dirname(drawableFilePath)) == false) {
            fs.mkdir(path.dirname(drawableFilePath), function(err) {
                if (err) throw err;
            });
        }

        fs.writeFile(drawableFilePath, vectorDrawableXML, function(err) {
            if (err) throw err;
            console.log('Save success! --> ' + drawableFilePath);
            if(errorInfo != '') {
                console.log(errorInfo);
            }
        });
        
        //console.log(svgFilePath + '-> ' + drawableFilePath + '(' + debugMode + ')');
    }
    
    

}


///////////////////////////////////////////////////////////////////////////////  
// Android
///////////////////////////////////////////////////////////////////////////////
function densityToRatio(densityStringOrDPI) {
    var standardDPI = 160;
    if(typeof densityStringOrDPI === "string") {
        switch(densityStringOrDPI) {
            case "ldpi" :
                return 120/standardDPI;
            case "mdpi" :
                return 160/standardDPI;
            case "hdpi" :
                return 240/standardDPI;
            case "xhdpi" :
                return 320/standardDPI;
            case "xxhdpi" :
                return 480/standardDPI;
            case "xxxhdpi" :
                return 640/standardDPI;
            default :
                return 1;
        }
    }
    if(typeof densityStringOrDPI === "number") {
        return densityStringOrDPI/standardDPI;
    }
}

function formatHexColor(hexColor) {
    if(hexColor.length == 3) {
        hexColor = hexColor[0] + hexColor[0] + hexColor[1] + hexColor[1] + hexColor[2] + hexColor[2];
    }
    return hexColor;
}

function repeatString(str, num) {
    var t = '';
    for(var i = 0; i < num * 4; i ++) {
        t += str;
    }
    return t;
}

function hasArrtib(obj, attrib) {
    try{
        return attrib in obj;
    } catch(e){
        return false;
    }
}

///////////////////////////////////////////////////////////////////////////////  
// Get SVG Arrituble
///////////////////////////////////////////////////////////////////////////////
function getStyleInline(obj) {
    var r = '';
    if(hasArrtib(obj, 'style')) {
        r = obj.style;
    }
    return r;
}

function getStyle(obj) {
    var r = '';
    t(obj);
    function t(o) {
        for(var i = 0; i < o.length; i ++) {
            try {
                if('childs' in o[i]) {
                    t(o[i].childs);
                }
            } catch(e) {}
            if(o[i].name == 'style') {
                r = o[i].childs[0];
            }
        }
    }
    return r;
}

function getValueFromStyle(selectors, property, styleString) {
    var r = '';
    try {
        r = styleString
            .replace(/\s{2,}/g, '')
            .replace(/[\n|\r|\t]/g, '')
            .replace(/}/g, '}\n')
            .replace(/\s?{\s?/g, '{')
            .replace(/\s?:\s?/g, ':')
            .match(RegExp(selectors + '{.*}'))[0]
            .match(RegExp(property + ':.*'))[0]
            .replace(RegExp(property + ':'), '');
        r = r.substring(0, r.indexOf(';'));
    } catch (e) {}
    return r;
}

function getValueFromStyleInline(property, styleString) {
    var r = '';
    try {
        r = styleString
            .replace(/\s?:\s?/g, ':')
            .replace(/\s?;\s?/g, ';')
            .match(RegExp(property + ':.*'))[0]
            .replace(RegExp(property + ':'), '');
        r = r.substring(0, r.indexOf(';'));
    } catch (e) {}
    return r;
}

///////////////////////////////////////////////////////////////////////////////  
// Path data convert
///////////////////////////////////////////////////////////////////////////////
function rectToPath(x, y, width, height, rx, ry) {
    var d = '';
    if(rx == 0 && ry == 0) {
        d = 'M' + x + ',' + y + 'L' + (x+width) + ',' + y + 'L' + (x+width) + ',' + (y+height) + 'L' + x + ',' + (y+height) + 'z';
    } else {
        d = 'M' + (x + rx) + ',' + y + ',' +
            'L' + (x + width - rx) + ',' + y + ',' +
            'Q' + (x + width) + ',' + y + ',' + (x + width) + ',' + (y + ry) + ',' +
            'L' + (x + width) + ',' + (y + height - ry) + ',' +
            'Q' + (x + width) + ',' + (y + height) + ',' + (x + width - rx) + ',' + (y + height) + ',' +
            'L' + (x + rx) + ',' + (y + height) + ',' +
            'Q' + x + ',' + (y + height) + ',' + x + ',' + (y + height - ry) + ',' +
            'L' + x + ',' + (y + ry) + ',' +
            'Q' + x + ',' + y + ',' + (x + rx) + ',' + y + 'z';
    }
    return d;
}

function polygonToPath(points) {
    var d = 'M' + points.replace(/\s+/g, 'L');
        if(/L$/.test(d)) {
            d.substring(0, d.length-1);
        }
        d += 'z';
    return d;
}

function circleToPath(cx, cy, r) {
    //"A rx,ry xAxisRotate LargeArcFlag,SweepFlag x,y".
    var d = 'M' + (cx-r) + ',' + cy +
            'a' + r + ',' + r + ' 0 0,1 ' + r*2 + ',0' +
            'a' + r + ',' + r + ' 0 0,1 -' + r*2 + ',0z';
    return d;
}

function ellipseToPath(cx, cy, rx, ry) {
    var controlDistanceX = rx * 0.5522847498307935;
    var controlDistanceY = ry * 0.5522847498307935;
    var d = 'M' + cx + "," + (cy - ry) + "," +
            "C" + (cx + controlDistanceX).toFixed(2) + "," + (cy - ry) + ',' + (cx + rx) + ',' + (cy - controlDistanceY).toFixed(2) + ',' + (cx + rx) + ',' + cy + ',' +
            "C" + (cx + rx) + ',' + (cy + controlDistanceY).toFixed(2) + ',' + (cx + controlDistanceX).toFixed(2) + ',' + (cy + ry) + ','  + cx + ',' + (cy + ry) + ',' +
            "C" + (cx - controlDistanceX).toFixed(2) + ',' + (cy + ry) + ',' + (cx - rx) + ',' + (cy + controlDistanceY).toFixed(2) + ',' + (cx - rx) + ',' + cy + ',' +
            "C" + (cx - rx) + ',' + (cy - controlDistanceY).toFixed(2) + ',' + (cx - controlDistanceX).toFixed(2) + ',' + (cy - ry) + ',' + cx + ',' + (cy - ry) + 'z';
    return d;
}


///////////////////////////////////////////////////////////////////////////////  
// Export Moudle
///////////////////////////////////////////////////////////////////////////////
exports.svg2drawable = svg2drawable;
