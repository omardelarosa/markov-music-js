const path = require('path');
const baseConfig = require('./webpack.base.config');

module.exports = [
    // Configure webworker
    {
        ...baseConfig,
        entry: './src/browser/Timing.worker.ts',
        target: 'webworker',
        output: {
            path: path.resolve(__dirname, '../lib'),
            filename: 'timing.worker.js',
        },
    },
];
