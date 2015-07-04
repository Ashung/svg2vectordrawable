#! /usr/bin/env node

var drawable2svg = require('./drawable2svg.js');
var fs = require("fs");
var path = require("path");

var vectorDrawablePath = process.argv[2];
var svgFilePath = process.argv[3];


if(!vectorDrawablePath) {
    console.log(
        'VectorDrawable to  SVG version 1.0\n' +
        'drawable2svg input.xml output.svg\n' +
        'drawable2svg input_folder\n'
    );
} else {
    
    if(!fs.existsSync(vectorDrawablePath)) {
        console.log('Directory or XML file is no found.');
    } else {
        
        // File
        if(fs.statSync(vectorDrawablePath).isFile()) {
            //console.log('-file');
            if(!svgFilePath) {
                svgFilePath = path.dirname(vectorDrawablePath) + '/' + path.basename(vectorDrawablePath, '.xml') + '.svg';
            } else {
                if(!/.svg$/i.test(svgFilePath)) {
                    if(fs.existsSync(svgFilePath) == false) {
                        fs.mkdir(svgFilePath, function(err) {
                            if (err) throw err;
                        });
                    }
                    svgFilePath = path.normalize(svgFilePath + '/' + path.basename(vectorDrawablePath, '.xml') + '.svg');
                }
            }
            console.log(vectorDrawablePath + ' > ' + svgFilePath);
            drawable2svg.convert(vectorDrawablePath, svgFilePath);
        }

        // Folder
        if(fs.statSync(vectorDrawablePath).isDirectory()) {
            //console.log('-directory');
            if(!svgFilePath) {
                svgFilePath = vectorDrawablePath;
            } else {
                if(fs.existsSync(svgFilePath) == false) {
                    fs.mkdir(svgFilePath, function(err) {
                        if (err) throw err;
                    });
                }
            }
            
            fs.readdirSync(vectorDrawablePath).forEach(function (file) {
                
                var fileInDir = path.join(vectorDrawablePath, file);
                
                // Filter XML files
                if (fs.statSync(fileInDir).isFile() && path.extname(fileInDir) == '.xml') {
                    
                    var xmlInDir = fileInDir;
                    var svgPathInDir = path.normalize(svgFilePath + '/' + path.basename(xmlInDir, '.xml') + '.svg');
                    
                    console.log(xmlInDir + ' > ' + svgPathInDir);
                    drawable2svg.convert(xmlInDir, svgPathInDir);

                }
            });
        }    
    
    }
    
}