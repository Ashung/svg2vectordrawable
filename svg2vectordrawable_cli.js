#! /usr/bin/env node

////////////////////////////////////////////////////////////////////////////////
//
// Copyright 2017 Ashung Hung (ashung.hung@gmail.com)
//
// Permission is hereby granted, free of charge, to any person obtaining a copy 
// of this software and associated documentation files (the "Software"), to deal 
// in the Software without restriction, including without limitation the 
// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or 
// sell copies of the Software, and to permit persons to whom the Software is 
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in 
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL 
// THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING 
// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER 
// DEALINGS IN THE SOFTWARE.
//
////////////////////////////////////////////////////////////////////////////////


var banner = '\
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐\n\
│                                                                                                  │\n\
│  SVG2VectorDrawable 1.0                                                                          │\n\
│                                                                                                  │\n\
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │\n\
│                                                                                                  │\n\
│  $ s2v icon.svg icon.xml                                                                         │\n\
│  $ s2v icon.svg res/drawable/icon.xml                                                            │\n\
│  $ s2v icon.svg res/drawable/icon.xml xhdpi                                                      │\n\
│  $ s2v icon.svg res/drawable/icon.xml 320                                                        │\n\
│  $ s2v icon.svg icon.xml "replace(/<rect\\s+width=\\"\\d+\\"\\s+height=\\"\d+\\"\\/>/g,"")"               │\n\
│  $ s2v icon.svg icon.xml xhdpi "javascript"                                                      │\n\
│  $ s2v assets/svg res/drawable                                                                   │\n\
│  $ s2v assets/svg res/drawable xhdpi "javascript"                                                │\n\
│                                                                                                  │\n\
└──────────────────────────────────────────────────────────────────────────────────────────────────┘';

var $ = require('./svg2vectordrawable');
var fs = require('fs');
var path = require('path');
var args = process.argv.slice(2);

if(args.length > 1) {

    if(fs.existsSync(args[0])) {

        if(fs.statSync(args[0]).isFile() && path.extname(args[1]) == '.xml') {

            var svgFile = args[0];
            var vectorDrawableFile = args[1];
            var density = args[2] ? args[2] : 'nodpi';
            var runScript = args[3];

            if(args.length == 3 &&
               !/^(ldpi|mdpi|hdpi|xhdpi|xxhdpi|xxxhdpi|nodpi)/i.test(args[2]) &&
               isNaN(parseInt(args[2]))) {
                density = 'nodpi';
                runScript = args[2];
            }

            // console.log(svgFile + ', ' + vectorDrawableFile + ', ' + density + ', ' + runScript);

            var svgContent = $.getFileContent(svgFile, runScript);
            var vectorDrawableContent = $.svg2vectorDrawableContent(svgContent, density);

            console.log(svgFile + ' -> ' + vectorDrawableFile + ' (' + density + ')');
            $.createFile(vectorDrawableFile, vectorDrawableContent, true);

        }

        else if(fs.statSync(args[0]).isDirectory()) {

            var svgFolder = args[0];
            var vectorDrawableFolder = args[1];
            var density = args[2] ? args[2] : 'nodpi';
            var runScript = args[3];

            fs.readdirSync(svgFolder).forEach(function (file) {

                // Filter svg files
                var fileInDir = path.join(svgFolder, file);
                if (fs.statSync(fileInDir).isFile() && path.extname(fileInDir) == '.svg') {

                    var svgFile = fileInDir;
                    var vectorDrawableFile = path.join(vectorDrawableFolder, path.basename(svgFile, '.svg') + '.xml');

                    if(args.length == 3 &&
                       !/^(ldpi|mdpi|hdpi|xhdpi|xxhdpi|xxxhdpi|nodpi)/i.test(args[2]) &&
                       isNaN(parseInt(args[2]))) {
                        density = 'nodpi';
                        runScript = args[2];
                    }

                    var svgContent = $.getFileContent(svgFile, runScript);
                    var vectorDrawableContent = $.svg2vectorDrawableContent(svgContent, density);

                    console.log(svgFile + ' -> ' + vectorDrawableFile + ' (' + density + ')');
                    $.createFile(vectorDrawableFile, vectorDrawableContent, true);

                }

            });
        }

        else {
            console.log('Syntax error.');
            console.log(banner);
        }

    } else {
        console.log('"' + args[0] + '" is not found.');
        console.log(banner);
    }

} else {
    console.log(banner);
}
