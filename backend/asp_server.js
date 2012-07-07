
/**
 * Backend Node.js Server for the ASP online UI
 */

/*
 * Imports
 */
var exec = require('child_process').exec;
var spawn = require('child_process').spawn;
var express = require("express");
var asp_parser = require("../webpage/src/asp_parser.js").parser;

/*
 * Node.js Server Program
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
	
	var programValid = true;

	// the request contains the program sent from the UI
	console.log("req: " + req.body.program);
	var program = req.body.program;
	var answer = "";
	
	// parse the program to see if its valid
	try{
		asp_parser.parse(program);
	}catch(e){
		programValid = false;
		console.log("program is not valid: " + e.message);
	}

	// if the program is valid, spawn clingo process
	if (programValid){
		
		// spawn clingo with settings
		var clingo = spawn("clingo", ["-n", "0"]);
		
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
	}
  
});

/*
 * Start the server
 */ 
server.listen(8045);