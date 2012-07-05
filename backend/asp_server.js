
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
var server = express.createServer();
// will parse requests into JSON
server.use(express.bodyParser());

// serve the webpage folder as normal
server.use(express.static('../webpage'));

// handle posts of ASP programs to the server
server.post('/solver', function(req, res){

	var clingo = exec("clingo", {timeout: 10000}, function(error, stdout, stderr){
		
		// return the output of clingo to the webpage
		res.send(stdout);
		
		if (error !== null){
			// there was an error
			console.log("errcode: " + error);
			console.log(stderr);
		}
		
	});
	
	clingo.stdin.write("test.");
	
  
});




// Start the server
server.listen(8045);