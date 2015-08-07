
var $ = require("../svg2vectordrawable.js");

var filePath = __dirname + '/svg/android.svg';

console.log(
    '──────────SVG──────────\n' +
    $.getFileContent(filePath)
);

console.log(
    '──────────XML──────────\n' +
    $.svg2vectorDrawableContent($.getFileContent(filePath), 'xhdpi')
);
