# SVG2VectorDrawable

Command-line tools for convert SVG to Android vector drawable.

### How to Export SVG

* Use [Illustrator SVG Exporter](https://github.com/iconic/illustrator-svg-exporter) or [Layer Exporter](https://github.com/davidderaedt/Illustrator-Layer-Exporter) for Adobe Illustrator.
* Use Sketch export slice.

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

MIT