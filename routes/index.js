var express = require('express');
var router = express.Router();
var passport = require('passport');
var jwt = require('express-jwt');
var auth = jwt({secret: 'SECRET', userProperty: 'payload' });

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

var mongoose = require('mongoose');
var User = mongoose.model('User');
var Post = mongoose.model('Post');
var Comment = mongoose.model('Comment');

router.post('/register', function(request, response, next) {
  if(!request.body.username || !request.body.password){
    return response.status(400).json({message: 'Please fill out all fields'});
  }

  var user = new User();

  user.username = request.body.username;

  user.setPassword(request.body.password)

  user.save(function (error){
    if(error){ return next(error); }

    return response.json({token: user.generateJWT()})
  });
});

router.post('/login', function(request, response, next){
  if(!request.body.username || !request.body.password){
    return response.status(400).json({message: 'Please fill out all fields'});
  }

  passport.authenticate('local', function(error, user, info){
    if(error){ return next(error); }

    if(user){
      return response.json({token: user.generateJWT()});
    } else {
      return response.status(401).json(info);
    }
  })(request, response, next);
});


router.get('/posts', function(request, response, next) {
  Post.find(function(error, posts) {
    if(error) { return next(error); }

    response.json(posts);
  });
});

router.post('/posts', auth, function(request, response, next) {
  var post = new Post(request.body);
  post.author = request.payload.username;

  post.save(function(error, post) {
    if(error) { return next(error); }

    response.json(post);
  });
});

router.param('post', function(request, response, next, id) {
  var query = Post.findById(id);

  query.exec(function(error, post) {
    if (error) { return next(error); }
    if (!post) { return next(new Error('can\t find post')); }

    request.post = post;
    return next();
  });
});

router.param('comment', function(request, response, next, id) {
  var query = Comment.findById(id);

  query.exec(function(error, comment) {
    if (error) { return next(error); }
    if (!comment) { return next(new Error('can\t find comment')); }

    request.comment = comment;
    return next();
  });
});

router.get('/posts/:post', function(request, response) {
  // the :post in the url will call the param('post') function to be run first, and retrieve the post by id.
  request.post.populate('comments', function(error, post) {
    if (error) { return next(error); }

    response.json(request.post);
  });
});

router.put('/posts/:post/upvote', auth, function(request, response, next) {
  request.post.upvote(function(error, post) {
    if (error) { return next(error); }

    response.json(post);
  });
});

router.put('/posts/:post/downvote', auth, function(request, response, next) {
  request.post.downvote(function(error, post) {
    if (error) { return next(error); }

    response.json(post);
  });
});

router.post('/posts/:post/comments', auth, function(request, response, next) {
  var comment = new Comment(request.body);
  comment.post = request.post;
  comment.author = request.payload.username;

  comment.save(function(error, comment) {
    if(error) { return next(error); }

    request.post.comments.push(comment);
    request.post.save(function(error, post) {
      if (error) { return next(error); }

      response.json(comment);
    });
  });
});

router.put('/comments/:comment/upvote', auth, function(request, response, next) {
  request.comment.upvote(function(error, comment) {
    if (error) { return next(error); }

    response.json(comment);
  });
});

router.put('/comments/:comment/downvote', auth, function(request, response, next) {
  request.comment.downvote(function(error, comment) {
    if (error) { return next(error); }

    response.json(comment);
  });
});

module.exports = router;
