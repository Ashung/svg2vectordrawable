
const fs = require('fs');
const path = require('path');
const promisify = require('util.promisify');
const writeFile = promisify(fs.writeFile);
const mkdirp = require('mkdirp');

module.exports = function(content, filePath) {
    return new Promise((resolve, reject) => {
        let dir = path.dirname(filePath);
        fs.stat(dir, (err, stats) => {
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
};