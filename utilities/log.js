let fs = nw.require('fs');
let path = require('path');
let logFileLocation = path.join(__dirname, '../logs/sql.log');
let errorLog = function(errorMessage) {
  let timeStamp = new Date().toISOString();
  fs.appendFile(logFileLocation, `${timeStamp}: ${errorMessage}\n`, fsErr => {
    console.log(`LOG ERROR: ${fsErr}`);
  });
};

module.exports = errorLog;
