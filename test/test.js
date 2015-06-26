

var fs = require("fs");
var path = require("path");


var vector = '';
fs.readFile("/Users/ylyulong/Desktop/drawable/android.xml", function(err, data) {
    if (err) throw err;
    
    
    
    
    vector = data.toString()
                .replace(/\n/g, '')
                .replace(/\s+/g, ' ')
                .replace(/<!--.*?-->(\s)?/g, '')
                .replace(/<vector/gi, '<svg')
                .replace(/<\/vector>/gi, '</svg>')
                .replace(/<group/gi, '<g')
                .replace(/<\/group>/gi, '</g>')
                .replace(/>\s</gi, '><')
                .replace(/xmlns:android=\"http:\/\/schemas.android.com\/apk\/res\/android"/, 'xmlns="http://www.w3.org/2000/svg"');
    
    var viewportWidth = /android:viewportWidth=\".*?\"/.exec(vector)[0];
        viewportWidth = viewportWidth.substring(viewportWidth.indexOf('"') + 1, viewportWidth.lastIndexOf('"'));
    var viewportHeight = /android:viewportHeight=\".*?\"/.exec(vector)[0];
        viewportHeight = viewportHeight.substring(viewportHeight.indexOf('"') + 1, viewportHeight.lastIndexOf('"'));
    
    vector = vector.replace(/android:viewportWidth=\".*?\"/, '')
                .replace(/android:viewportHeight=\".*?\"/, '')
                .replace(/>/, 'viewBox="0 0 ' + viewportWidth + ' ' + viewportHeight + '">')
                .replace(/android:width/gi, 'width')
                .replace(/android:height/gi, 'height')
                .replace(/android:name/gi, 'id')
                .replace(/android:pathData/gi, 'd')
                .replace(/android:fillColor/gi, 'fill');
    
    
       //.substr(/android:viewportWidth=\".*?\"/.exec(vector)[0].indexOf('"')), /android:viewportWidth=\".*?\"/.exec(vector)[0].length-1   
    //<svg xmlns="http://www.w3.org/2000/svg" width="' + width + '" height="' + height + '" viewBox="0 0 ' + viewportWidth + ' ' + viewportHeight + '">';
    //<g 
    //<path fill="#9FBF3B" d="
    
    console.log(vector);
});




//console.log('\033[32m'+data.toString().replace(/\n/g, '').replace(/\s+/g, ' ') +'\033[39m');  
//console.log("READ FILE SYNC END");  


