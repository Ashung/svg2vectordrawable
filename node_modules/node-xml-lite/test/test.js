var
    xml = require('../index.js'),
    filename = __dirname + '/test.xml';

function logXML(data) {
    console.log(JSON.stringify(data, '   ', '\t'));
}



console.log("sync mode");
logXML(xml.parseFileSync(filename));

logXML(xml.parseString("<xml>from string €</xml>"));


console.log("async mode");
xml.parseFile(filename, function(err, root){
    logXML(root)
});

