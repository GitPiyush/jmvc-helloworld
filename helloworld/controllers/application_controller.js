/**
 * @class Helloworld.Controllers.Application
 */
$.Controller('Helloworld.Controllers.Application',
/* @Static */
{
	defaults : {
		applicationName:'John\'s helloworld example'
	},

	getAppDefaults:function( defaultName ){
		return this.defaults[defaultName] || "Default does not exist!";
	},

	applicationMessage:function( params ){
		alert( 'Message type: ' + params.type + 
			'\nMessage: ' + params.message );
	}
},
/* @Prototype */
{
	init : function(){
		this.element.find('.applicationName').html( this.options.applicationName );

		// Let the rest of the application we are good to go!!
		OpenAjax.hub.publish('Helloworld.Application.Ready');
	},

	"Helloworld.Message subscribe":function( called, data ) {
		if ( $.type(data.type) === "undefined" ) {
			alert( "System error!" );
			return false;
		}

		this.Class.applicationMessage( data );
	}


});