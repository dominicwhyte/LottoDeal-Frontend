angular.module('serverModule', ['utilsModule'])
.service('serverGet', ["dateFunctions", serverGet])
.service('serverPost', serverPost);

function serverGet(dateFunctions) {
	var DateDiff = dateFunctions.DateDiff; // define dateDiff

	this.getPosts = function(loadingIcon, $scope) {
		var url = "https://localhost:8000/getPosts";
	    loadingIcon.show()
	    $.ajax({
	        url: url,
	        type: 'GET',
	        success: function(data) {
	            console.log("completed AJAX call")
	            var items = JSON.parse(data);
	            var soldItems = [];
	            var expiredItems = [];
	            var listedItems = [];
	            console.log(items);
	            for (i = 0; i < items.length; i++) {
	                items[i].percentageRaised = (Number(items[i].amountRaised) / Number(items[i].price)) * 100;
	                // console.log( "Raised" + items[i].percentageRaised);
	                var expirationDate = new Date(items[i].expirationDate);
	                var date = new Date();
	                var hours = DateDiff.inHours(date, expirationDate)
	                var days = DateDiff.inDays(date, expirationDate)

	                if (items[i].expired) {
	                    items[i].expirationDate = "Lottery has expired!";                     
	                }
	                else if (items[i].sold) {
	                    items[i].expirationDate = items[i].winnerName;
	                }
	                else if (hours < 0 || days < 0) {
	                     items[i].expirationDate = "Negative days remaining (not expired yet)";   
	                }
	                else {
	                    items[i].expirationDate =  hours + " Hours " + days + " Days left";
	                }
	               // items[i]["src"] = 'data:image/jpeg;base64,' + btoa(items[i].data.data)

	                var image = items[i].img;
	                if (image == null) {
	                    items[i]["src"] = "https://placeholdit.imgix.net/~text?txtsize=30&txt=320%C3%97150&w=320&h=150"
	                } 
	                else if (items[i].img.compressed != null) {
	                    items[i]["src"] = items[i].img.compressed;

	                }
	                else {
	                    // WORKING SNIPPET
	                    // var binary = '';
	                    // var bytes = new Uint8Array(items[i].img.data.data);
	                    // var len = bytes.byteLength;
	                    // for (var j = 0; j < len; j++) {
	                    //     binary += String.fromCharCode(bytes[j]);
	                    // }
	                    // END WORKING SNIPPET


	                    // NOTE: EITHER ONE OF THE BELOW LINES WORK, SHOULD BE TESTED FOR SPEED
	                    // var b64 = btoa(binary);
	                    var b64 = base64ArrayBuffer(items[i].img.data.data)

	                    // var raw = String.fromCharCode.apply(null, items[i].img.data.data)

	                    // var b64=btoa(raw)
	                    var dataURL = "data:image/jpeg;base64," + b64;

	                    // if (items[i].img.compressed != null) {
	                    //     items[i]["src"] = items[i].img.compressed;
	                    // }
	                    // else {
	                    //     items[i]["src"] = dataURL;
	                    // }
	                    items[i]["src"] = dataURL;


	                    // items[i]["src"] = 'data:image/jpeg;base64,' + items[i].img.data.data;
	                    // items[i]["src"] = items[i].img.data.data;
	                }
	                if (items[i].sold == true) {
	                    soldItems.push(items[i]);
	                }
	                else if (items[i].expired == true) {
	                    expiredItems.push(items[i]);
	                }
	                else {
	                    listedItems.push(items[i]);
	                }

	            }
	            $scope.posts = listedItems;
	            $scope.soldItems = soldItems;
	            $scope.expiredItems = expiredItems;

	            console.log($scope.posts)

	            loadingIcon.hide();
	            $scope.$apply()
	        },
	        error: function(response, error) {
	            console.log(response)
	            console.log(error)
	        }
	    });
	}

	this.getNotifications = function(accessToken, $scope, itemIDs) {
		var notificationUrl = "https://localhost:8000/getNotifications";
	    var dataGET = {
	        accessToken: accessToken
	    }
	    console.log('Asking for notifications')
	    $.ajax({
	        url: notificationUrl,
	        data: dataGET,
	        type: 'GET',
	        success: function(data) {
	            var notifications = JSON.parse(data)

	            var monthNames = [
	                "January", "February", "March",
	                "April", "May", "June", "July",
	                "August", "September", "October",
	                "November", "December"
	            ];

	            var curDate = new Date();

	            for (i = 0; i < notifications.length; i++) {
	                itemIDs.push(notifications[i].itemID);
	                var date = new Date(notifications[i].datePosted);
	                var hoursAgo = Math.abs(DateDiff.inHours(curDate, date));

	                if (hoursAgo < 24) {
	                    if (hoursAgo == 0) {
	                        notifications[i].datePosted = "Under an hour ago";
	                    }
	                    else if (hoursAgo == 1) {
	                        notifications[i].datePosted = hoursAgo + " hour ago";
	                    }
	                    else {
	                        notifications[i].datePosted = hoursAgo + " hours ago";
	                        console.log(notifications[i].datePosted);
	                    }
	                }
	                else {
	                    var month = date.getMonth();
	                    var day = date.getDate();

	                    /* code taken from http://stackoverflow.com/questions/8888491/
	                     how-do-you-display-javascript-datetime-in-12-hour-am-pm-format */

	                    var hours = date.getHours();
	                    var minutes = date.getMinutes();
	                    var ampm = hours >= 12 ? 'pm' : 'am';
	                    hours = hours % 12;
	                    hours = hours ? hours : 12; // the hour '0' should be '12'
	                    minutes = minutes < 10 ? '0'+ minutes : minutes;
	                    var strTime = hours + ':' + minutes + ' ' + ampm;

	                    /* --------- */

	                    var newDate = monthNames[month] + " " + day + " at " + strTime;
	                    notifications[i].datePosted = monthNames[month] + " " + day + " at " + strTime;
	                    console.log(newDate);
	                }
	                if (!notifications[i].read) {
	                    $scope.notificationLength++;
	                }
	            }

	                var getImageForNotificationsURL = "https://localhost:8000/getImagesForNotifications";

	                var data = {
	                    itemIDs: itemIDs
	                }

	                    $.ajax({
	                    url: getImageForNotificationsURL,
	                    type: 'GET',
	                    data: data,
	                    success: function(data) {
	                        var images = JSON.parse(data)
	                        if (images.length > 5) {
	                            images = images.slice(-5);
	                        }
	                        $scope.images = images;
	                        console.log($scope.images)
	                        $scope.$apply()
	                    },
	                    error: function(response, error) {
	                        console.log(response)
	                        console.log(error)
	                    }
	                });




	            $scope.notifications = notifications;
	            console.log($scope.notifications)
	            $scope.$apply()
	        },
	        error: function(response, error) {
	            console.log(response)
	            console.log(error)
	        }
	    });
	}

	this.getSuggestions = function(accessToken, $scope) {
		var suggestionsURL = "https://localhost:8000/getSuggestions"
        if (accessToken != null) {
            $.ajax({
                url: suggestionsURL,
                type: 'GET',
                data: {
                    accessToken: accessToken
                },
                statusCode: {
                    200: function(response) {
                        $(document.body).show(); // SHOULD EDIT THIS TO BE BETTER DESIGN - WHAT IF AJAX CALL FAILS
                    },
                    404: function(response) {
                        var newDoc = document.open("text/html", "replace");
                        // console.log(response);
                        newDoc.write(response.responseText);
                        newDoc.close();
                    }
                },
                success: function(data) {
                    var parsed = JSON.parse(data)
                    console.log(parsed)
                    console.log("retrieved suggestions")


                    $scope.suggestions = parsed;
                    $scope.$apply();
                },
                error: function(response, error) {
                    console.log(response)
                    console.log(error)
                }
            });
        } else {
            console.log("Error: userID is null");
        }
	}

	this.getItem = function(id, $scope, userID) {
		var url = "https://localhost:8000/getItem"

		$.ajax({
	        url: url,
	        type: 'GET',
	        data: {
	            id: id
	        },
	        statusCode: {
	            200: function(response) {
	                $(document.body).show();
	            },
	            404: function(response) {
	                var newDoc = document.open("text/html", "replace");
	                newDoc.write(response.responseText);
	                newDoc.close();
	            }
	        },
	        success: function(data) {
	            console.log(data["_id"])
	            var parsed = JSON.parse(data)
	            console.log(parsed);
	            console.log(parsed._id)

	            // amount raised
	            parsed.percentageRaised = (Number(parsed.amountRaised) / Number(parsed.price)) * 100;
	            console.log("Raised" + parsed.percentageRaised);
	            var expirationDate = new Date(parsed.expirationDate);
	            var date = new Date();
	            parsed.hoursToGo = DateDiff.inHours(date, expirationDate)
	            parsed.daysToGo = DateDiff.inDays(date, expirationDate)
	            parsed.titleUppercase = parsed.title.toUpperCase();
	            sellerID = parsed.sellerID;

	            var image = parsed.img;

	            if (image == null) {
	                parsed["src"] = "http://placehold.it/320x150"
	            } else {
	                parsed["src"] = parsed.img.compressed;
	            }

	            // check if user can edit
	            if (parsed.sellerID == userID) {
	                console.log("matches")
	                $scope.canEdit = true;

	            } else {
	                console.log(userID + "cannot edit this post");
	            }

	            $scope.post = parsed;
	            $scope.$apply();
	        },
	        error: function(response, error) {
	            console.log(response)
	            console.log(error)
	        }
	    });

	    this.markRead = function(accessToken, $scope) {
	    	var readurl = "https://localhost:8000/markRead";
	        // var userID = localStorage.getItem("curUserID")

	        console.log(accessToken + "here's the userID in mark read");
	        var data = {
	            accessToken: accessToken
	        }
	        console.log('Asking for notifications')
	        $.ajax({
	            url: readurl,
	            data: data,
	            type: 'GET',
	            success: function(data) {
	                var notifications = JSON.parse(data)
	                $scope.notificationLength = 0;

	                var monthNames = [
	                    "January", "February", "March",
	                    "April", "May", "June", "July",
	                    "August", "September", "October",
	                    "November", "December"
	                ];

	                var curDate = new Date();

	                for (i = 0; i < notifications.length; i++) {

	                    itemIDs.push(notifications[i].itemID);

	                    var date = new Date(notifications[i].datePosted);

	                    var hoursAgo = Math.abs(DateDiff.inHours(curDate, date));

	                    if (hoursAgo < 24) {
	                        if (hoursAgo == 0) {
	                            notifications[i].datePosted = "Just Now";
	                        } else if (hoursAgo == 1) {
	                            notifications[i].datePosted = hoursAgo + " hour ago";
	                        } else {
	                            notifications[i].datePosted = hoursAgo + " hours ago";
	                            console.log(notifications[i].datePosted);
	                        }
	                    } else {
	                        var month = date.getMonth();
	                        var day = date.getDate();

	                        /* code taken from http://stackoverflow.com/questions/8888491/
	                         how-do-you-display-javascript-datetime-in-12-hour-am-pm-format */

	                        var hours = date.getHours();
	                        var minutes = date.getMinutes();
	                        var ampm = hours >= 12 ? 'pm' : 'am';
	                        hours = hours % 12;
	                        hours = hours ? hours : 12; // the hour '0' should be '12'
	                        minutes = minutes < 10 ? '0' + minutes : minutes;
	                        var strTime = hours + ':' + minutes + ' ' + ampm;

	                        /* --------- */

	                        var newDate = monthNames[month] + " " + day + " at " + strTime;
	                        notifications[i].datePosted = monthNames[month] + " " + day + " at " + strTime;
	                        console.log(newDate);
	                    }
	                }

	                $scope.notifications = notifications;
	                console.log($scope.notifications)
	                console.log("updated the notifications")
	                $scope.$apply()
	            },
	            error: function(response, error) {
	                console.log(response)
	                console.log(error)
	            }
	        });
	    }
	}

	this.getAccountsForPosts = function($scope) {
		var accountUrl = "https://localhost:8000/getAccountsForPosts";

	    $scope.accounts = []

	    $.ajax({
	        url: accountUrl,
	        type: 'GET',
	        success: function(data) {
	            var accounts = JSON.parse(data)
	            $scope.accounts = accounts;
	            console.log($scope.accounts)
	            $scope.$apply()
	        },
	        error: function(response, error) {
	            console.log(response)
	            console.log(error)
	        }
	    });
	}

	this.testFunction = function() {
		console.log("this function is working");
	}
}

