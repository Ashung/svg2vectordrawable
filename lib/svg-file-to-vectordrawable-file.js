
const fs = require('fs');
const promisify = require('util.promisify');
const readFile = promisify(fs.readFile);
const svg2vectordrawable = require('./svg-to-vectordrawable');
const outputFile = require('./write-content-to-file');

/**
 * @param {String} input
 * @param {String} output
 * @param {Number} floatPrecision
 * @returns {Promise<any>}
 */
module.exports = function(input, output, floatPrecision) {
    if (floatPrecision === undefined) {
        floatPrecision = 2;
    }
    return new Promise((resolve, reject) => {
        readFile(input, 'utf8').then(data => {
            svg2vectordrawable(data, floatPrecision, false, true).then(xml => {
                outputFile(xml, output).then(() => {
                    resolve();
                }).catch(err => reject(err));
            }).catch(err => reject(err));
        }, error => {
            reject(error);
        }).catch(err => reject(err));
    });
};
