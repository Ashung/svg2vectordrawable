# SVG2VectorDrawable

将 SVG 文件转化为 Android Vector Drawable 的 Node.js 模块和命令行工具，支持渐变与蒙版。

## 在命令行中使用

安装。

```shell
npm install svg2vectordrawable -g
# 显示帮助信息
s2v -h
```

转换一个 SVG 文件为 Vector Drawable 文件。

```shell
s2v -i input.svg -o output.xml
s2v -i input.svg -o res/drawable/output.xml
s2v -p 3 -i input.svg -o res/drawable/output.xml
```

转换一个下所有 SVG 文件为 Vector Drawable 文件。

```shell
s2v -f input_folder -o output_folder
```

从 SVG 代码输出 Vector Drawable 代码，或转换为 XML 文件。 

```shell
s2v -s '<rect x="2" y="2" width="20" height="20"/>'
s2v -s '<Paste from Sketch SVG code>' -o output.xml
```

## 在 Node.js 中使用

安装。

```bash
npm install svg2vectordrawable -s
```

示例 1，将 SVG 代码转为 Android Vector Drawable 代码，并写入文件。

```javascript
const svg2vectordrawable = require('svg2vectordrawable');
const writeFile = require('svg2vectordrawable/lib/write-content-to-file');
let svgCode = '<svg viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20"/></svg>';
let floatPrecision = 3; // 如果不定义默认为 2.
svg2vectordrawable(svgCode, floatPrecision).then(xmlCode => {
    console.log(xmlCode);
    writeFile(xmlCode, './dir/output.xml');
});
```

示例 2，将 SVG 文件转为 Android Vector Drawable 文件。

```javascript
const svg2vectordrawable = require('svg2vectordrawable/lib/svg-file-to-vectordrawable-file');
let floatPrecision = 3; // 如果不定义默认为 2.
svg2vectordrawable('./dir/input.svg', './dir/output.xml', floatPrecision);
```

示例 3，在 gulp 中使用。

```javascript
const path = require('path');
const vinylPaths = require('vinyl-paths');
const svg2vectordrawable = require('svg2vectordrawable/lib/svg-file-to-vectordrawable-file');

let floatPrecision = 3; // 如果不定义默认为 2.

gulp.task('vectorDrawable', () => {
    let dest = './dest/vector-drawable';
    return gulp.src('./dest/svg/*.svg')
        .pipe(vinylPaths(function (file) {
            let outputPath = path.join(dest, 'ic_' + path.basename(file).replace(/\.svg$/, '.xml'));
            return svg2vectordrawable(file, outputPath, floatPrecision);
        }));
});
```

## 版权声明

MIT

## 打赏

[使用支付宝或微信扫码支付](https://ashung.github.io/donate.html)
