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

    it(`Flag 'fillBlack' uses black fill for paths with no fill.`, async () => {
        // Flag
        await svg2vectordrawable(`
            <svg width="24" height="24" viewBox="0 0 24 24">
                <path d="M5 5h5v5H5z"/>
            </svg>
        `,
        undefined,
        undefined,
        true, // blackDefault
        ).then(function(vd) { expect(vd).toEqual(
            '<vector xmlns:android="http://schemas.android.com/apk/res/android"\n' +
            '    android:width="24dp"\n' +
            '    android:height="24dp"\n' +
            '    android:viewportWidth="24"\n' +
            '    android:viewportHeight="24">\n' +
            '    <path\n' +
            '        android:fillColor="#000"\n' +
            '        android:pathData="M5 5h5v5H5z"/>\n' +
            '</vector>\n')});

        // No flag
        await svg2vectordrawable(`
            <svg width="24" height="24" viewBox="0 0 24 24">
                <path d="M5 5h5v5H5z"/>
            </svg>
        `).then(function(vd) { expect(vd).toEqual(
            '<vector xmlns:android="http://schemas.android.com/apk/res/android"\n' +
            '    android:width="24dp"\n' +
            '    android:height="24dp"\n' +
            '    android:viewportWidth="24"\n' +
            '    android:viewportHeight="24">\n' +
            '    <path\n' +
            '        android:pathData="M5 5h5v5H5z"/>\n' +
            '</vector>\n')});
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

    describe('Hanldes rect as masks.', () => {
        it('Does not reject', async () => {
            await svg2vectordrawable(`
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <mask id="mask0" mask-type="alpha" maskUnits="userSpaceOnUse" x="2" y="2" width="20" height="20">
                        <rect x="2" y="2" width="20" height="20" rx="4" fill="#000000"/>
                    </mask>
                    <g mask="url(#mask0)">
                        <path d="M 0 0 L 24 0 L 24 24 L 0 24" fill="#000000" />
                    </g>
                </svg>
            `);
        });
    });

    it('applies group attributes correctly to rounded rectangles', function() {
        return svg2vectordrawable('<svg>\n' +
                '<g transform="scale(0.5 0.5) translate(10 10)" fill="#000000" fill-rule="nonzero">\n' +
            '       <rect x="0" y="0" width="10" height="10" rx="4" />\n' +
            '       <rect x="0" y="0" width="10" height="10" rx="4" />\n' +
            '   </g>\n' +
            '</svg>')
            .then(function(vd) { expect(vd).toEqual(
                '<vector xmlns:android="http://schemas.android.com/apk/res/android"\n' +
                '    android:width="24dp"\n' +
                '    android:height="24dp"\n' +
                '    android:viewportWidth="24"\n' +
                '    android:viewportHeight="24">\n' +
                '    <path\n' +
                '        android:fillColor="#000"\n' +
                '        android:pathData="M0 4c0-2.21 1.79-4 4-4h2c2.21 0 4 1.79 4 4v2c0 2.21-1.79 4-4 4h-2c-2.21 0-4-1.79-4-4z"/>\n' +
                '    <path\n' +
                '        android:fillColor="#000"\n' +
                '        android:pathData="M0 4c0-2.21 1.79-4 4-4h2c2.21 0 4 1.79 4 4v2c0 2.21-1.79 4-4 4h-2c-2.21 0-4-1.79-4-4z"/>\n' +
                '</vector>\n')});
    });

    it('Handles gradient inital stop color', async () => {
        await svg2vectordrawable(`
            <svg width="240" height="240" viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg">
                <path d="M 0 0 H 240 V 240 H 0 Z" fill="url(#paint)"/>
                <defs>
                    <linearGradient id="paint" x1="0" y1="0" x2="240" y2="240" gradientUnits="userSpaceOnUse">
                        <stop stop-color="#636363"/>
                        <stop offset="1"/>
                    </linearGradient>
                </defs>
            </svg>
        `);
    });
});
