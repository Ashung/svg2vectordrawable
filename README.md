# SVG2VectorDrawable

[中文说明](README_zh.md)

Node.js module and command-line tools for convert SVG to Android vector drawable. **Support vector drawable with gradient and clip mask.**

## Use in command-line

Install.

```shell
npm install svg2vectordrawable -g
```

Show help, you can use any one for command name as you like.

```shell
s2v -h
svg2avd -h
svg2android -h
svg2vector -h
svg2drawable -h
svg2vectordrawable -h
```

Convert a SVG to vector drawable file.

```shell
s2v -i input.svg -o output.xml
s2v -i input.svg -o res/drawable/output.xml
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

## Use in node.js

Install.

```shell
npm install svg2vectordrawable -s
```

Example 1, convert SVG code to Android Vector Drawable code, and write to a file.

```javascript
const svg2vectordrawable = require('svg2vectordrawable');
const writeFile = require('svg2vectordrawable/lib/write-content-to-file');
let svgCode = '<svg viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20"/></svg>';
svg2vectordrawable(svgCode).then(xmlCode => {
    console.log(xmlCode);
    writeFile(xmlCode, './dir/output.xml');
});
```

Example 2, convert SVG file to Android Vector Drawable file.

```javascript
const svg2vectordrawable = require('svg2vectordrawable/svg-file-to-vectordrawable-file');
svg2vectordrawable('./dir/input.svg', './dir/output.xml');
```

## License

MIT

## Donate

[Buy me a coffee](https://www.buymeacoffee.com/ashung) or donate [$5.00](https://www.paypal.me/ashung/5) [$10.00](https://www.paypal.me/ashung/10)  via PayPal.