

var fs = require("fs");
var path = require("path");

var vectorDrawableDir = 'drawable';
var svgDir = 'svg';

fs.readdir(vectorDrawableDir, function(err, files) {
        
        if (err) throw err;
    
        for(var i = 0; i < files.length; i++) {
            if(fs.existsSync(path.join(vectorDrawableDir, files[i])) && path.extname(files[i]) == '.xml') {
                var xmlInDir = path.join(vectorDrawableDir, files[i]);
                var svgInDir = path.normalize(svgDir + '/' + path.basename(xmlInDir, '.xml') + '.svg');

                if(fs.existsSync(path.dirname(svgInDir)) == false) {
                    fs.mkdir(path.dirname(svgInDir), function(err) {
                        if (err) throw err;
                    });
                }

                //console.log(xmlInDir+ ' > ' +svgInDir);

                drawable2svg(xmlInDir, svgInDir);
                
            }
        }

    }
);


function drawable2svg(drawable, svg) {
    
    
    fs.readFile(drawable, function(err, data) {
        if (err) throw err;

        if(!/<vector/i.test(data.toString())) {
            console.log(drawable + ' > ' + svg);
            console.log('No VectorDrawable.');
            console.log('---------------------------------------------------------');
            return;
        } else {
            var svgCode = '';
            svgCode = data.toString()
                        .replace(/\n/g, '')
                        .replace(/\s+/g, ' ')
                        .replace(/<!--.*?-->(\s)?/g, '')
                        .replace(/<inset.*?>/gi, '')
                        .replace(/<\/inset>/gi, '')
                        .replace(/<\?xml version=".*?" encoding=".*?"\?>(\s)?/, '')
                        .replace(/xmlns:android="http:\/\/schemas.android.com\/apk\/res\/android"/, '')
                        .replace(/<vector/gi, '<svg xmlns="http://www.w3.org/2000/svg"')
                        .replace(/<\/vector>/gi, '</svg>')
                        .replace(/<group/gi, '<g')
                        .replace(/<\/group>/gi, '</g>')
                        .replace(/>\s</gi, '><')
                        .replace(/"(\s)?\/>/g, '"/>');
                        
            
            var width = /android:width=".*?"/.exec(svgCode)[0].replace(/android:width="/, '').replace(/(dp|px)"/i, '');
            var height = /android:height=".*?"/.exec(svgCode)[0].replace(/android:height="/, '').replace(/(dp|px)"/i, '');
            var viewportWidth = /android:viewportWidth=\".*?\"/.exec(svgCode)[0];
                viewportWidth = viewportWidth.substring(viewportWidth.indexOf('"') + 1, viewportWidth.lastIndexOf('"'));
            var viewportHeight = /android:viewportHeight=\".*?\"/.exec(svgCode)[0];
                viewportHeight = viewportHeight.substring(viewportHeight.indexOf('"') + 1, viewportHeight.lastIndexOf('"'));
            
            var translateX;
            var translateY;

            svgCode = svgCode.replace(/android:viewportWidth=\".*?\"/, '')
                        .replace(/android:viewportHeight=\".*?\"/, '')
                        .replace(/>/, 'viewBox="0 0 ' + viewportWidth + ' ' + viewportHeight + '">')
                        .replace(/android:width/gi, 'width')
                        .replace(/android:height/gi, 'height')
                        .replace(/android:name/gi, 'id')
                        .replace(/android:pathData/gi, 'd')
                        .replace(/android:fillColor/gi, 'fill')
                        .replace(/android:fillAlpha/gi, 'opacity')
                        .replace(/android:strokeAlpha/gi, 'stroke-opacity')
                        .replace(/android:scaleX=".*?"/gi, '')
                        .replace(/android:scaleY=".*?"/gi, '')
                        .replace(/android:pivotX=".*?"/gi, '')
                        .replace(/android:pivotY=".*?"/gi, '')
                        .replace(/android:translateX=".*?"/gi, '')
                        .replace(/android:translateY=".*?"/gi, '')
                        .replace(/android:insetLeft=".*?"/gi, '')
                        .replace(/android:insetRight=".*?"/gi, '')
                        .replace(/android:autoMirrored=".*?"/gi, '')
                        .replace(/fill="@color\/.*?"/gi, 'fill="#000"')
                        .replace(/dp"/gi, '"')
                        .replace(/\s+/g, ' ');


            console.log('\033[32m' + drawable + ' > ' + svg + '\033[39m');
            console.log(svgCode);
            console.log('---------------------------------------------------------');
            
            fs.writeFileSync(svg, svgCode);
            
        }
    });

}
