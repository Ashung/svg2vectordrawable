# SVG2VectorDrawable

将SVG文件转化为Android vectordrawable的命令行工具。

### 如何导出SVG

* Adobe Illustrator 用户推荐使用[Illustrator SVG Exporter](https://github.com/iconic/illustrator-svg-exporter)或者[Layer Exporter](https://github.com/davidderaedt/Illustrator-Layer-Exporter)。
* Adobe PhotoShop CC 2014+ 用户推荐使用[Generate Assets](https://github.com/adobe-photoshop/generator-assets/wiki/Generate-Web-Assets-Functional-Spec)。
* Sketch 使用自带的切片或图层导出，多色图案不建议使用画板。

### 如何使用SVG2VectorDrawable

#### Step.1 安装node.js

从官方网站([https://nodejs.org](https://nodejs.org/download/))下载并安装适用平台的安装包。

#### Step.2 下载源码

```
$ git clone https://github.com/Ashung/svg2vectordrawable.git
```

或者下载[master.zip](https://github.com/iconic/illustrator-svg-exporter/archive/master.zip)并解压至指定目录下。

#### Step.3 安装SVG2VectorDrawable

```
$ cd svg2vectordrawable
$ npm install
$ sudo npm link
```

#### Step.4 SVG2VectorDrawable语法

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

#### 有用的命令

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


----

# SVG2VectorDrawable

Command-line tools for convert SVG to Android vector drawable.

### How to Export SVG

* Use [Illustrator SVG Exporter](https://github.com/iconic/illustrator-svg-exporter) or [Layer Exporter](https://github.com/davidderaedt/Illustrator-Layer-Exporter) for Adobe Illustrator.
* Use [Generate Assets](https://github.com/adobe-photoshop/generator-assets/wiki/Generate-Web-Assets-Functional-Spec) for Adobe PhotoShop CC 2014+.
* Use Sketch export group or slice.

### How to use SVG2VectorDrawable

#### Step.1 Intall node.js.

Download the installer for your platform from
official website([https://nodejs.org](https://nodejs.org/download/)) and  intall.

#### Step.2 Download codes.

```
$ git clone https://github.com/Ashung/svg2vectordrawable.git
```

or download [master.zip](https://github.com/iconic/illustrator-svg-exporter/archive/master.zip), and extract the zip file.

#### Step.3 Install SVG2VectorDrawable.

```
$ cd svg2vectordrawable
$ npm install
$ sudo npm link
```

#### Step.4 Have fan with SVG2VectorDrawable.

Show the help.

```
$ s2v
```

Convert one SVG file.

```
$ s2v icon.svg icon.xml
```
```
$ s2v svg/icon.svg res/drawable/icon.xml
```

Convert one SVG file with special dpi.

```
$ s2v icon.svg icon.xml xhdpi
```
```
$ s2v icon.svg res/drawable/icon.xml 320
```

Remove the extra element from SVG.

```
$ s2v icon.svg icon.xml "replace(/<rect fill=\"none\" width=\"24\" height=\"24\"\/>/,'')"
```

Remove the `<g>` tag from SVG.

```
$ s2v icon.svg icon.xml "replace(/<g[^>]*>/gi,'').replace(/<\/g>/gi,'')"
```

Convert svg files in a folder.

```
$ s2v assets/svg res/drawable
```

#### Useful commands

Remove the `<path>` tag with `fill="none"` property，use for SVG export from Illustrator.

```
$ s2v svg xml "replace(/<path.*fill=\"none\"[^>]*/>/gi,'')"
```

Remove the `<path>` tag with `class="cls-1"` property，allways the bottom layer in the layer group，use for SVG export from Photoshop.

```
$ s2v svg xml "replace(/<[rect|path].*class=\"cls-1\"[^>]*/>/gi,'')"
```

Remove the `<path>` tag with special color and extra `<g>` tags, use for SVG export from Sketch.

```
$ s2v svg xml "replace(/<path.*fill=\"#FFFFFF\".*><\/path>/,'').replace(/<g[^>]*>/gi,'').replace(/<\/g>/gi,'')"
```

### License

Apache License, Version 2.0