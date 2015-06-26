#! /usr/bin/env node

var svg2drawable = require('./svg2drawable.js');
var fs = require("fs");
var path = require("path");

var svgFilePath = process.argv[2];
var vectorDrawablePath = process.argv[3];

if(!svgFilePath) {
    console.log(
        'SVG to VectorDrawable version 1.0\n' +
        'svg2drawable input.svg output.xml\n' +
        'svg2drawable input_folder\n'
    );
} else {
    
    if(!fs.existsSync(svgFilePath)) {
        console.log('Directory or SVG file is no found.');
    } else {
        
        // File
        if(fs.statSync(svgFilePath).isFile()) {
            //console.log('-file');
            if(!vectorDrawablePath) {
                vectorDrawablePath = path.dirname(svgFilePath) + '/' + path.basename(svgFilePath, '.svg') + '.xml';
            } else {
                if(fs.statSync(vectorDrawablePath).isDirectory()) {
                    vectorDrawablePath = path.normalize(vectorDrawablePath + '/' + path.basename(svgFilePath, '.svg') + '.xml');
                }
            }
            //console.log(svgFilePath + ' ---> ' + vectorDrawablePath);
            svg2drawable.convert(svgFilePath, vectorDrawablePath);
        }

        // Folder
        if(fs.statSync(svgFilePath).isDirectory()) {
            //console.log('-directory');
            fs.readdirSync(svgFilePath).forEach(function (file) {
                
                var fileInDir = path.join(svgFilePath, file);
                
                // Filter SVG files
                if (fs.statSync(fileInDir).isFile() && path.extname(fileInDir) == '.svg') {
                    
                    var svgInDir = fileInDir;
                    var drawablePathInDir = path.dirname(svgInDir) + '/' + path.basename(svgInDir, '.svg') + '.xml';
                    
//                    try{
//                        if(fs.statSync(vectorDrawablePath).isDirectory()) {
//                            drawablePathInDir = path.normalize(vectorDrawablePath + '/' + path.basename(svgInDir, '.svg') + '.xml');
//                        }
//                    } catch(e) {}
                    
                    console.log(svgInDir + ' ---> ' + drawablePathInDir);
                    svg2drawable.convert(svgInDir, drawablePathInDir);

                }
            });
        }    
    
    }
    
}