// Dependencies ===============================================================
const express          = require('express');
const path             = require('path');
const mongoose         = require('mongoose');
const bodyParser       = require('body-parser');
const session          = require('express-session');
const expressValidator = require('express-validator');
const flash            = require('connect-flash');
const configdb         = require('./config/database');
//const config           = require('./config/config');
const passport         = require('passport');


// Setup DB connection =======================================================
mongoose.connect(configdb.database);
let db = mongoose.connection;
//check connection
db.once('open', function(){
    console.log('Connected to MongoDB '+configdb.dbname);
});
//check DB errors
db.on('error', function(err){
    console.log(err);
});

// Initialize app ============================================================
const app = express();

// view engine setup =========================================================
app.set('views', path.join(__dirname, 'views'));
app.set('view engine','pug');

// Setup Middleware ==========================================================
// Body parser middleware parse application/x-www-form-urlencoded
// Helps get info in req.body.title from Form
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

// Set public folder -----------------------------------------
app.use(express.static(path.join(__dirname, 'public')));

// express session middleware --------------------------------
app.use(session({
  secret: 'kfh3487jlsdfj022#@',
  resave: true,
  saveUninitialized: true
}));

// express messages middleware ---------------------------------
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// express validator middleware --------------------------------
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

//Passport config ---------------------------------------------
require('./config/passport')(passport);
// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

  // Global var for user object - for all routes
  app.get('*', function(req, res, next){
    res.locals.user = req.user || null;
    next();
  });


//  Bring in the Article Model for home page
let Article = require('./models/articles');

// Setup Routes ==============================================================
// Home route display all articles from db when user is logged in
// logic can be found in index.pug
app.get('/', function(req,res){
  Article.find({}, function(err, articles){
    if(err){
      console.log(err);
    } else {
      res.render('index', {
         title:'Article List',
         articles: articles
      });
    }
  });
});

// route file -----------------------------------------
let articles = require('./routes/articles');
app.use('/article', articles);
let users = require('./routes/users');
app.use('/users', users);
let uploads = require('./routes/upload');
app.use('/upload', uploads);

//Start server ==============================================================
app.listen(3000, function(){
  console.log('server started on port 3000');
});
//======================================================================================
// DEVELOPER:                   Andre Couturier
// DATE:                        June 5 2017
// PLATFORM/VERSION:            Windows
// PROJECT:                     nodexcel
// DESCRIPTION:                 Sample Project with Mongo db, full CRUD and login
// DATABASE:                    MongoDB nodexcel
// ASSUMPTIONS:                 
// COMMENTS                     Based on Brad Traversy Videos
// MODIFICATION HISTORY BY: {Developper Name}               DATE: {Date of modification}
//======================================================================================

// let articles = [
//   {
//     id:1,
//     title: 'Article 1',
//     author: 'Jane Doe',
//     body: 'This is article one'
//   },
//   {
//     id:2,
//     title: 'Article 2',
//     author: 'Jim Doe',
//     body: 'This is article two'
//   },
//   {
//     id:3,
//     title: 'Article 3',
//     author: 'John Smith',
//     body: 'This is article three'
//   }
// ]
