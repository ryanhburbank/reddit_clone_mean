var redditCloneApp = angular.module('redditClone', ['ui.router'])

redditCloneApp.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider
    .state('login', {
      url: '/login',
      templateUrl: '/login.html',
      controller: 'AuthCtrl',
      onEnter: function($state, authService){
        if(authService.isLoggedIn()){
          $state.go('home');
        }
      }
    })
    .state('register', {
      url: '/register',
      templateUrl: '/register.html',
      controller: 'AuthCtrl',
      onEnter: function($state, authService){
        if(authService.isLoggedIn()){
          $state.go('home');
        }
      }
    })
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


redditCloneApp.factory('authService', function($http, $window) {
  var service = {};

  service.saveToken = function(token) {
    $window.localStorage['reddit-clone-token'] = token;
  };

  service.getToken = function() {
    return $window.localStorage['reddit-clone-token'];
  };

  service.isLoggedIn = function() {
    var token = service.getToken();

    if(token) {
      var payload = JSON.parse($window.atob(token.split('.')[1]));

      return payload.exp > Date.now() / 1000;
    } else {
      return false;
    }
  };

  service.currentUser = function() {
    if(service.isLoggedIn()) {
      var token = service.getToken();
      var payload = JSON.parse($window.atob(token.split('.')[1]));

      return payload.username;
    }
  };

  service.register = function(user) {
    return $http.post('/register', user).success(function(data) {
      service.saveToken(data.token);
    });
  }

  service.logIn = function(user) {
    return $http.post('/login', user).success(function(data) {
      service.saveToken(data.token);
    });
  };

  service.logOut = function() {
    $window.localStorage.removeItem('reddit-clone-token');
  };

  return service;
});

redditCloneApp.factory('postService', function($http, authService) {
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
    return $http.post('/posts', post, {
      headers: { Authorization: 'Bearer ' + authService.getToken()}
    }).success(function(data) {
      service.posts.push(data);
    });
  };

  service.upvote = function(post) {
    return $http.put('/posts/' + post._id + '/upvote', null, {
      headers: { Authorization: 'Bearer ' + authService.getToken()}
    }).success(function(data) {
      post.upvotes += 1;
    });
  };

  service.downvote = function(post) {
    return $http.put('/posts/' + post._id + '/downvote', null, {
      headers: { Authorization: 'Bearer ' + authService.getToken()}
    }).success(function(data) {
      post.upvotes -= 1;
    });
  };

  service.addComment = function(postId, comment) {
    return $http.post('/posts/' + postId + '/comments', comment, {
      headers: { Authorization: 'Bearer ' + authService.getToken()}
    });
  };

  return service;
});

redditCloneApp.factory('commentService', function($http, authService) {
  var service = {};

  service.upvote = function(comment) {
    return $http.put('/comments/' + comment._id + '/upvote', null, {
      headers: { Authorization: 'Bearer ' + authService.getToken()}
    }).success(function(data) {
      comment.upvotes += 1;
    });
  };

  service.downvote = function(comment) {
    return $http.put('/comments/' + comment._id + '/downvote', null, {
      headers: { Authorization: 'Bearer ' + authService.getToken()}
    }).success(function(data) {
      comment.upvotes -= 1;
    });
  };

  return service;
});

redditCloneApp.controller('AuthCtrl', function($scope, $state, authService) {
  $scope.user = {};

  $scope.register = function(){
    authService.register($scope.user).error(function(error){
      $scope.error = error;
    }).then(function(){
      $state.go('home');
    });
  };

  $scope.logIn = function(){
    authService.logIn($scope.user).error(function(error){
      $scope.error = error;
    }).then(function(){
      $state.go('home');
    });
  };
});

redditCloneApp.controller('NavCtrl', function($scope, authService) {
  $scope.isLoggedIn = authService.isLoggedIn;
  $scope.currentUser = authService.currentUser;
  $scope.logOut = authService.logOut;
});

redditCloneApp.controller('HomeCtrl', function($scope, postService, authService){
    $scope.posts = postService.posts;
    $scope.isLoggedIn = authService.isLoggedIn;

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

redditCloneApp.controller('PostCtrl', function($scope, postService, commentService, post, authService) {
  $scope.post = post;
  $scope.isLoggedIn = authService.isLoggedIn;

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
