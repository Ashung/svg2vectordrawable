

var xml = require("../node_modules/node-xml-lite");
var svg = xml.parseFileSync('../doc/img/sample_1.svg');

console.log(svg);

var width = 24;
var height = 24;
var viewportWidth = 24;
var viewportHeight = 24;

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


var vectorDrawableXML = '\
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
        //console.log(obj[i].name);

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
        } else if(/(path|rect|circle|polygon)/i.test(obj[i].name)) {
            vectorDrawableXML += repeatString(' ', levelIndex * 1) + '<path\n';

            // id = name
            // d = pathData                                 MUST
            // fill = fillColor                             DEFAULT: #000
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

            // Android fillColor
            if(getArrtibValue(obj[i].attrib, 'fill') != undefined) {
                vectorDrawableXML += repeatString(' ', levelIndex * 2) + 'android:fillColor="' + getArrtibValue(obj[i].attrib, 'fill') + '"\n'
            }

            // Path data
            var d = '';
            
            if(/(rect)/i.test(obj[i].name)) {
                d = rectToPath(obj[i].attrib.x, obj[i].attrib.y, obj[i].attrib.width, obj[i].attrib.height);;
            } else if(/(polygon)/i.test(obj[i].name)) {
                d = polygonToPath(obj[i].attrib.points);
            } else {
                d = obj[i].attrib.d;
            }
            
            vectorDrawableXML += repeatString(' ', levelIndex * 2) + 'android:pathData="' + d + '"/>\n';

        }
    }
}

travel(svg.childs, 0);

vectorDrawableXML += '</vector>';

console.log('---------------------------------------------------------');
console.log(vectorDrawableXML)


function repeatString(str, num) {
    var t = '';
    for(var i = 0; i < num * 4; i ++) {
        t += str;
    }
    return t;
}

function hasArrtib(obj, attrib) {
    return attrib in obj;
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
        d += (parseInt(x)+parseInt(width)) + ',' + y + 'L';
        d += (parseInt(x)+parseInt(width)) + ',' + (parseInt(y)+parseInt(height)) + 'L';
        d += x + ',' + (parseInt(y)+parseInt(height)) + 'Z';
    return d;
}

function polygonToPath(points) {
    //<polygon fill="#3EFF36" points="2,29 9.5,16 17,29 "/>
    var d = 'M';
        d += points.replace(/ /g, 'L');
        if(/L$/.test(d)) {
            d.substring(0, d.length-1);
        }
        d += 'Z';
    return d;
}

function circleToPath() {

}