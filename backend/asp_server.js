
/**
 * Backend Node.js Server for the ASP online UI
 */

/*
 * Imports
 */
var exec = require('child_process').exec;
var express = require("express");

/*
 * Start of program
 */

// create the server using express.js
console.log("starting server...");
var server = express.createServer();
// will parse requests into JSON
server.use(express.bodyParser());

// serve the webpage folder as normal
server.use(express.static('../webpage'));

// handle posts of ASP programs to the server
server.post('/solver', function(req, res){
	
	// the request contains the program sent from the UI
	console.log("req: " + req.body.program);
	var program = req.body.program;

	var clingo = exec("echo " + program + " | clingo -n 0", {timeout:10000}, function(error, stdout, stderr){
		
		// return the output of clingo to the webpage
		res.send(stdout);
		console.log(stdout);
		
		if (error !== null){
			// there was an error
			console.log("errcode: " + error);
			console.log(stderr);
		}
		
	});


  
});




// Start the server
server.listen(8045);