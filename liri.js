// Require the http request module
var request = require('request');

// Require the spotify module
var spotify = require('spotify');

// Require the twitter module
var Twitter = require('twitter');

// Require the keys file
var keys = require('./keys.js');

var myKey = keys.twitterKeys;

// Require the node file system module
var fs = require('fs');
var fileName = 'log.txt';

// Save the random.txt file for do-what-it-says command
var randomFile = "random.txt";

// Capture the user input
var requestType = process.argv[2];
var userQuery   = process.argv[3];

// Establish queryUrl string
var queryUrl = "";

// Establish log string
var userRequestMsg = "User requested the " + requestType + " instruction:\n";

runSwitch();

// Query the specified API based on user input
function runSwitch() {
	switch(requestType) {
		case 'my-tweets':
			tweetIt();
			break;
		case 'spotify-this-song':
			spotifyIt(userQuery);
			break;
		case 'movie-this':
			omdbIt(userQuery);
			break;
		case 'do-what-it-says':
			getFileInfo();
			break;
		default:
			// If the user does not provide one of the required options, show input suggestion message and stop script execution
			console.log("You must enter one of the following options to proceed: \n1) my-tweets \n2) spotify-this-song \n3) movie-this \n4)do-what-it-says");
			return false;
	}
}

// Add the user request record to the log.txt file
function recordEntry(msg) {
	fs.appendFile(fileName, msg, function(err) {
		if(err) {
			console.log("There was an error appending the user transaction to " + fileName + "!");
		}
	});
}

// Retrieve random instruction from random.txt file. Specify the text encoding method, and put the text into an array
function getFileInfo() {
	fs.readFile(randomFile, "utf8", function(error, data) {
		var dataArr = data.split(",");
		console.log("dataArr: " + dataArr);
		// Reset globals and run the switch statement again
		requestType = dataArr[0];
		userQuery = dataArr[1];
		runSwitch();
	});
}

// Retrieve information from the Twitter API
function tweetIt() {
	// Establish Twitter object
	var client = new Twitter({
	  	consumer_key: 		 myKey.consumer_key,
	  	consumer_secret: 	 myKey.consumer_secret,
	  	access_token_key:    myKey.access_token_key,
	  	access_token_secret: myKey.access_token_secret
	});

	var params = {screen_name: 'trooperandz'};
	client.get('statuses/user_timeline', params, function(error, tweets, response) {
	  	if (!error) {
	  		// Show the correct response output in the console
	    	var msg = "********************\n";
			msg += "My Tweets: \n";
			tweets.forEach(function(obj, index) {
				msg += "\n";
				msg += "Tweet #" + index;
				msg += "Created: " + obj.created_at;
				msg += "Message: '" + obj.text + "'\n";
			});
			msg += "********************\n\n";

			// Output the final msg string to the console
			console.log(userRequestMsg + msg);

			// Record the transaction in the log.txt file
			recordEntry(userRequestMsg + msg);
	  	} else {
	  		console.log("There was an error getting your tweet history!");
	  	}
	});
}

// Retrieve information from the OMDB API
function omdbIt(userQuery) {
	// If user doesn't type in a movie, provide one by default
	if(userQuery == null) {
		userQuery = "Mr. Nobody";
	}

	// Establish query url
	var queryUrl = 'http://www.omdbapi.com/?t=' + userQuery +'&y=&plot=short&r=json';

	// Get the ombapi response
	request(queryUrl, function(error, response, obj) {
		// If request is successful, log ...
		if(!error && response.statusCode == 200) {
			var obj = JSON.parse(obj);
			//console.log("obj: " , JSON.parse(obj));
			var title   = obj.Title;
			var year    = obj.Year;
			var nRating = obj.Rated;
			var country = obj.Country;
			var lang    = obj.Language;
			var plot    = obj.Plot;
			var actors  = obj.Actors;
			var rating  = obj.imdbRating;

			// Build and display response message
			var msg = "********************\n";
			msg += "User searched for: " + userQuery + "\n";
			msg += "Results: \n";
			msg += "Title: " + title + "\nYear: " + year + "\nRating: " + rating + "\nProduced In: " + country + "\nLanguage: " + lang + 
						"\nPlot: " + plot + "\nActors: " + actors + "\nRating: " + rating + "\n";
			msg += "********************\n\n";
			console.log(userRequestMsg + msg);
			recordEntry(userRequestMsg + msg);
		} else {
			console.log("There was an error!");
		}
	});
}

// Retrive information from the Spotify API
function spotifyIt(userQuery) {
	spotify.search({ type: 'track', query: userQuery }, function(err, data) {
	    if (err) {
	        console.log('Error occurred: ' + err);
	        return;
	    }

	    // Establish easy access to main data object
	    var obj = data.tracks.items[0];

	    // Return artist(s) list
	    var artists = "";
	    for(var i=0; i<obj.artists.length; i++) {
	    	if(i == (obj.artists.length - 1)) {
	    		artists += obj.artists[i].name;
	    	} else {
	    		artists += obj.artists[i].name + ", ";
	    	}
	    }

	    // Establish remaining message items
	    var songTitle = obj.name;
	    var prevLink = obj.preview_url;
	    var albumName = obj.album.name;

	    // Create the console message string
	    var msg = "********************\n";
	    msg += "User searched for: " + userQuery + "\n";
	    msg += "Results: \n";
	    msg += "Artist(s): " + artists + "\nSong Title: " + songTitle + "\nPreview Link: " + prevLink + "\nAlbum: " + albumName + "\n";
	    msg += "********************\n\n";
	    console.log(userRequestMsg + msg);
	    recordEntry(userRequestMsg + msg);
	});
}