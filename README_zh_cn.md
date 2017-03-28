# SVG2VectorDrawable

将 SVG 文件转化为 Android Vector Drawable 的 Node.js 模块和命令行工具。

## 在 Node.js 中使用

安装。

```bash
$ npm install svg2vectordrawable --save
```

示例。

```javascript
var s2v = require("svg2vectordrawable");

console.log(s2v.svg2vectorDrawableContent(s2v.getFileContent("svg/file.svg")));

s2v.svg2vectorDrawableFile("svg/file.svg", "drawable/file.xml");
```

## 在命令行中使用

安装。

```shell
$ npm install svg2vectordrawable -g
```

显示帮助信息：

```
$ s2v
```

转化一个SVG文件：

```
$ s2v icon.svg icon.xml
```
```
$ s2v svg/icon.svg res/drawable/icon.xml
```

转化一个SVG文件时指定特殊的dpi：

```
$ s2v icon.svg icon.xml xhdpi
```
```
$ s2v icon.svg res/drawable/icon.xml 320
```

从SVG代码中删除多余标签：

```
$ s2v icon.svg icon.xml "replace(/<rect fill=\"none\" width=\"24\" height=\"24\"\/>/,'')"
```

从SVG代码中删除 `<g>` 标签：

```
$ s2v icon.svg icon.xml "replace(/<g[^>]*>/gi,'').replace(/<\/g>/gi,'')"
```

转化指定文件内的SVG文件：

```
$ s2v assets/svg res/drawable
```

删除带`fill="none"`属性的`<path>`标签，可用于Illustrator生成的SVG。

```
$ s2v svg xml "replace(/<path.*fill=\"none\"[^>]*/>/gi,'')"
```

删除带`class="cls-1"`属性的`<path>`标签，图层组内最底层的图层，可用于Photoshop生成的SVG。

```
$ s2v svg xml "replace(/<[rect|path].*class=\"cls-1\"[^>]*/>/gi,'')"
```

删除带有某个颜色填充的`<path>`标签及多余`<g>`标签, 可用于Sketch生成的SVG。

```
$ s2v svg xml "replace(/<path.*fill=\"#FFFFFF\".*><\/path>/,'').replace(/<g[^>]*>/gi,'').replace(/<\/g>/gi,'')"
```

### 版权声明

MIT