# SVG2VectorDrawable

将 SVG 文件转化为 Android Vector Drawable 的 Node.js 模块和命令行工具，支持渐变与蒙版。

## 在命令行中使用

安装。

```shell
npm install svg2vectordrawable -g
```

显示帮助信息，你可以使用任意一个词作为程序名。

```
s2v -h
svg2avd -h
svg2android -h
svg2vector -h
svg2drawable -h
svg2vectordrawable -h
```

转换一个 SVG 文件为 Vector Drawable 文件。

```shell
s2v -i input.svg -o output.xml
s2v -i input.svg -o res/drawable/output.xml
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
svg2vectordrawable(svgCode).then(xmlCode => {
    console.log(xmlCode);
    writeFile(xmlCode, './dir/output.xml');
});
```

示例 2，将 SVG 文件转为 Android Vector Drawable 文件。

```javascript
const svg2vectordrawable = require('svg2vectordrawable/svg-file-to-vectordrawable-file');
svg2vectordrawable('./dir/input.svg', './dir/output.xml');
```

## 版权声明

MIT

## 打赏

[使用支付宝或微信扫码支付](https://ashung.github.io/donate.html)