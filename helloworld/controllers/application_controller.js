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
	}
},
/* @Prototype */
{
	init : function(){
		this.element.find('.applicationName').html( this.options.applicationName );

		// Let the rest of the application we are good to go!!
		OpenAjax.hub.publish('Helloworld.Application.Ready');
	},

	// An example of using open ajax to loosely link functionality
	"Helloworld.Message subscribe":function( called, data ) {
		if ( $.type(data.type) === "undefined" ) {
			alert( "System error!" );
			return false;
		}

		$.noticeAdd({
			text: data.message,
			stay: false,
			type: data.type
		});
	}
});