var redditCloneApp = angular.module('redditClone', ['ui.router'])

redditCloneApp.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider
    .state('home', {
      url: '/',
      templateUrl: '/home.html',
      controller: 'HomeCtrl'
    })
    .state('post', {
      url: '/posts/{id}',
      templateUrl: '/post.html',
      controller: 'PostCtrl'
    });

    $urlRouterProvider.when('', '/');
    $urlRouterProvider.otherwise('/');
});

redditCloneApp.service('postService', function() {
  this.posts = [];
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

      $scope.posts.push({
        title: $scope.title,
        link: $scope.link,
        upvotes: 0,
        comments: []
      });

      clearForm();
    };

    $scope.upvote = function(post) { post.upvotes += 1; };
    $scope.downvote = function(post) { post.upvotes -= 1; };
});

redditCloneApp.controller('PostCtrl', function($scope, $stateParams, postService) {
  $scope.post = postService.posts[$stateParams.id];

  var commentEmpty = function() {
    if($scope.body === '') { return true; }
  };

  var clearForm = function() {
    $scope.body = '';
  };

  $scope.addComment = function(){
    if(commentEmpty()) { return; }

    $scope.post.comments.push({
      body: $scope.body,
      author: 'user',
      upvotes: 0
    });

    clearForm();
  };
});
