const express = require('express');
const router = express.Router();

//  Bring in Models
let Article = require('../models/articles');

// Add article form route
router.get('/add', ensureAuth, function(req,res){
  res.render('add_article', {
  title: 'Add article'
  });
});

// Get single article
router.get('/:id', function(req, res){
  Article.findById(req.params.id, function(err,article){
    res.render('article', {
      article:article
    });
  });
});

// Add Submit POST route
router.post('/add', function(req,res){
  req.checkBody('title', 'Title is required').notEmpty();
  req.checkBody('author', 'Author is required').notEmpty();
  req.checkBody('body', 'Body is required').notEmpty();

  //Get errors
  let errors = req.validationErrors();
  if(errors){
    res.render('add_article',{
      title:'Add Article',
      errors:errors
    });
  } else {
    let article = new Article();
    article.title = req.body.title;
    article.author = req.body.author;
    article.body = req.body.body;
    // Save user form entry in the DB
    article.save(function(err){
      if(err){
        console.log(err);
        return;
      } else{
        req.flash('success', 'Article Added');
        res.redirect('/');
      }
    });
  }
});

// Load edit form with single article data
router.get('/edit/:id', ensureAuth, function(req, res){
  Article.findById(req.params.id, function(err,article){
    res.render('edit_article', {
      title: 'Edit Article',
      article:article
    });
  });
});
// Update Submit POST route
router.post('/edit/:id', function(req, res){
  let article = {};
  article.title = req.body.title;
  //console.log(article.title);
  article.author = req.body.author;
  article.body = req.body.body;

  let query = {_id:req.params.id}
  //console.log(query);
  Article.update(query, article, function(err){
    if(err){
      console.log(err);
      return;
    } else{
        req.flash('success', 'Article Updated');
        res.redirect('/');
    }
  });
});
// Delete selected article from db
router.delete('/:id', function(req,res){
  if(!req.user._id){
    res.status(500).send();
  }
  let query = {_id:req.params.id}

  Article.remove(query, function(err){
    if(err){
      console.log(err);
    }
    res.send('Success');
  });
});

// Access control
function ensureAuth(req, res, next){
  if(req.isAuthenticated()){
    return next();
  } else {
    req.flash('danger','Please login');
    res.redirect('/users/login');
  }
}

module.exports = router;
