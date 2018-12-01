
const fs = require('fs');
const promisify = require('util.promisify');
const readFile = promisify(fs.readFile);
const svg2vectordrawable = require('./svg-to-vectordrawable');
const outputFile = require('./write-content-to-file');

module.exports = function(input, output) {
    return new Promise((resolve, reject) => {
        readFile(input, 'utf8').then(data => {
            svg2vectordrawable(data).then(xml => {
                outputFile(xml, output).then(() => {
                    resolve();
                }).catch(err => reject(err));
            }).catch(err => reject(err));
        }, error => {
            reject(error);
        }).catch(err => reject(err));
    });
};