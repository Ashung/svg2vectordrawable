# SVG2VectorDrawable

Command-line tools for convert SVG to Android vector drawable.

1, Intall nodejs.

2, Download codes.

    $ git clone https://github.com/Ashung/svg2vectordrawable.git

3, Install svg2drawable

    $ cd svg2vectordrawable
    $ sudo npm link

4,  Convert one file.
    
    $ s2v icon.svg icon.xml

    $ s2v icon.svg res/drawable/icon.xml

    $ s2v icon.svg res/drawable/icon.xml xhdpi

    $ s2v icon.svg res/drawable/icon.xml 320

    $ s2v icon.svg icon.xml "replace(/<rect\s+width=\"24\"\s+height=\"24\"\/>/g,"")"

    $ s2v icon.svg icon.xml xhdpi "javascript"


5, Convert svg files in folder.

    $ s2v assets/svg res/drawable

    $ s2v assets/svg res/drawable xhdpi "javascript"

