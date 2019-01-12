const path = require('path');

module.exports = {
    entry: './src/karandashee.js',
    output: {
        filename: 'karandashee.min.js',
        path: path.resolve(__dirname, 'dist')
    },
    externals: {
        d3: 'd3'
    },
    mode: "production"
};