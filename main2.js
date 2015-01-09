var xml = require("node-xml-lite");
var svg = xml.parseFileSync('weather_cloudy_ps.svg');


console.log(JSON.stringify(xml.parseFileSync('weather_cloudy_ps.svg'), '', '  '));








var width = parseInt(svg.attrib.width) + 'dp';
var height = parseInt(svg.attrib.height) + 'dp';
var viewportWidth = svg.attrib.viewBox.split(' ')[2];
var viewportHeight = svg.attrib.viewBox.split(' ')[3];





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
        
        if(obj[i].name == 'g') {
            vectorDrawableXML += repeatString(' ', levelIndex * 4) + '<group>\n';
            travel(obj[i].childs, levelIndex);
            vectorDrawableXML += repeatString(' ', levelIndex * 4) + '</group>\n';
        } else if(obj[i].name == 'path') {
            vectorDrawableXML += repeatString(' ', levelIndex * 4) + '<path\n';
            
            // Sketch SVG files use shapes name for id attribute.
            if(hasArrtib(obj[i].attrib, 'id')){
                vectorDrawableXML += repeatString(' ', levelIndex * 5) + 'android:name="' + obj[i].attrib.id + '"\n';
            }
            vectorDrawableXML += repeatString(' ', levelIndex * 5) + 'android:fillColor="' + getArrtibValue(obj[i].attrib, 'fill') + '"\n'
            
            
            
            
            vectorDrawableXML += repeatString(' ', levelIndex * 5) + 'android:pathData="' + obj[i].attrib.d + '"/>\n';
            
            
            //console.log();
            /*
            for(v in obj[i].attrib) {
                console.log(v);
            }
            */
            
            
            
        }
        
        
        
        
    }
}




travel(svg.childs, 0);


    vectorDrawableXML += '</vector>';


console.log(vectorDrawableXML)


console.log(getStyleBlock(svg.childs));



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

function getStyleBlock(obj) {
    /*
    for(var i = 0; i < obj.length; i ++) {
        console.log(JSON.stringify(obj[i]) + '\n-------------------------');
    }
    */
    
    t(obj);
    
    
    function t(o) {
       
        for(var i = 0; i < o.length; i ++) {
            console.log(i + '-------------------------' + (o[i].name));
            /*
            if('childs' in o[i]) {
                t(o[i]);
            }
            if(o[i].name == 'style') {
                return o[i].childs[0];
            }
            */
        }
        
        
        //return JSON.stringify(o);
        
    }
    
    
    
    
    //return JSON.stringify(obj);
}

function getArrtibValue(obj, attrib) {
    if(hasArrtib(obj, attrib))
        return eval('obj.' + attrib);
    
    if(hasArrtib(obj, 'style')) {
        var style = obj.style;
    }
    
    
    return "#000";
}





/*
g = group
path = path
    d = pathData
    fill = fillColor
    fill-opacity = fillAlpha
    stroke = strokeColor
    stroke-opacity = strokeAlpha
    stroke-width = strokeWidth
    stroke-linejoin = strokeLineJoin
    stroke-miterlimit = strokeMiterLimit
    stroke-linecap = strokeLineCap
*/


/*
<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="24dp"
    android:height="24dp"
    android:viewportWidth="24"
    android:viewportHeight="24">

    <path
        android:fillColor="#000000"
        android:pathData="M22 9.24l-7.19-.62L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 
21l-1.63-7.03L22 9.24ZM12 15.4l-3.76 2.27 1-4.28-3.32-2.88 4.38-.38L12 6.1l1.71 
4.04 4.38.38-3.32 2.88 1 4.28L12 15.4z" />
</vector>
*/


