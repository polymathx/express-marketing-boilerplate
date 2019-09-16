// core modules
const fs = require('fs');
const path = require('path');

function _filePred(file) {
  if (fs.statSync(path.join(__dirname, file)).isDirectory()) {
    return false;
  }
  return /\.js$/.test(file) && !/^index\.js$/.test(file);
}

const files = fs.readdirSync(__dirname).filter(f => _filePred(f));
const collection = files.reduce((p, f) => {
  let name = f.substr(0, f.length - 3);
  return { ...p, [name]: require(path.join(__dirname, f)) };
}, {});

module.exports = collection;
