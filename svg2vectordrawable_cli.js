#! /usr/bin/env node

////////////////////////////////////////////////////////////////////////////////
//
// Copyright [2015] [Ashung Hung ashung.hung@gmail.com]
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
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
