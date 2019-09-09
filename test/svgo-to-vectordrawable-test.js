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
            '       <rect />\n' +
            '       <circle />\n' +
            '   </g>\n' +
            '</svg>')
            .then(function(vd) { expect(vd).toEqual(
                '<vector xmlns:android="http://schemas.android.com/apk/res/android"\n' +
                '    android:width="24dp"\n' +
                '    android:height="24dp"\n' +
                '    android:viewportWidth="24"\n' +
                '    android:viewportHeight="24">\n' +
                '    <group\n' +
                '        android:scaleX="0.5"\n' +
                '        android:scaleY="0.5"\n' +
                '        android:translateX="10"\n' +
                '        android:translateY="10">\n' +
                '        <path\n' +
                '            android:fillColor="#000"\n' +
                '            android:pathData="M0,0h0v0H0z"/>\n' +
                '        <path\n' +
                '            android:fillColor="#000"\n' +
                '            android:pathData="M0 0z"/>\n' +
                '    </group>\n' +
                '</vector>\n')});
    });

    describe('Stop offset default value support', () => {
        it('Does not throw', async () => {
            await svg2vectordrawable(`
                <svg viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
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
