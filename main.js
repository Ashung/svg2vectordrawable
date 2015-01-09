var fs = require('fs');
var SVGO = require('svgo');
var svg2js = require('svgo/lib/svgo/svg2js');
var svgo = new SVGO();




fs.readFile('weather_cloudy_ps.svg', 'utf8', function(err, data) {
    var svgData;
    var svgJS;
    
    if(err) {
        throw err;
    }

    svgo.optimize(data, function(result) {
        svgData = result.data;
        //console.log(result.data + '\n-----------------------');
        
        svg2js(result.data, function(p) {
            svgJS = p;
            console.log(JSON.stringify(p, '', '  '));
        });
    });
    
    var width = parseInt(svgJS.content[0].attrs.width.value) + 'dp';
    var height = parseInt(svgJS.content[0].attrs.height.value) + 'dp';
    
    
    
    var viewportWidth = svgJS.content[0].attrs.viewBox.value.split(' ')[2];
    var viewportHeight = svgJS.content[0].attrs.viewBox.value.split(' ')[3];
    
    
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

            if(obj[i].elem == 'g') {
                vectorDrawableXML += repeatString(' ', levelIndex * 4) + '<group>\n';
                travel(obj[i].content, levelIndex);
                vectorDrawableXML += repeatString(' ', levelIndex * 4) + '</group>\n';
            } else if(obj[i].elem == 'path') {
                vectorDrawableXML += repeatString(' ', levelIndex * 4) + '<path android:pathData="' + obj[i].attrs.d.value + '"/>\n';
                //console.log();
            }

        }
    }

    travel(svgJS.content[0].content, 0);

    vectorDrawableXML += '</vector>';


    console.log(vectorDrawableXML)


    function repeatString(str, num) {
        var t = '';
        for(var i = 0; i < num; i ++) {
            t += ' ';
        }
        return t;

    }

    
    
});



//



/*







*/

/*







*/


