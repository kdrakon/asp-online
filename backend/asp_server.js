
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
 * Global Variables and Constants
 */	
var MAX_CLINGO_PROCESSES = 10;
var clingo_process_pool = MAX_CLINGO_PROCESSES;
var MAX_PROGRAM_LENGTH = 255;


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
	
	// if program is too large, ignore it
	if (program.length > MAX_PROGRAM_LENGTH){
		console.log("Program exceeds max length: " + MAX_PROGRAM_LENGTH);
		res.send({result :"Program exceeds max length: " + MAX_PROGRAM_LENGTH});
		return;
	}
	
	// parse the program to see if its valid
	try{
		asp_parser.parse(program);
	}catch(e){
		programValid = false;
		console.log("Program is not valid: " + e.message);
		res.send({result : "Program is not valid: " + e.message});
		return;
	}

	// if the program is valid and their exists process space, spawn an clingo process
	if (programValid && clingo_process_pool > 0){
		
		// spawn clingo with settings
		clingo_process_pool--;
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
			clingo_process_pool++;
			// send the answer back to the client
			answer = answer.replace(/\n/g, "<br>");
			res.send({result : answer});
		});			
		
		// send program through stdin pipe and then send EOF
		clingo.stdin.write(program);
		clingo.stdin.end();
		
	} else {
		
		// not enough processes allowed, so inform the client
		res.send({result :"Server busy"});
		
	}
  
});

/*
 * Start the server
 */ 
server.listen(8045);