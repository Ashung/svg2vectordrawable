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

    it('supports groups with multiple transforms', function() {
        return svg2vectordrawable('<svg>\n' +
                '<g transform="scale(0.5 0.5) translate(10 10)">\n' +
            '       <rect x="0" y="0" width="10" height="10" />\n' +
            '       <circle cx="10" cy="10" r="10" />\n' +
            '   </g>\n' +
            '</svg>')
            .then(function(vd) { expect(vd).toEqual(
                '<vector xmlns:android="http://schemas.android.com/apk/res/android"\n' +
                '    android:width="24dp"\n' +
                '    android:height="24dp"\n' +
                '    android:viewportWidth="24"\n' +
                '    android:viewportHeight="24">\n' +
                '    <path\n' +
                '        android:pathData="M5 5h5v5H5z"/>\n' +
                '    <path\n' +
                '        android:pathData="M10 5a5 5 0 1 0 0 10a5 5 0 1 0 0-10z"/>\n' +
                '</vector>\n')});
    });
  
    it('Does not reject on group masks.', async () => {
        await svg2vectordrawable(`
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <mask id="mask0" maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
                    <circle cx="12" cy="12" r="12" fill="#FFFFFF" />
                </mask>
                <g mask="url(#mask0)">
                    <path d="M 0 0 L 24 0 L 24 24 L 0 24" fill="#000000" />
                </g>
            </svg>
        `);
    });

    describe('Stop offset default value support', () => {
        it('Does not throw', async () => {
            await svg2vectordrawable(`
                <svg viewBox="0 0 10 10">
                    <defs>
                        <linearGradient id="myGradient" gradientTransform="rotate(90)">
                            <stop stop-color="gold" />
                            <stop offset="95%" stop-color="red" />
                        </linearGradient>
                    </defs>
                    <circle cx="5" cy="5" r="4" fill="url(#myGradient)" />
                </svg>
            `);
        });
    });
});
