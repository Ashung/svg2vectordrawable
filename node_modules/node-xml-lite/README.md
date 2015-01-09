# node-xml-lite

 - This is a pure javascript XML SAX parser for Node.js.
 - The specificity of this xml parser is that it can parse a document from a Buffer.
 - It relies on iconv-lite to decode the text according to the code page of the document.

## Install

    npm install node-xml-lite

## Simple usage
    
### Parse a file 
 
    xml = require("node-xml-lite");
    
    xml.parseFile(filename, function(err, root){
      ...
    });
    
### Parse a file synchronously

    xml.parseFileSync(filename));
    
### Parse a string

    xml.parseString("<xml>hello</xml>");

### Parse a buffer

    xml.parseBuffer(new Buffer("<xml>hello</xml>"));

## Advanced usage

### parsing a file in SAX mode

    xml.SAXParseFile(filename,
      function(state, a, b) {
        switch (state) {
          case xml.xtOpen:
            // a is node name
            ...
            break;
          case xml.xtClose
            ...
            break;
          case xml.xtAttribute:
            // a is attribute name
            // b is attribute value
            ...
            break;
          case xml.xtText:
            // a is a text value
            break;
          case xml.xtCData:
            // a is a CDATA text value
            ...
            break;
          case xml.xtComment
            // a is a comment text value
            ...
            break;
        };
        // tell the parser to continue
        return true;
      },
      function(err){
        // parser done, check error
        ...
      }
    );
    
you can also use the sync function, 

    xml.SAXParseFileSync(filename, event)
    
### providing your own data to SAX parser

    var parser = new xml.XMLParser();
    var ret = parser.parserBuffer(buffer, len, event);
    if (ret === true) {
      // stopped by event result
    } else
    if (ret === false) {
      // there is a parsing error at:
      //   parser.line 
      //   parser.col
    } else
    if (ret === undefined) {
      // it is ok, continue ...
    }

you can also parse a string

    var ret = parser.parseString(str, event);