function serverPost() {
	this.bid = function(itemID, amount, amountRaised, price, itemTitle, accessToken, $scope, document) {
		var handler = StripeCheckout.configure({
	        key: 'pk_test_I1JByOdv34UVHxZhjKYlKGc4',
	        image: 'https://stripe.com/img/documentation/checkout/marketplace.png',
	        locale: 'auto',
	        token: function(token) {
	            console.log('attempting stripe payment')
	            var amountToCharge = $scope.amountToCharge;
	            var itemTitle = $scope.itemTitle;
	            var itemID = $scope.itemID;
	            var amountRaised = $scope.amountRaised;
	            var price = $scope.price;

	            if (accessToken != undefined) {
	                data = {
	                    itemID: itemID,
	                    itemTitle: itemTitle,
	                    accessToken: accessToken,
	                    stripeToken: token.id,
	                    amount: Number(amountToCharge)
	                }
	                $.ajax({
	                    url: 'https://localhost:8000/performPaymentAndAddBid',
	                    data: data,
	                    type: 'POST',
	                    success: function(data) {
	                        console.log('success payment and bid added')
	                        console.log(data);

	                        post = $scope.post
	                        console.log(itemID)
	                        if (post["_id"] == itemID) {
	                            var newPrice = post.amountRaised + amountToCharge;
	                            post.amountRaised = newPrice;
	                            post.percentageRaised = (newPrice / post.price) * 100;
	                        }

	                        $scope.$apply()

	                    },
	                    error: function(response, error) {
	                        console.log(response)
	                        console.log(error)
	                    }
	                });

	            } else {
	                document.getElementById('loginMessage').innerHTML = 'You must login before you are able to bid on an item!';
	                showLoginPopup();
	                console.log('UserID is undefined')
	            }
	        }
	    });

		console.log('initiating bid');
        $scope.price = price;
        $scope.amountToCharge = amount;
        $scope.itemID = itemID
        $scope.itemTitle = itemTitle
        $scope.amountRaised = amountRaised

        if (accessToken != undefined) {

            if (price >= amountRaised + amount) {
                handler.open({
                    name: 'LottoDeal',
                    description: 'Bid on ' + itemTitle,
                    amount: amount * 100
                });
            } else {
                console.log('Bid overpasses item price!');
                BootstrapDialog.show({
                    title: 'Bid surpasses item price',
                    message: 'Choose a lower bid or search for similar items',
                    buttons: [{
                        id: 'btn-ok',
                        icon: 'glyphicon glyphicon-check',
                        label: 'OK',
                        cssClass: 'btn-primary',
                        data: {
                            js: 'btn-confirm',
                            'user-id': '3'
                        },
                        autospin: false,
                        action: function(dialogRef) {
                            dialogRef.close();
                        }
                    }]
                });
            }
        } else {
            document.getElementById('loginMessage').innerHTML = 'You must login before you are able to bid on an item!';
            showLoginPopup();
            console.log('UserID is undefined')
        }
	}

	this.deleteItem = function(id, accessToken, $scope) {
		BootstrapDialog.show({
            title: 'Are you sure you would like to delete this item?',
            message: 'This cannot be undone',
            buttons: [{
                id: 'btn-1',
                label: 'Delete Item',
                action: function(dialog) {
                    var $button = this; // 'this' here is a jQuery object that wrapping the <button> DOM element.
                    $button.disable();
                    $button.spin();
                    dialog.setClosable(false);
                    $.ajax({
                        url: 'https://localhost:8000/deleteItem',
                        data: {
                            accessToken: accessToken,
                            id: id
                        },
                        type: 'DELETE',
                        success: function(data) {
                            console.log('Success deleting item')
                            var $footerButton = dialog.getButton('btn-1');
                            $footerButton.enable();
                            $footerButton.stopSpin();
                            dialog.setClosable(true);
                            dialog.close();
                            window.location.href = 'https://dominicwhyte.github.io/LottoDeal-Frontend/index.html';
                        },
                        error: function(response, error) {
                            console.log('Error deleting item')
                            var $footerButton = dialog.getButton('btn-1');
                            $footerButton.enable();
                            $footerButton.stopSpin();
                            dialog.setClosable(true);
                        }
                    });


                }
            }]
        });
	}


	this.testFunction = function() {
		console.log("this function is working")
	}
}