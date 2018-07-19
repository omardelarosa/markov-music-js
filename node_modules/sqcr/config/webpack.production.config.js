const path = require('path');
const baseConfig = require('./webpack.base.config');

module.exports = [
    // Configure browser client
    {
        ...baseConfig,
        entry: {
            browser: './src/browser/Client.ts',
            standalone: './src/browser/Loader.ts',
        },
        output: {
            path: path.resolve(__dirname, '../lib'),
            filename: '[name].js',
            libraryExport: 'default',
            library: 'SQCR',
        },
        externals: {
            osc: 'osc',
            'web-midi': 'WebMidi',
        },
    },
];
