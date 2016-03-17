var mongoose = require('mongoose');
var connectionString = process.env.MONGO_URL || 'mongodb://localhost/nextApp';

var options = {
  server  : {
      socketOptions : {
          keepAlive : 1,
          connectTimeoutMS: 30000
      }
  }
};

mongoose.connect(connectionString, options);

module.exports = mongoose
