var app = angular.module('app', [])
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

.controller('MainController', ['$scope', 'Colors',function($scope, Colors) {
  //you may need to inject more services above
  $scope.colors = [];

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
