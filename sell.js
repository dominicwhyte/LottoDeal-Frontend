var app = angular.module("app", []);

app.controller("sellController", function($scope, $http) {
	console.log("got here")

    $("#submitForm").submit(function(e) {
    	console.log("got here")
	    e.preventDefault();

    	var url = "https://localhost:8000/createPost";

	    var price = $("#price").val()
	    var title = $("#title").val()
	    var description = $("#description").val()
	    var date = $("#expirDate").val()
	    console.log("here it is: " + date)
	    //var image = $("#itemPicture").val()

	   // console.log(image)

	    data = {
	    	price: price,
	    	title: title,
	    	description: description,
	    	expirationDate: date
	    	//image: image
	    }

	    // var formData = new FormData($(this)[0]);
	    // var data = formData
	    // console.log(formData)

	    // AJAX POST TO SERVER
	    $.ajax({
		    url: url,
		    type: 'POST',
		    data:data,
		    //data: new FormData(this),
		    success: function(data) {
				console.log(data)
		    },
		    //contentType: false,
		    //processData: false,
		    error: function(response, error) {
				console.log(response)
				console.log(error)
		    }
		});

	});
})

