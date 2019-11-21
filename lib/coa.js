
const fs = require('fs');
const path = require('path');
const pkg = require('../package.json');
const svg2vectordrawable = require('./svg-to-vectordrawable');
const outputFile = require('./write-content-to-file');
const convertFile = require('./svg-file-to-vectordrawable-file');

let programName = process.argv[1];
let exampleText = '\n\n' +
    'Example:\n' +
    '  \x1b[31m\x1b[1m' + path.basename(programName) + '\x1b[0m -i input.svg -o output.xml\n' +
    '  \x1b[31m\x1b[1m' + path.basename(programName) + '\x1b[0m -p 4 -i input.svg -o output.xml\n' +
    '  \x1b[31m\x1b[1m' + path.basename(programName) + '\x1b[0m -i input.svg -o output_folder\n' +
    '  \x1b[31m\x1b[1m' + path.basename(programName) + '\x1b[0m -f input_folder -o output_folder\n' +
    '  \x1b[31m\x1b[1m' + path.basename(programName) + '\x1b[0m -s \'<svg>...</svg>\'\n' +
    '  \x1b[31m\x1b[1m' + path.basename(programName) + '\x1b[0m -s \'<svg>...</svg>\' -o output.xml';

// https://github.com/veged/coa
module.exports = require('coa').Cmd()
    .helpful()
    .name(programName)
    .title(pkg.description + exampleText)

    .opt()
        .name('version')
        .title('Version')
        .short('v')
        .long('version')
        .only()
        .flag()
        .act(function(opts) {
            return pkg.version;
        })
        .end()

    .opt()
        .name('input').title('Input file, must be a SVG file.')
        .short('i')
        .long('input')
        .val(function(val) {
            return val || this.reject('Option "-i, --input" must have a value.');
        })
        .end()

    .opt()
        .name('folder').title('Input folder, convert all *.svg files.')
        .short('f')
        .long('folder')
        .val(function(val) {
            return val || this.reject('Option "-f, --folder" must have a value.');
        })
        .end()

    .opt()
        .name('string').title('Input full SVG code, or a SVG tag code.')
        .short('s')
        .long('string')
        .val(function(val) {
            val = val.replace(/\n/g, "").trim();
            if (/^<.*>$/.test(val)) {
                return val;
            }
            else {
                return this.reject('Option "-s, --string" must be a SVG code.');
            }
        })
        .end()

    .opt()
        .name('output').title('Output file or folder (by default the same as the input).')
        .short('o')
        .long('output')
        .val(function(val) {
            return val || this.reject('Option "-o, --output" must have a value.');
        })
        .end()

    .opt()
        .name('precision').title('Set number of digits in the fractional part, default is 2.')
        .short('p').long('precision')
        .val(function(val) {
            if (isNaN(val)) {
                return this.reject('Option "-p, --precision" must be an natural number.');
            }
            else {
                val = Number(val);
                if (Number.isInteger(val) && val > 0) {
                    return Math.min(val, 10);
                }
                else if (val === 0){
                    return this.reject('Option "-p, --precision" can\'t be 0.');
                }
                else {
                    return this.reject('Option "-p, --precision" must be an natural number.');
                }
            }
        })
        .end()

    .act(function(opts, args) {
        if (!opts.input && !opts.string && !opts.folder) {
            return this.usage();
        }

        let input = opts.input || args.input;

        // -s '<...>' -o file
        if (opts.string) {
            svg2vectordrawable(opts.string, opts.precision, false, true).then(xml => {
                let output = opts.output;
                if (output) {
                    if (!/\.xml$/i.test(output)) {
                        output += '.xml';
                    }
                    return outputFile(xml, output).then(() => {
                        console.log(`Save to "${output}".`);
                    }).catch(err => {
                        showErrorAndExit(err.message);
                    });
                }
                else {
                    return console.log(`\nAndroid Vector Drawable Code:\n\n${xml}`);
                }
            }).catch(err => {
                return showErrorAndExit(err.message);
            });
        }
        else {
            let svgFiles = [];

            // -f
            if (opts.folder) {
                if (isDirectory(opts.folder)) {
                    fs.readdirSync(opts.folder).forEach(file => {
                        if (/\.svg$/i.test(file)) {
                            svgFiles.push(path.join(opts.folder, file));
                        }
                    });
                    if (svgFiles.length === 0) {
                        return showErrorAndExit(`Folder "${opts.folder}" has not any SVG file.`);
                    }
                }
                else if (isFile(opts.folder)) {
                    return showErrorAndExit(`File "${opts.folder}" must be a folder.`);
                }
                else {
                    return showErrorAndExit(`Folder "${opts.folder}" is not exists.`);
                }
                // -o
                if (!opts.output) {
                    opts.output = opts.folder;
                }
            }

            // -i
            if (input) {
                if (isFile(input)) {
                    if (/\.svg$/i.test(input)) {
                        svgFiles.push(input);
                    }
                    else {
                        return showErrorAndExit(`File "${input}" must be a SVG file.`);
                    }
                }
                else if (isDirectory(input)) {
                    return showErrorAndExit(`File "${input}" must be a file.`);
                }
                else {
                    return showErrorAndExit(`File "${input}" is not exists.`);
                }
                // -o
                if (!opts.output) {
                    opts.output = path.dirname(input);
                }
            }

            // output
            svgFiles.forEach(svgFile => {
                let filePath;
                if (input && /\.xml$/i.test(opts.output)) {
                    let fileName = path.basename(opts.output, '.xml').replace(/[^a-z0-9]/gi, '_').replace(/^\d+/,'').toLowerCase();
                    filePath = path.join(path.dirname(opts.output), fileName + '.xml');
                }
                else {
                    let fileName = path.basename(svgFile, '.svg').replace(/[^a-z0-9]/gi, '_').replace(/^\d+/,'').toLowerCase();
                    filePath = path.join(opts.output, fileName + '.xml');
                }
                return convertFile(svgFile, filePath, opts.precision).then(() => {
                    console.log(`∙ ${svgFile} → ${filePath}`);
                }).catch(err => {
                    showErrorAndExit(`Error ${err.message} while converting file ${svgFile}`);
                });
            });
        }
    });

function isFile(filePath) {
    if (fs.existsSync(filePath)) {
        if (fs.statSync(filePath).isFile()) {
            return true;
        }
    }
    return false;
}

function isDirectory(filePath) {
    if (fs.existsSync(filePath)) {
        if (fs.statSync(filePath).isDirectory()) {
            return true;
        }
    }
    return false;
}

function showErrorAndExit(message) {
    console.error(message);
    process.exit(1);
}
