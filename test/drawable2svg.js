



/*
 * String: vectorDrawablePath  '/c/vectorDrawable.xml'
 * String: svgFilePath '/c/vector.svg'
 */
exports.convert = function(vectorDrawablePath, svgFilePath, debugMode) {

    var xml = require("node-xml-lite");
    var fs = require("fs");
    var path = require("path");
    
    var vector = xml.parseFileSync(vectorDrawablePath, 'utf-8');
    //console.log(vector);
    
    if(arguments.length == 1) {
        svgFilePath = arguments[0].replace(/.xml$/i, '.svg');
        debugMode = false;
    }
    if(arguments.length == 2 && typeof(arguments[1]) == 'boolean') {
        debugMode = arguments[1];
        svgFilePath = arguments[0].replace(/.xml$/i, '.svg');
    }

    // Default
    var width = parseInt(vector.attrib['android:width']) ? parseInt(vector.attrib['android:width']) : 
                (parseInt(vector.attrib['android:viewportWidth']) ? parseInt(vector.attrib['android:viewportWidth']) : 24);
    var height = parseInt(vector.attrib['android:height']) ? parseInt(vector.attrib['android:height']) :
                 (parseInt(vector.attrib['android:viewportHeight']) ? parseInt(vector.attrib['android:viewportHeight']) : 24);
    var viewportWidth = parseInt(vector.attrib['android:viewportWidth']) ? parseInt(vector.attrib['android:viewportWidth']) : 
                        (parseInt(vector.attrib['android:width']) ? parseInt(vector.attrib['android:width']) : 24);
    var viewportHeight = parseInt(vector.attrib['android:viewportHeight']) ? parseInt(vector.attrib['android:viewportHeight']) :
                        (parseInt(vector.attrib['android:height']) ? parseInt(vector.attrib['android:height']) : 24);


    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + width + '" height="' + height + '" viewBox="0 0 ' + viewportWidth + ' ' + viewportHeight + '">';

    function travel(obj) {
        try{
            for(var i = 0; i < obj.length; i ++) {
                if(obj[i].name == 'path') {
                    svg += '<path d="' + obj[i].attrib['android:pathData'] + '" ';

                    // FillColor
                    if(hasArrtib(obj[i].attrib, 'android:fillColor')) {
                        if(/(#fff|#*fff|#ffffff|#*2ffffff)/i.test(obj[i].attrib['android:fillColor'])) {
                            svg += 'fill="#000"';
                        } else {
                            svg += 'fill="' + obj[i].attrib['android:fillColor'] + '"';
                        }
                    }

                    svg += '/>';
                }
            }
        } catch(e) {}
    }

    travel(vector.childs);

    svg += '</svg>';

    
    if(debugMode == true) {
        console.log(vector);
        console.log('---------------------------------------------------------');
        console.log(svg);
    } else {

        // Write SVG file
        if(fs.existsSync(path.dirname(svgFilePath)) == false) {
            fs.mkdir(path.dirname(svgFilePath), function(err) {
                if (err) throw err;
            });
        }

        fs.writeFile(svgFilePath, svg, function(err) {
            if (err) throw err;
            console.log('Save success!');
        });
    }


    function hasArrtib(obj, attrib) {
        try{
            return attrib in obj;
        } catch(e){
            return false;
        }
    }
    
}
