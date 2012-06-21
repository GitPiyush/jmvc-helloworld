steal.plugins(	
	'jquery/controller',			// a widget factory
	'jquery/controller/subscribe',	// subscribe to OpenAjax.hub
	'jquery/view/ejs',				// client side templates
	'jquery/controller/view',		// lookup views with the controller's name
	'jquery/model',					// Ajax wrappers
	'jquery/dom/fixture',			// simulated Ajax requests
	'jquery/dom/form_params')		// form data helper
	
	.css('helloworld')	// loads styles

	.resources()					// 3rd party script's (like jQueryUI), in resources folder

	.models('user')						// loads files in models folder 

	.controllers(
		'application',
		'page/homepage')					// loads files in controllers folder

	.views()						// adds views to be added to build

	// Everything  is loaded
	.then(function(){

		// setup some fixtures
		// 
		// $.fixture.findHYG = function(){ console.log('ramalamadingdong'); };
		

		$.ajax({
		  url: 'json/5',
		  type: 'get',
		  dataType: 'json',
		  fixture: "-findHYG",

		 //  function( orig, settings, headers ) {

			// console.log(orig, "INVOKING FIXTURE");

			// $.ajax({
			// 	url: '/helloworld/fixtures/users.json.get',
			// 	type: 'GET',
			// 	dataType: 'json',
			// 	success: function(data, textStatus, xhr) {
			// 	//called when successful
			// 		var result = false;
			// 		$.each(data, function(k, v){
			// 			if( v.id == orig.data.id ) {
			// 				console.log(data, 'full data');
			// 				result=v;
			// 			}
			// 		});
				
			// 		return [ 200, "success", { json: result }, {} ];
			// 	},
			// 	error: function(xhr, textStatus, errorThrown) {
			// 	//called when there is an error
			// 		return [ 404, "error", {}, {} ];
			// 	}
			// });
			

		 //  },
		  complete: function(xhr, textStatus) {
		    //called when complete
		  },
		  success: function(data, textStatus, xhr) {
		    //called when successful
		  },
		  error: function(xhr, textStatus, errorThrown) {
		    //called when there is an error
		  }
		});
		
		

		$(document).ready(function() {
			$("#myApplication").helloworld_application({ });
		});
	});