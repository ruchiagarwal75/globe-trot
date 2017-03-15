var app = angular.module('myApp', []);
app.controller('myCtrl', function ($scope, GetDataSource) {
    $scope.trips = [
        {
            "name" : "Rupali",
            "origin" : "New Delhi (DEL)",
            "destination" : "Newark(EWR)",
            "airline" : "Indigo",
            "date" : "10/03/2017",
            "status" : "Ticket Booked",
            "type" : "Seeker",
            "view" : 6,
            "imageUrl" : "/static/images/img1.png"
        },
        {
            "name" : "Rahul",
            "origin" : "New Delhi (DEL)",
            "destination" : "Newark(EWR)",
            "airline" : "JetAir",
            "date" : "10/03/2017",
            "status" : "Ticket Booked",
            "type" : "Seeker",
            "view" : 2,
            "imageUrl" : "/static/images/img3.png"
        },
        {
            "name" : "Rupali",
            "origin" : "New Delhi (DEL)",
            "destination" : "Newark(EWR)",
            "airline" : "AIR",
            "date" : "10/03/2017",
            "status" : "Ticket Booked",
            "type" : "Seeker",
            "view" : 3,
            "imageUrl" : "/static/images/img2.png"
        },
        {
            "name" : "John",
            "origin" : "New Delhi (DEL)",
            "destination" : "Newark(EWR)",
            "airline" : "Spice JET",
            "date" : "10/03/2017",
            "status" : "Ticket Booked",
            "type" : "Seeker",
            "view" : 4,
            "imageUrl" : "/static/images/img3.png"
        },{
            "name" : "John",
            "origin" : "New Delhi (DEL)",
            "destination" : "Newark(EWR)",
            "airline" : "Indigo",
            "date" : "10/03/2017",
            "status" : "Ticket Booked",
            "type" : "Seeker",
            "view" : 4,
            "imageUrl" : "/static/images/img3.png"
        },{
            "name" : "John",
            "origin" : "New Delhi (DEL)",
            "destination" : "Newark(EWR)",
            "airline" : "Vistara",
            "date" : "10/03/2017",
            "status" : "Ticket Booked",
            "type" : "Seeker",
            "view" : 4,
            "imageUrl" : "/static/images/img3.png"
        }
    ];

    $scope.options = {
        types: ['(cities)'],
        componentRestrictions: {country: 'IN'}
    }
});

app.factory('GetDataSource', function ($http, $q) {
    var deferred = $q.defer();
    return {
        getGameData: function (url) {
            $http.get(url)
                .success(function (data) {
                    deferred.resolve(data);
                })
                .error(function (data, status) {
                    var rejectMessage = 'Error:dataSource: Request failed with status ' + status +
                        '  url = ' + url;
                    console.error(rejectMessage);
                    deferred.reject(rejectMessage);
                });

            return deferred.promise;
        }
    }
});
