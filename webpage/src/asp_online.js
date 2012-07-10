
/**********************************************************************/

/**
 * Global variables
 */
var solverURL = "http://localhost:8045/solver";
var DEFAULT_PROGRAM = "a :- not b. b :- not a.";
	
	
/**
 * ASP Logic Program model.
 */
var logicProgramModel = Backbone.Model.extend({
	
	/* Internal properties */
	// { program : "", parsedSyntax : "", syntaxExceptions : "", results : ""}
	
	/* Returns the logic program as a string */
	getLogicProgram : function(){ 
		return this.get("program");
	},
	
	/* Set the logic program from a string */
	setLogicProgram : function(p){
		this.set({program : p});
		this.parseProgram();
	},
	
	/* Use the PEG.js parser to validate the program */
	parseProgram : function(){
		this.set({syntaxExceptions : "Looking good..."});
		var p = this.getLogicProgram();
		try{
			this.set({parsedSyntax : asp_parser.parse(p)});
		}catch(e){
			this.set({syntaxExceptions : "[" + e.line + "," + e.column + "]:" + e.message});
		}
	}
	
});

/**
 * ASP Logic Program text area view.
 */
var inputView = Backbone.View.extend({
	
	/* Re-render the syntax as the user types it in. */
	render: function(){
		
		return this;
	},

	/* List of event handlers for the input text area */
	events: {
		"keyup" : "updateProgram"	
	},

	/* Update the logic program in the model with the views text */
	updateProgram : function(){
		this.model.setLogicProgram(this.$el.val());
		this.render();		
	}
	
});	

/**
 * ASP Logic Program console view.
 */
var consoleView = Backbone.View.extend({
	
	/* Render the console windows output buffer */
	render: function(){
		this.$el.html(this.model.get("output"));
		return this;
	},
	
	/* Write text to the console windows buffer */
	write: function(o){
		this.model.set({output : o});
		this.render();
	}
	
});

/**
 * Solver control planel view
 */
var controlPanelView = Backbone.View.extend({
	
	/* List of event handlers for the control panel */
	events: {
		"click #solve" : "executeSolver",
		"click #clear" : "clearData"
	},
	
	executeSolver: function(){	
		// send the program to the solver backend
		$.ajax({
			model : this.model,
			type : 'post',
			url : solverURL,
			data : { program : this.model.getLogicProgram() },
			dataType : 'json',
			success : function(data, textStatus, jqXHR) {
				this.model.set({results : data.result});
			},
			error : function(jqXHR, textStatus, errorThrown) {
				this.model.set({results : textStatus});
			}
		});
		
	},
	
	clearData : function(){
		// clear data from the model (inputs, outputs)
		this.model.clear();
		this.model.set({ program : DEFAULT_PROGRAM });
	}

});

/**********************************************************************/

/**
 * Page Initialisation
 */
	
var logicProgram;
var input;
var console;
var controlPanel;

$(document).ready(function(event) {
	
	/*
	 * Prepare UI and JQuery Event handlers
	 */
	
	$("#solve").button({ icons: {primary:'ui-icon-play'} });	
	$("#clear").button({ icons: {primary:'ui-icon-trash'} });
	
	/*
	 * Setup Backbone elements
	 */

	// create an instance of the logic program model 
	logicProgram = new logicProgramModel({ program : "", parsedSyntax : "", syntaxExceptions : "", results : ""});
	
	// create the input view from the HTML text area and use the logic program as its backing
	input = new inputView({	el : $("#asp_input"), model: logicProgram });
	
	// if the model changes (externally perhaps) then always perform the below
	input.model.on("change", function(){
		//input.updateProgram();
	});
	
	// create the console view from the HTML text area and use the logic program as its backing
	console = new consoleView({	el : $("#output"),	model: logicProgram	});
	
	// designate the console views model events
	console.model.on("change:syntaxExceptions", function(){
		console.write(console.model.get("syntaxExceptions"));
	});
	console.model.on("change:results", function(){
		console.write(console.model.get("results"));
	});
	
	// create the control panel view from the HTML div and use the logic program as its backing
	controlPanel = new controlPanelView({ el: $("#control_panel"), model: logicProgram});
	
});
 

/**********************************************************************/


