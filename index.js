

var xml = require("node-xml-lite");
var svg = xml.parseFileSync('svg/weather_cloudy_ps.svg');

//console.log(JSON.stringify(xml.parseFileSync('weather_cloudy_ps.svg'), '', '  '));

var width = 0;
var height = 0;
var viewportWidth = 0;
var viewportHeight = 0;

if(hasArrtib(svg.attrib, 'width')) {
    width = parseInt(svg.attrib.width) + 'dp';
} else if(hasArrtib(svg.attrib, 'viewBox')) {
    width = svg.attrib.viewBox.split(' ')[2] + 'dp';
}

if(hasArrtib(svg.attrib, 'height')) {
    height = parseInt(svg.attrib.height) + 'dp';
} else if(hasArrtib(svg.attrib, 'viewBox')) {
    height = svg.attrib.viewBox.split(' ')[3] + 'dp';
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
    android:width="' + width + '"\n\
    android:height="' + height + '"\n\
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
            vectorDrawableXML += repeatString(' ', levelIndex * 4) + '<group>\n';
            travel(obj[i].childs, levelIndex);
            vectorDrawableXML += repeatString(' ', levelIndex * 4) + '</group>\n';
        } else if(obj[i].name == 'path') {
            vectorDrawableXML += repeatString(' ', levelIndex * 4) + '<path\n';

            // d = pathData                                 MUST
            // fill = fillColor                             DEFAULT: #000
            // fill-opacity = fillAlpha
            // stroke = strokeColor
            // stroke-opacity = strokeAlpha
            // stroke-width = strokeWidth
            // stroke-linejoin = strokeLineJoin
            // stroke-miterlimit = strokeMiterLimit
            // stroke-linecap = strokeLineCap

            // Sketch SVG files use shapes name for id attribute.
            if(hasArrtib(obj[i].attrib, 'id')){
                vectorDrawableXML += repeatString(' ', levelIndex * 5) + 'android:name="' + obj[i].attrib.id + '"\n';
            }

            // Android fillColor
            if(getArrtibValue(obj[i].attrib, 'fill') != '') {
                vectorDrawableXML += repeatString(' ', levelIndex * 5) + 'android:fillColor="' + getArrtibValue(obj[i].attrib, 'fill') + '"\n'
            } else {
                vectorDrawableXML += repeatString(' ', levelIndex * 5) + 'android:fillColor="#000"\n'
            }



            vectorDrawableXML += repeatString(' ', levelIndex * 5) + 'android:pathData="' + obj[i].attrib.d + '"/>\n';


            //console.log(obj[i].name + '-----' + obj[i].attrib.style)
            //console.log(getStyleBlock(svg.childs) + '-----')
            //console.log(getArrtibValue(obj[i].attrib, 'fill'))


        }
    }
}

travel(svg.childs, 0);

vectorDrawableXML += '</vector>';

console.log(vectorDrawableXML)


function repeatString(str, num) {
    var t = '';
    for(var i = 0; i < num; i ++) {
        t += ' ';
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
