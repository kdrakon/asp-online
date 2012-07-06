
/**
 * Backend Node.js Server for the ASP online UI
 */

/*
 * Imports
 */
var exec = require('child_process').exec;
var spawn = require('child_process').spawn;
var express = require("express");

/*
 * Start of program
 */

// create the server using express.js
console.log("starting server...");
var server = express.createServer();

// parse HTTP requests into JSON
server.use(express.bodyParser());

// serve the webpage folder as normal
server.use(express.static('../webpage'));

// handle posts of ASP programs to the server
server.post('/solver', function(req, res){
	
	// the request contains the program sent from the UI
	console.log("req: " + req.body.program);
	var program = req.body.program;
	var answer = "";

	// spawn clingo with settings
	var clingo = spawn("clingo", ["-n", "0", "--sat-prepro=-1,-1,10,-1"]);
	
	// handle stdout event
	clingo.stdout.on('data', function(data){
		console.log('stdout: ' + data);
		answer = answer.concat(data);
	});
	
	// handle stderr event	
	clingo.stderr.on('data', function(data){
		console.log('stderr: ' + data);
		answer = answer.concat(data);
	});

	// handle exit event
	clingo.on('exit', function(code){
		console.log('exited: ' + code);
	});
	
	// handle close event
	clingo.on('close', function(){
		console.log('clingo terminated');
		answer = answer.replace(/\n/g, "<br>");
		res.send({result : answer});
	});	
	
	
	// send program through stdin pipe and then send EOF
	clingo.stdin.write(program);
	clingo.stdin.end();
  
});




/*
 * Start the server
 */ 
server.listen(8045);