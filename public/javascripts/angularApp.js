var redditCloneApp = angular.module('redditClone', ['ui.router'])

redditCloneApp.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider
    .state('home', {
      url: '/',
      templateUrl: '/home.html',
      controller: 'HomeCtrl',
      resolve: {
        postPromise: function(postService) {
          return postService.index();
        }
      }
    })
    .state('post', {
      url: '/posts/{id}',
      templateUrl: '/post.html',
      controller: 'PostCtrl',
      resolve: {
        post: function($stateParams, postService) {
          return postService.show($stateParams.id);
        }
      }
    });

    $urlRouterProvider.when('', '/');
    $urlRouterProvider.otherwise('/');
});

redditCloneApp.factory('postService', function($http) {
  var service = { posts: [] };

  service.index = function() {
    return $http.get('/posts').success(function(data) {
      angular.copy(data, service.posts);
    });
  };

  service.show = function(postId) {
    return $http.get('/posts/' + postId).then(function(response) {
      return response.data;
    });
  };

  service.create = function(post) {
    return $http.post('/posts').success(function(data) {
      service.posts.push(data);
    });
  };

  service.upvote = function(post) {
    return $http.put('/posts/' + post._id + '/upvote').success(function(data) {
      post.upvotes += 1;
    });
  };

  service.downvote = function(post) {
    return $http.put('/posts/' + post._id + '/downvote').success(function(data) {
      post.upvotes -= 1;
    });
  };

  service.addComment = function(postId, comment) {
    return $http.post('/posts/' + postId + '/comments', comment);
  };

  return service;
});

redditCloneApp.factory('commentService', function($http) {
  var service = {};

  service.upvote = function(comment) {
    return $http.put('/comments/' + comment._id + '/upvote').success(function(data) {
      comment.upvotes += 1;
    });
  };

  service.downvote = function(comment) {
    return $http.put('/comments/' + comment._id + '/downvote').success(function(data) {
      comment.upvotes -= 1;
    });
  };

  return service;
});

redditCloneApp.controller('HomeCtrl', function($scope, postService){
    $scope.posts = postService.posts;

    var clearForm = function() {
      $scope.title = '';
      $scope.link = '';
    };

    var titleBlank = function() {
      return ($scope.title === '' || $scope.title === undefined) ? true : false
    };

    $scope.addPost = function() {
      if (titleBlank()) { return; };

      postService.create({
        title: $scope.title,
        link: $scope.link
      });

      clearForm();
    };

    $scope.upvote = function(post) { postService.upvote(post); };
    $scope.downvote = function(post) { postService.downvote(post); };
});

redditCloneApp.controller('PostCtrl', function($scope, postService, commentService, post) {
  $scope.post = post;

  var commentEmpty = function() {
    if($scope.body === '') { return true; }
  };

  var clearForm = function() {
    $scope.body = '';
  };

  $scope.addComment = function(){
    if(commentEmpty()) { return; }

    postService.addComment($scope.post._id, {
      body: $scope.body,
    }).success(function(comment) {
      $scope.post.comments = ($scope.post.comments || []);
      $scope.post.comments.push(comment);
    });

    clearForm();
  };

  $scope.upvoteComment = function(comment) { commentService.upvote(comment); };
  $scope.downvoteComment = function(comment) { commentService.downvote(comment); };
});
