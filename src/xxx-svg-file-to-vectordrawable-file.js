
const fs = require('fs');
const path = require('path');
const promisify = require('util').promisify;
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const mkdirp = require('mkdirp');
const svg2vectordrawable = require('./svg-to-vectordrawable');

/**
 * @param {String} content
 * @param {String} filePath
 * @returns {Promise<any>}
 */
function outputFile(content, filePath) {
    return new Promise((resolve, reject) => {
        let dir = path.dirname(filePath);
        fs.stat(dir, err => {
            if (err) {
                if (err.code === 'ENOENT') {
                    mkdirp(dir, err => {
                        if (err) {
                            reject(err);
                        }
                        else {
                            writeFile(filePath, content, 'utf8').then(() => {
                                resolve();
                            }).catch(err => reject(err));
                        }
                    });
                }
                else {
                    reject(err);
                }
            }
            else {
                writeFile(filePath, content, 'utf8').then(() => {
                    resolve();
                }).catch(err => reject(err));
            }
        });
    });
}

/**
 * @param {String} input
 * @param {String} output
 * @param {Object} options
 * @returns {Promise<any>}
 */
function convertFile(input, output, options) {
    let _options = {
        floatPrecision: options.floatPrecision || 2,
        strict: options.strict || false,
        fillBlack: options.fillBlack || false,
        xmlTag: options.xmlTag || false
    };
    return new Promise((resolve, reject) => {
        readFile(input, 'utf8').then(data => {
            svg2vectordrawable(data, _options).then(xml => {
                outputFile(xml, output).then(() => {
                    resolve();
                }).catch(err => reject(err));
            }).catch(err => reject(err));
        }, error => {
            reject(error);
        }).catch(err => reject(err));
    });
};

module.exports = {outputFile, convertFile};