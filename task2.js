var app = angular.module('app', ['firebase'])
//modify this file however you see fit

.factory('Colors', ['$http', function($http) {
  var _baseUrl = 'http://www.colr.org/json/colors/random/';

  return {
    getColors: function(num) {
      var _url = _baseUrl + num;
      var results = [];
      return $http.get(_url).then(function(data) {
        data.data.colors.forEach(function(color) {
          results.push(color.hex);
        },function() {
          results.push('error');
        });
        return results;
      });
    }
  };
}])


.factory('SavedColors', ['$firebaseArray', '$window', function($firebaseArray, $window) {
  var _url = 'https://branch2-front-end.firebaseio.com/users/';
  var clientID;
  var userRef;
  var colorRef;
  var savedColors;

  /******************************************************************************
   * Rather than making user's sign in, we treat each browser as one user
   * Store a client ID in browser's localstorage to remember clients
   * This will be an issue if users clear the browser storage or access the site
   * a different browser, but it is sufficient for our purposes here.
   *****************************************************************************/
  if ($window.localStorage.getItem('branch2ClientID')) {
    // Client already exists
    clientID = $window.localStorage.getItem('branch2ClientID');
  }
  else {
    // New client -> generate and store random client ID between 1000 and 9999
    clientID = Math.floor(Math.random() * 10000) + 1000;
    $window.localStorage.setItem('branch2ClientID', clientID);
  }

  // Get references to user and user's saved colors & create angularFire's $firebaseArray to handle syncing
  userRef = new Firebase(_url + clientID);
  colorRef = userRef.child('colors');
  savedColors = $firebaseArray(colorRef);

  return savedColors;


}])


.controller('MainController', ['$scope', 'Colors', 'SavedColors', function($scope, Colors, SavedColors) {
  //you may need to inject more services above
  $scope.colors = [];
  $scope.savedColors = SavedColors;

  // Fetch random colors from Colors service
  $scope.getColors = function() {
    $scope.colors = Colors.getColors($scope.numColors).then(function(colors) {
      $scope.colors = colors;
      $scope.numColors = undefined;
    });
  };


}])


.directive('colorBlock', function() {
  return {
    restrict: 'E',
    link: function(scope, element) {
      var background;

      // Handle error getting colors
      if (scope.color === 'error') {
        scope.color = 'Error Getting color';
        background = '#ff0909';

      }

      // Unwrap objects from $firebaseArray for saved colors
      else if (typeof scope.color === 'object') {
        background = '#' + scope.color.$value;
      }

      // Sometimes colr.org sends a blank hex value.  Here we quietly replace it with a default
      else if (!scope.color.length) {
        scope.color = 'cccccc';
        background = '#' + scope.color;
      }
      else {
        background = '#' + scope.color;   
      }

      element.find('div').eq(0).css({
        'backgroundColor': background
      });
    }
  };
});
