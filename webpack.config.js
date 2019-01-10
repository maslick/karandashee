const path = require('path');

module.exports = {
    entry: './index.js',
    output: {
        filename: 'karandashee.min.js',
        path: path.resolve(__dirname, 'dist')
    },
    externals: {
        d3: 'd3'
    },
    mode: "production"
};