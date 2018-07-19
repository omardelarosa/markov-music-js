const baseConfig = {
    mode: 'production',
    resolve: {
        // Add `.ts` and `.tsx` as a resolvable extension.
        extensions: ['.ts', '.tsx', '.js'],
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
            },
            {
                test: /\.worker\.js$/,
                loader: 'raw-loader',
            },
        ],
    },
};

module.exports = baseConfig;
