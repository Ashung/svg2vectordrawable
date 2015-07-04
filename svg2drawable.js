

var DEBUG_MODE = false;

/*
 * String: svgFilePath '/c/vector.svg'
 * String: vectorDrawablePath  '/c/vectorDrawable.xml'
 * String: density (ldpi|mdpi|hdpi|xhdpi|xxhdpi|xxxhdpi)
 */
exports.convert = function(svgFilePath, vectorDrawablePath, density) {

    var xml = require("node-xml-lite");
    var fs = require("fs");
    var path = require("path");
    
    var svg = xml.parseFileSync(svgFilePath);
    //console.log(svg);
    
    if(arguments.length == 1) {
        vectorDrawablePath = arguments[0].replace(/.svg$/i, '.xml');
        debugMode = false;
    }
    if(arguments.length == 2 && typeof(arguments[1]) == 'boolean') {
        debugMode = arguments[1];
        vectorDrawablePath = arguments[0].replace(/.svg$/i, '.xml');
    }
    

    // Default
    var width = 24;
    var height = 24;
    var viewportWidth = 24;
    var viewportHeight = 24;
    
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
                    if(hasArrtib(obj[i].attrib, 'id')) {
                        vectorDrawableXML += repeatString(' ', indent) + '<group android:name="' + obj[i].attrib.id + '">\n';
                    } else {
                        vectorDrawableXML += repeatString(' ', indent) + '<group>\n';
                    }
                    travel(obj[i].childs, indent);
                    vectorDrawableXML += repeatString(' ', indent) + '</group>\n';
                } else if(/(path|rect|circle|polygon|polyline|ellipse)/i.test(obj[i].name)) {
                    vectorDrawableXML += repeatString(' ', indent) + '<path\n';

                    // id = name
                    // d = pathData
                    // fill = fillColor 
                    // opacity = fillAlpha
                    // stroke = strokeColor
                    // stroke-opacity = strokeAlpha
                    // stroke-width = strokeWidth
                    // stroke-linejoin = strokeLineJoin
                    // stroke-miterlimit = strokeMiterLimit
                    // stroke-linecap = strokeLineCap

                    // Sketch/Illustrator SVG files use shapes name for id attribute.
                    if(hasArrtib(obj[i].attrib, 'id')){
                        vectorDrawableXML += repeatString(' ', indent) + '    android:name="' + obj[i].attrib.id + '"\n';
                    }

                    // FillColor
                    if(hasArrtib(obj[i].attrib, 'fill')) {
                        vectorDrawableXML += repeatString(' ', indent) + '    android:fillColor="' + getArrtibValue(obj[i].attrib, 'fill') + '"\n'
                    } else {
                        vectorDrawableXML += repeatString(' ', indent) + '    android:fillColor="#000"\n'
                    }

                    // FillAlpha
                    if(hasArrtib(obj[i].attrib, 'opacity')) {
                        vectorDrawableXML += repeatString(' ', indent) + '    android:fillAlpha="' + (Number(getArrtibValue(obj[i].attrib, 'opacity'))/100) + '"\n'
                    }

                    // Path data
                    var d = '';

                    if(/(rect)/i.test(obj[i].name)) {
                        var x = obj[i].attrib.x ? parseFloat(obj[i].attrib.x) : 0;
                        var y = obj[i].attrib.y ? parseFloat(obj[i].attrib.y) : 0;
                        var width = parseFloat(obj[i].attrib.width);
                        var height = parseFloat(obj[i].attrib.height);
                        var rx = obj[i].attrib.rx ? parseFloat(obj[i].attrib.rx) : 0;
                        var ry = obj[i].attrib.ry ? parseFloat(obj[i].attrib.ry) : 0;

                        if(ry == 0) {
                            ry = rx;
                        } else if(rx == 0) {
                            rx = ry;
                        }

                        d = rectToPath(x, y, width, height, rx, ry);

                    } else if(/(circle)/i.test(obj[i].name)) {
                        var cx = obj[i].attrib.cx ? parseFloat(obj[i].attrib.cx) : 0;
                        var cy = obj[i].attrib.cy ? parseFloat(obj[i].attrib.cy) : 0;
                        var r = parseFloat(obj[i].attrib.r);
                        d = circleToPath(cx, cy, r);
                    } else if(/(polygon|polyline)/i.test(obj[i].name)) {
                        d = polygonToPath(obj[i].attrib.points);
                    } else if(/(ellipse)/i.test(obj[i].name)) {
                        var cx = obj[i].attrib.cx ? parseFloat(obj[i].attrib.cx) : 0;
                        var cy = obj[i].attrib.cy ? parseFloat(obj[i].attrib.cy) : 0;
                        var rx = obj[i].attrib.rx ? parseFloat(obj[i].attrib.rx) : 0;
                        var ry = obj[i].attrib.ry ? parseFloat(obj[i].attrib.ry) : 0;
                        d = ellipseToPath(cx, cy, rx, ry);
                    } else {
                        d = obj[i].attrib.d;
                    }

                    vectorDrawableXML += repeatString(' ', indent) + '    android:pathData="' + d + '"/>\n';
                }
            }
        } catch(e) {}
    }

    travel(svg.childs, 0);

    vectorDrawableXML += '</vector>';

    if(debugMode == true) {
        console.log(svg);
        console.log('---------------------------------------------------------');
        console.log(vectorDrawableXML);
    } else {
        
        // Write vectorDrawable XML file
        if(fs.existsSync(path.dirname(vectorDrawablePath)) == false) {
            fs.mkdir(path.dirname(vectorDrawablePath), function(err) {
                if (err) throw err;
            });
        }

        fs.writeFile(vectorDrawablePath, vectorDrawableXML, function(err) {
            if (err) throw err;
            console.log('Save success! --> ' + vectorDrawablePath);
            if(errorInfo != '') {
                console.log(errorInfo);
            }
        });
        
        //console.log(svgFilePath + '-> ' + vectorDrawablePath + '(' + debugMode + ')');
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

    function getStyleInline(obj) {
        var r = '';
        if(hasArrtib(obj, 'style')) {
            r = obj.style;
        }
        return r;
    }

    function getStyleBlock(obj) {
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
                    //console.log(o[i].childs[0]);
                }
            }
        }
        return r;
    }

    function getArrtibValue(obj, attrib) {
        var r = '';
        if(getStyleBlock(svg.childs) != '') {
            var className = obj.class;
            r = getStyleBlock(svg.childs).replace(/[ |\n|\r|\t]/g, '').replace(/}/g, '}\n');
            r = eval('r.match(/.' + className + '{.*}/)');
            r = r[0].replace('.' + className + '{', '').replace('}', '')
            eval('var t = {' + '"' + r.replace(/ /g, '').
                 replace(/;/g, '","').
                 replace(/:/g, '":"').
                 replace(/,"$/, '') + '}');
            if(hasArrtib(t, attrib)) {
                r = eval('t.' + attrib);
                return r;
            }
        }
        if(getStyleInline(obj) != '') {
            //r = obj.style.match(/fill:/i);
            eval('var t = {' + '"' + obj.style.replace(/ /g, '').
                 replace(/;/g, '","').
                 replace(/:/g, '":"').
                 replace(/,"$/, '') + '}');
            if(hasArrtib(t, attrib)) {
                r = eval('t.' + attrib);
                return r;
            }
        }
        if(hasArrtib(obj, attrib)) {
            r = eval('obj.' + attrib);
            return r;
        }
    }

    
    
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
    
}