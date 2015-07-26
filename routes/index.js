var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

var mongoose = require('mongoose');
var Post = mongoose.model('Post');
var Comment = mongoose.model('Comment');

router.get('/posts', function(request, response, next) {
  Post.find(function(error, posts) {
    if(error) { return next(error); }

    response.json(posts);
  });
});

router.post('/posts', function(request, response, next) {
  var post = new Post(request.body);

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

router.put('/posts/:post/upvote', function(request, response, next) {
  request.post.upvote(function(error, post) {
    if (error) { return next(error); }

    response.json(post);
  });
});

router.put('/posts/:post/downvote', function(request, response, next) {
  request.post.downvote(function(error, post) {
    if (error) { return next(error); }

    response.json(post);
  });
});

router.post('/posts/:post/comments', function(request, response, next) {
  var comment = new Comment(request.body);
  comment.post = request.post;

  comment.save(function(error, comment) {
    if(error) { return next(error); }

    request.post.comments.push(comment);
    request.post.save(function(error, post) {
      if (error) { return next(error); }

      response.json(comment);
    });
  });
});

router.put('/comments/:comment/upvote', function(request, response, next) {
  request.comment.upvote(function(error, comment) {
    if (error) { return next(error); }

    response.json(comment);
  });
});

router.put('/comments/:comment/downvote', function(request, response, next) {
  request.comment.downvote(function(error, comment) {
    if (error) { return next(error); }

    response.json(comment);
  });
});

module.exports = router;
