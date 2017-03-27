var app = angular.module('messagesApp', []);

app.controller('app', function($scope, $http){
    $scope.members = [];
    $scope.loadchat = function (name){
      alert(name);
    }
});