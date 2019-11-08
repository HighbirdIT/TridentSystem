const path = require('path');

module.exports = {
  entry: './public/src/fileUploader.js',
  output: {
    filename: 'fileUploader1.js',
    path: path.resolve(__dirname, 'public/js')
  }
};