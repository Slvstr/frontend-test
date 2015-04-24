var app = angular.module('app', ['firebase', 'ngResource'])
//modify this file however you see fit


.factory('RandomColors', ['$resource', function($resource) {
  var _url = 'http://www.colr.org/json/colors/random/:numColors';

  return $resource(_url, {}, {
    query: {
      method: 'GET',
      isArray: true,
      transformResponse: function(data) {
        return angular.fromJson(data).colors.map(function(colorObj) {
          return colorObj.hex;
        });
      }
    }
  });

}])


// Old version of random colors factory using $http.  Replaced with RandomColors factor above
// which uses $resource instead.  

// .factory('Colors', ['$http', function($http) {
//   var _baseUrl = 'http://www.colr.org/json/colors/random/';

//   return {
//     getColors: function(num) {
//       var _url = _baseUrl + num;
//       var results = [];
//       return $http.get(_url).then(function(data) {
//         data.data.colors.forEach(function(color) {
//           results.push(color.hex);
//         },function() {
//           results.push('error');
//         });
//         return results;
//       });
//     }
//   };
// }])


.factory('SavedColors', ['$firebaseArray', '$window', function($firebaseArray, $window) {
  var _url = 'https://branch2-front-end.firebaseio.com/users/';
  var clientID;
  var userRef;
  var colorRef;
  var savedColors;

  /******************************************************************************
   * Rather than making users sign in, we treat each browser as one user.
   * Store a client ID in the browser's localstorage to remember clients
   * This will be an issue if users clear the browser storage or access the site
   * from a different browser, but it is sufficient for our purposes here.
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


.controller('MainController', ['$scope', 'RandomColors', 'SavedColors', function($scope, RandomColors, SavedColors) {
  //you may need to inject more services above
  $scope.randomColors = [];
  $scope.savedColors = SavedColors;

  // Fetch random colors from Colors service
  $scope.getColors = function() {
    $scope.randomColors = RandomColors.query({numColors: $scope.numColors});
  };


}])


.directive('colorBlock', function() {
  return {
    restrict: 'E',
    link: function(scope, element) {
      var background;

      // Handle error getting colors
      if (scope.color === 'error') {
        scope.color = 'Error Getting Color';
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
