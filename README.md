# SVG2VectorDrawable

Node.js module and Command-line tools for convert SVG to Android vector drawable.

## Use in node.js

Install.

```bash
$ npm install svg2vectordrawable --save
```

Example.

```javascript
var s2v = require("svg2vectordrawable");

console.log(s2v.svg2vectorDrawableContent(s2v.getFileContent("svg/file.svg")));

s2v.svg2vectorDrawableFile("svg/file.svg", "drawable/file.xml");
```

## Use in command-line

Install.

```shell
$ npm install svg2vectordrawable -g
```

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

MIT