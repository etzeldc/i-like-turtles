// Requiring various needed modules (Bringing these modules in).
var express = require('express'); // Default express stuffs.
var bodyParser = require('body-parser'); // Default body parser stuffs.
var expressSession = require('express-session'); // Default express sessions stuffs.
var mongodb = require('mongodb'); // Default mongodb stuffs.
var ObjectID = require("mongodb").ObjectId; // Default object id stuffs.

var db; // Sets global db variable (OK, because the server listening doesn't start until we set this value in the mongo connect call back).

mongodb.MongoClient.connect('mongodb://localhost', function(err, database) { // Connects to mongo.
	if (err) { // If an error occurs...
		console.log(err); // consoles the error, and...
		return; // returns,
	} // but if there is no error...
	console.log("Connected to Database"); // consoles a success message,
	db = database; // sets the global variable to the mongo database,
	startListening(); // and starts the server.
});

var app = express(); // Sets a global app variable to create the express app.

// Adds req.body to each POST request (Attaching Body Parser module to the app variable).
app.use(bodyParser.json()); // Default body parser stuffs.
app.use(bodyParser.urlencoded({ // Default body parser stuffs.
	extended: true // Default body parser stuffs.
}));

// Add req.session to every request (Attaching Express Session module to the app variable).
app.use(expressSession({ // Default stuffs.
	secret: 'keyboard cat', // Default express sessions stuff. ***Can avoid pushing to github by typing "secret" in .gitignore file.***
	resave: false,  // Default express sessions stuffs.
	saveUninitialized: true // Default express sessions stuffs.
}));

// Get Turtles
app.get('/api/turtles', function(req, res) { // Receives the get request for this endpoint from getTurtles(), and calls this function that...
	if (!req.session.user) { // checks to see if the current user isn't logged in, if not...
		res.status(403); // assigns a 403 status, 
		res.send("forbidden"); // sends a forboding response message, and...
		return; // returns.
	} // Otherwise...
	db.collection('turtles').find({}).toArray(function(err, data){ // returns the collection in the form of a JSON array, and calls this function that...
		if (err) { // checks to see if there's an error, if so...
			console.log(err); // consoles the error,
			res.status(500); // assigns a 500 status,
			res.send("error"); // sends an error response message, and...
			return; //returns.
		} // Otherwise...
		res.send(data); // sends the data as a response.
	}); 
});

// Create Turtles
app.post('/api/newTurtle', function(req, res) { // Receives the post request for this endpoint from the submit turtle button's click, and calls this function that...
	if (!req.session.user) { // checks to see if the current user isn't logged in, if not...
		res.status(403); // assigns a 403 status, 
		res.send("forbidden"); //sends a forboding response message, and...
		return; // returns.
	} // Otherwise
	db.collection('turtles').insertOne({ // insert the new turtle profile to the turtles collection with:
		name: req.body.name, // the provided name,
		color: req.body.color, // the provided color,
		weapon: req.body.weapon,  // the provided weapon,
		submitter: req.session.user._id,  // the user's id that submitted the turtle, and...
		pizza: 0 // a brand new pizza count set to zero...
	}, function(err, data) { // and calls this function that...
		if (err) { // checks to see if there's an error, if so...
			console.log(err); // consoles the error,
			res.status(500); // assigns a 500 status,
			res.send('Error inserting new turtle'); // sends an error response message, and...
			return; // returns.
		} // Otherwise...
		res.send(data); // sends the data as a response.
	});
});

// Deletes Turtles
app.post('/api/soupson', function(req, res) { // Receives the post request for this endpoint from the delete turtle button's click, and calls this function that...
	if (!req.session.user) { // checks to see if the current user isn't logged in, if not...
		res.status(403); // assigns a 403 status, 
		res.send("forbidden"); //sends a forboding response message, and...
		return; // returns.
	} // Otherwise
	console.log(req.body._id); // consoles the turtle's id...
	db.collection('turtles').findOneAndDelete({ // finds the turtle associate with that button within the turtles collection, and deletes:
		_id: ObjectID(req.body._id) // this turtle based on its id...
	}, function(err, result) { // and calls this function that...
		if (err) { // checks to see if there's an error, if so...
			console.log(err); // consoles the error,
			res.send("Error making turtle soup"); // sends an error response message.
		} // Otherwise...
		console.log('result? ', result); // consoles the result, and...
		res.send(result); // sends the result as a response.
	});
});

// Incriments A Turtle's Pizzas
app.post('/api/updatepizza', function(req, res) { // Receives the post request for this endpoint from the pizza counter button's click, and calls this function that...
	db.collection('turtles').update({_id: ObjectID(req.body._id)}, {$inc: {pizza: 1}}, function(err, result) { // updates the associated turtle (within the turtles collection)'s pizza count by one, and calls this function that...
		if (err) { // checks to see if there's an error, if so...
			console.log(err); // consoles the error,
		} // Otherwise...
		console.log('result? ', result); // consoles the result, and...
		res.send(result); // sends the result as a response.
	});
});

// User Login
app.post('/api/login', function(req, res) { // Receives the post request for this endpoint from the login button's click, and calls this function that...
	db.collection('users').findOne({ // checks to see if a user exists within the users collection with:
		username: req.body.username, // the provided username and...
		password: req.body.password // the provided password,
	}, function(err, data) { // and calls this function that...
		// It's not an error to not find a user, we just get null data
		if (data === null) { // checks to see if the data is equal to null, if so...
			res.send("error"); // sends an error response messages, and...
			return; // returns.
		} // Otherwise..., associate this cookie (session) with this user (object)
		req.session.user = { // associates this cookie/session with:
			_id : data._id, // this id and...
			username: data.username // this username.
		};
		res.send("success"); // Then sends a success response message.
	});
});

// New User Registeration
app.post('/api/register', function(req, res) { // Receives the post request for this endpoint from the register button's click, and calls this function that...
	db.collection('users').insertOne({ // checks to see if a user exists within the users collection with:
		username: req.body.username, // the provided username and...
		password: req.body.password // the provided password,
	}, function(err, data) { // and calls this function that...
		if (err) { // checks to see if there's an error, if so...
			console.log(err); // consoles the error,
			res.status(500); // assigns a 500 status,
			res.send('Error inserting new user'); // sends an error response messages, and...
			return; // returns.
		} //Otherwise...
		// We could also log the user in here, or we can make them submit a login post also (the latter is what we are doing now)
		res.send(data); // sends the data as a response.
	});
});

// Serves files out of the static public folder (e.g. index.html)
app.use(express.static('public'));

// 404 boilerplate
app.use(function(req, res, next) {
	res.status(404);
	res.send("File Not Found! Turtles are Sad 🐢");
});

// 500 boilerplate
app.use(function(err, req, res, next) {
	console.log(err);
	res.status(500);
	res.send("Internal Server Error! Turtles are Angry 🐢");
	res.send(err);
});

function startListening() { // Creates a function to start the server's listening (but only after we've connected to the db).
	app.listen(8080, function() { // Sets the server host to 8080 and calls back this function that...
		console.log("🐢 http://localhost:8080"); // consoles the url.
	}); // Ends the call back function.
} // Ends the listening function.


