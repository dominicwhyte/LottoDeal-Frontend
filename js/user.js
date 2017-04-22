/* JS for the tabs */
$(document).ready(function() {
    $(".btn-pref .btn").click(function () {
        $(".btn-pref .btn").removeClass("btn-primary").addClass("btn-default");
        $(this).removeClass("btn-default").addClass("btn-primary");
    });
});






function createReviewFunction() {

    var searchObject = $location.search();
    var id = searchObject['id'];
    console.log(id);


    var url = "https://localhost:8000/createReview";

    console.log("posting a review NOW!")

        var sellerID = id;
        var reviewDes = $("#reviewDes").val();
        var stars = $("#stars").val();
        var reviewerID = localStorage.getItem("curUserID");



        data = {
         sellerID: sellerID,
         reviewDes: reviewDes,
         stars: stars, //change later to actual value
         reviewerID: reviewerID,
        }

        // AJAX POST TO SERVER
        $.ajax({
         url: url,
         type: 'POST',
         data: data,
         success: function(data) {
             console.log(data)
         },
         error: function(response, error) {
             console.log(response)
             console.log(error)
         }
     });

}





var app = angular.module("user_app", ["ngRoute"])

app.controller("profileController", ["$scope", "$rootScope", "$location", function($scope, $rootScope, $location) {
    
    var searchObject = $location.search();
    var id = searchObject['id'];
    console.log(id);


    $scope.selectedTab = 0

    $scope.bids = []
    $scope.items = []
    $scope.listedItems = []


    // AJAX POST TO SERVER for listed items
    var url = "https://localhost:8000/getListedItemsForUsers";
    var dataGET = {
        userID: id
    }
    console.log('Asking for ListedItems')
    $.ajax({
        url: url,
        data: dataGET,
        type: 'GET',
        success: function (data) {
            var items = JSON.parse(data)
            for (i = 0; i < items.length; i++) {
                items[i].percentageRaised = (Number(items[i].amountRaised) / Number(items[i].price)) * 100;
                console.log( "Raised" + items[i].percentageRaised);
                var expirationDate = new Date(items[i].expirationDate);
                var date = new Date();
                items[i].expirationDate = DateDiff.inHours(date, expirationDate) + " Hours " + DateDiff.inDays(date, expirationDate) + " Days left";
            }
            $scope.listedItems = items;
            console.log($scope.listedItems)
            $scope.$apply()
        },
        error: function (response, error) {
            console.log(response)
            console.log(error)
        }
    });

    $scope.soldItems = []


    // AJAX POST TO SERVER for sold items
    var url = "https://localhost:8000/getSoldItemsForUsers";
    var userID = id
    var dataGET = {
        userID: userID
    }
    console.log('Asking for SoldItems')
    $.ajax({
        url: url,
        data: dataGET,
        type: 'GET',
        success: function (data) {
            var items = JSON.parse(data)
            for (i = 0; i < items.length; i++) {
                items[i].percentageRaised = (Number(items[i].amountRaised) / Number(items[i].price)) * 100;
                console.log( "Raised" + items[i].percentageRaised);
                var expirationDate = new Date(items[i].expirationDate);
                var date = new Date();
                items[i].expirationDate = DateDiff.inHours(date, expirationDate) + " Hours " + DateDiff.inDays(date, expirationDate) + " Days left";
            }
            $scope.soldItems = items;
            console.log($scope.soldItems)
            $scope.$apply()
        },
        error: function (response, error) {
            console.log(response)
            console.log(error)
        }
    });

    $scope.reviews = []

    // AJAX POST TO SERVER for reviews
    var url = "https://localhost:8000/getReviews";
    var userID = id
    var dataGET = {
        sellerID: userID
    }
    console.log('Asking for Reviews')
    $.ajax({
        url: url,
        data: dataGET,
        type: 'GET',
        success: function (data) {
            var items = JSON.parse(data)


              var monthNames = [
    "January", "February", "March",
    "April", "May", "June", "July",
    "August", "September", "October",
    "November", "December"
  ];

            for (i = 0; i < items.length; i++) {


                var date = new Date(items[i].datePosted)
                var month = date.getMonth();
                var day = date.getDay();
                var year = date.getFullYear();
                var newDate = monthNames[month] + " " + day + ", " + year;
                items[i].datePosted = newDate;
                console.log(newDate);
            }

            $scope.reviews = items;
            console.log($scope.reviews)
            $scope.$apply()
        },
        error: function (response, error) {
            console.log(response)
            console.log(error)
        }
    });

    $scope.reviewers = []

    // AJAX POST TO SERVER for reviews
    var url = "https://localhost:8000/getReviewerImagesandNames";
    var userID = id
    var dataGET = {
        userID: userID
    }
    console.log('Asking for Reviewers')
    $.ajax({
        url: url,
        data: dataGET,
        type: 'GET',
        success: function (data) {
            var items = JSON.parse(data)
            $scope.reviewers = items;
            console.log($scope.reviewers)
            $scope.$apply()
        },
        error: function (response, error) {
            console.log(response)
            console.log(error)
        }
    });



//Code modified from http://ditio.net/2010/05/02/javascript-date-difference-calculation/
var DateDiff = {

    inHours: function (d1, d2) {
        var t2 = d2.getTime();
        var t1 = d1.getTime();
        if (t2 == null || t1 == null) {
            return 0
        }
        return (parseInt((t2 - t1) / (3600 * 1000))) % 24;
    },

    inDays: function (d1, d2) {
        var t2 = d2.getTime();
        var t1 = d1.getTime();
        if (t2 == null || t1 == null) {
            return 0
        }
        return parseInt((t2 - t1) / (24 * 3600 * 1000));
    },
}