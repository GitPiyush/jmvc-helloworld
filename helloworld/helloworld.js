steal.plugins(	
	// LOAD SOME CORE JMVC FILES
	'jquery/controller',			// a widget factory
	'jquery/controller/subscribe',	// subscribe to OpenAjax.hub
	'jquery/view/ejs',				// client side templates
	'jquery/controller/view',		// lookup views with the controller's name
	'jquery/model',					// Ajax wrappers
	'jquery/dom/fixture',			// simulated Ajax requests
	'jquery/dom/form_params')		// form data helper
	
	// LOAD CSS 
	.css(
		'helloworld',
		'css/jquery.notice',
		'css/foundation',
		'css/app'
	)	// loads styles

	.resources('jquery.notice')					// 3rd party script's (like jQueryUI), in resources folder

	.models('user')						// loads files in models folder 

	.controllers(
		'application',
		'page/homepage')					// loads files in controllers folder

	.views()						// adds views to be added to build

	// Everything  is loaded
	.then(function(){

		// Starting our application
		$(document).ready(function() {
			$("#myApplication").helloworld_application();
		});
	});