# SVG2VectorDrawable

[中文说明](README_zh.md)

JavaScript module and command-line tools for convert SVG to Android vector drawable. 

## Use in command-line

Install.

```shell
npm install svg2vectordrawable -g
# Show help.
s2v -h
```

Node.js:

```javascript
const svg2vectordrawable = require('svg2vectordrawable');
```

Browser:

```javascript
const svg2vectordrawable = require('svg2vectordrawable/src/main.browser');
import svg2vectordrawable from 'svg2vectordrawable';
```

Convert a SVG to vector drawable file.

```shell
s2v -i input.svg -o output.xml
s2v -i input.svg -o res/drawable/output.xml
s2v -p 3 -i input.svg -o res/drawable/output.xml
```

Convert all SVG file in a folder to vector drawable file.

```shell
s2v -f input_folder -o output_folder
```

Show vector drawable code from SVG code, or convert it to XML file.

```shell
s2v -s '<rect x="2" y="2" width="20" height="20"/>'
s2v -s '<Paste from Sketch SVG code>' -o output.xml
```

## Use in JavaScript

Install.

```shell
npm install svg2vectordrawable -s
```

Example 1, convert SVG code to Android Vector Drawable code.

```javascript
const svg2vectordrawable = require('svg2vectordrawable');
let svgCode = '<svg viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20"/></svg>';
svg2vectordrawable(svgCode).then(xmlCode => {
    console.log(xmlCode);
});
```

With options arguments.

```javascript
let options = {
    floatPrecision: 3, // default is 2
    fillBlack: true, // Add black color to path element, defaults to false
    xmlTag: true, // Add XML Declaration, defaults to false
    tint: '#FFFFFFFF' // And tint to vector tag
};
svg2vectordrawable(svgCode, options).then(xmlCode => {
    console.log(xmlCode);
});
```

Example 2, convert SVG file to Android Vector Drawable file.

```javascript
const svg2vectordrawable = require('svg2vectordrawable/lib/svg-file-to-vectordrawable-file');
svg2vectordrawable('./dir/input.svg', './dir/output.xml');
```

Example 3，use svg2vectordrawable with gulp.

```javascript
const path = require('path');
const vinylPaths = require('vinyl-paths');
const svg2vectordrawable = require('svg2vectordrawable/lib/svg-file-to-vectordrawable-file');
gulp.task('vectorDrawable', () => {
    let dest = './dest/vector-drawable';
    return gulp.src('./dest/svg/*.svg')
        .pipe(vinylPaths(function (file) {
            let outputPath = path.join(dest, 'ic_' + path.basename(file).replace(/\.svg$/, '.xml'));
            return svg2vectordrawable(file, outputPath);
        }));
});
```

## License

MIT

## Donate

[Buy me a coffee](https://www.buymeacoffee.com/ashung) or donate [$5.00](https://www.paypal.me/ashung/5) [$10.00](https://www.paypal.me/ashung/10)  via PayPal.
