angular.module('redditClone', []).controller('PostCtrl', [ '$scope', function($scope){
    $scope.posts = [
      {title: 'post 1', upvotes: 5},
      {title: 'post 2', upvotes: 2},
      {title: 'post 3', upvotes: 15},
      {title: 'post 4', upvotes: 9},
      {title: 'post 5', upvotes: 4}
    ];

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
        upvotes: 0
      });
      clearForm();
    };

    $scope.upvote = function(post) { post.upvotes += 1; };
    $scope.downvote = function(post) { post.upvotes -= 1; };
}]);
