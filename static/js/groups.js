var app = angular.module('mainApp', []);

app.controller('app', function($scope, $http){
    $scope.members = [];
    $scope.searchEnter = function (){
        if(event.which == 13) {
            $scope.addMember();
        }
    }
    $scope.addMember = function (){
        $scope.members.push($scope.member);
        $scope.member = '';
    }
    $scope.removeMember = function(data){
        $scope.members.splice($scope.members.indexOf(data),1);
    }
    $scope.createGroup = function () {
          $('#succ').addClass('show');
        var data={members:$scope.members, groupName: $scope.groupName};
        var serializedData = $.param(data);
        $http({
            method: 'POST',
                url: '/createGroup',
                data: serializedData,
                headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }).then(function(res){
            $('#succ').addClass('show');
        })
    }
});