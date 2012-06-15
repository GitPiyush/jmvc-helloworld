steal.plugins(
	'jquery/controller',			// a widget factory
	'jquery/controller/subscribe',	// subscribe to OpenAjax.hub
	'jquery/controller/history',	// The inbuilt history object for JMVC, required even if we are using YUI() history

	'jquery/view/ejs',				// client side templates
	'jquery/controller/view',		// lookup views with the controller's name
	'jquery/model',					// Ajax wrappers
	'jquery/model/associations',	// Model Associations
	// 'jquery/dom/fixture',			// simulated Ajax requests
	'jquery/dom/cookie',			// Cookie plugin
	'jquery/dom/form_params',		// form data helper
	'jquery/event',					// JSMVC Event plugin,
	'jquery/model/service',
	'jquery/model/service/json_rest')

.resources(
		   'yui-min.js'
		   )
.models(
	
)
.css(
	
	)	// loads styles
.controllers( 
	'components/history',
).then( function(){
	// $(document).ready(function() { $("#Outer").closer_application({ }); });
});