let mongoose = require('mongoose');

//article schema
let sheet1Schema = mongoose.Schema({
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

let Sheet1 = module.exports = mongoose.model('Sheet1',sheet1Schema);
