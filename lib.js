



/*
 * String: svgFilePath '/c/vector.svg'
 * String: vectorDrawablePath  '/c/vectorDrawable.xml'
 */
exports.convert = function(svgFilePath, vectorDrawablePath) {
    var xml = require("node-xml-lite");
    var fs = require("fs");
    var path = require("path");
    
    var svg = xml.parseFileSync(svgFilePath);

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

    function travel(obj, levelIndex) {
        levelIndex ++;
        for(var i = 0; i < obj.length; i ++) {

            // g = group
            // path = path
            if(obj[i].name == 'g') {
                if(hasArrtib(obj[i].attrib, 'id')) {
                    vectorDrawableXML += repeatString(' ', levelIndex * 1) + '<group android:name="' + obj[i].attrib.id + '">\n';
                } else {
                    vectorDrawableXML += repeatString(' ', levelIndex * 1) + '<group>\n';
                }
                travel(obj[i].childs, levelIndex);
                vectorDrawableXML += repeatString(' ', levelIndex * 1) + '</group>\n';
            } else if(/(path|rect|circle|polygon|ellipse)/i.test(obj[i].name)) {
                vectorDrawableXML += repeatString(' ', levelIndex * 1) + '<path\n';

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
                    vectorDrawableXML += repeatString(' ', levelIndex * 1) + 'android:name="' + obj[i].attrib.id + '"\n';
                }

                // FillColor
                if(hasArrtib(obj[i].attrib, 'fill')) {
                    vectorDrawableXML += repeatString(' ', levelIndex * 2) + 'android:fillColor="' + getArrtibValue(obj[i].attrib, 'fill') + '"\n'
                } else {
                    vectorDrawableXML += repeatString(' ', levelIndex * 2) + 'android:fillColor="#000"\n'
                }

                // FillAlpha
                if(hasArrtib(obj[i].attrib, 'opacity')) {
                    vectorDrawableXML += repeatString(' ', levelIndex * 2) + 'android:fillAlpha="' + (Number(getArrtibValue(obj[i].attrib, 'opacity'))/100) + '"\n'
                }

                // Path data
                var d = '';

                if(/(rect)/i.test(obj[i].name)) {
                    var x = obj[i].attrib.x ? obj[i].attrib.x : 0;
                    var y = obj[i].attrib.y ? obj[i].attrib.y : 0;
                    d = rectToPath(x, y, obj[i].attrib.width, obj[i].attrib.height);;
                } else if(/(circle)/i.test(obj[i].name)) {
                    var cx = obj[i].attrib.cx ? obj[i].attrib.cx : 0;
                    var cy = obj[i].attrib.cy ? obj[i].attrib.cy : 0;
                    d = circleToPath(cx, cy, obj[i].attrib.r);
                } else if(/(polygon)/i.test(obj[i].name)) {
                    d = polygonToPath(obj[i].attrib.points);
                } else {
                    d = obj[i].attrib.d;
                }
                /*
                else if(/(ellipse)/i.test(obj[i].name)) {
                    d = ellipseToPath(obj[i].attrib.cx, obj[i].attrib.cy, obj[i].attrib.rx, obj[i].attrib.ry);
                }
                */

                vectorDrawableXML += repeatString(' ', levelIndex * 2) + 'android:pathData="' + d + '"/>\n';

            }

            if(/(ellipse)/i.test(obj[i].name)) {
                vectorDrawableXML += repeatString(' ', levelIndex * 1) + '<!-- SVG file include unsupport <ellipse> tag. -->\n';
                errorInfo += 'SVG file include unsupport <ellipse> tag.\n'
            }
        }
    }

    travel(svg.childs, 0);

    vectorDrawableXML += '</vector>';

    //console.log(svg);
    //console.log('---------------------------------------------------------');
    //console.log(vectorDrawableXML);
    
    
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

    function rectToPath(x, y, width, height) {
        var d = 'M';
            d += x + ',' + y + 'L';
            d += (Number(x)+Number(width)) + ',' + y + 'L';
            d += (Number(x)+Number(width)) + ',' + (Number(y)+Number(height)) + 'L';
            d += x + ',' + (Number(y)+Number(height)) + 'z';
        return d;
    }

    function polygonToPath(points) {
        var d = 'M';
            d += points.replace(/\s+/g, 'L');
            if(/L$/.test(d)) {
                d.substring(0, d.length-1);
            }
            d += 'Z';
        return d;
    }

    function circleToPath(cx, cy, r) {
        var d = 'M' + (Number(cx)-Number(r)) + ',' + cy;
            //"A rx,ry xAxisRotate LargeArcFlag,SweepFlag x,y".
            d += 'a' + r + ',' + r + ' 0 0,1 ' + Number(r)*2 + ',0';
            d += 'a' + r + ',' + r + ' 0 0,1 -' + Number(r)*2 + ',0z';
        return d;
    }

    function ellipseToPath(cx, cy, rx, ry) {
        var d = 'M0,0L' + (Number(cx)+Number(rx)) + ',0L' + (Number(cx)+Number(rx)) + ',' + (Number(cy)+Number(ry)) + 'L0,' + (Number(cy)+Number(ry)) + 'z';
        // M0,0L40,0L40,32L0,32z
        //<ellipse cx="20" cy="16" rx="20" ry="16"/>
        //<path d="M20,0
        //c11.05,0,20,7.16,20,16
        //s-8.95,16-20,16
        //S0,24.84,0,16
        //S8.95,0,20,0z"/>
        return d;
    }
    
}