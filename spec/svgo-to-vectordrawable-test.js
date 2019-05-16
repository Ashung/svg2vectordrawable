const svg2vectordrawable = require('../lib/svg-to-vectordrawable');

describe('svg-to-vectordrawable', function() {
    it('resolves in strict mode when all elements and attributes are supported', function() {
        return svg2vectordrawable('<svg><rect width="10" height="10" /></svg>', undefined, true);
    });

    it('rejects in strict mode on nonsupported elements', function() {
        return svg2vectordrawable('<svg><rect><text>Hello</text></rect></svg>', undefined, true).then(
            function() { fail('Should throw'); },
            function(error) { expect(error).toEqual(new Error('Unsupported element text')); }
        );
    });

    it('rejects in strict mode on nonsupported attributes', function() {
        return svg2vectordrawable('<svg><rect pathLength="10" /></svg>', undefined, true).then(
            function() { fail('Should throw'); },
            function(error) { expect(error).toEqual(new Error('Unsupported attribute pathLength')); }
        );
    });
});
