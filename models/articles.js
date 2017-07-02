let mongoose = require('mongoose');

//article schema
let articleSchema = mongoose.Schema({
  title:{
    type: String,
    required: true
  },
  author:{
    type: String,
    required: true
  },
  body:{
    type: String,
    required: true
  }
});

// Article variable is exported to the app
let Article = module.exports = mongoose.model('Article',articleSchema);
