$.Model.extend('Closer.Models.User',
/* @Static */
{
	errorHandler: "error",
	basePath: '/rest/users/me',

	findStats: function( params, success, error ){
		if ( Closer.Controllers.Application.settings.liveData ) {
			$.ajax({
				url: Closer.Controllers.Application.settings.dataUrl + this.basePath + "/stats",
				type: 'get',
				dataType: 'json',
				success: this.callback(['wrapUser',success]),
				error: this.callback([this.errorHandler, error])
			});
		} else {
			
		}
	},

	findMe: function( params, success, error ){
		if ( Closer.Controllers.Application.settings.liveData ) {
			$.ajax({
				url: Closer.Controllers.Application.settings.dataUrl + this.basePath,
				type: 'get',
				dataType: 'json',
				success: this.callback(['wrapUser',success]),
				error: this.callback([this.errorHandler, error])
			});
		} else {
			
		}
	},

	error: function(xhr, status, error) {
		OpenAjax.hub.publish('error.display', { error: error });
		OpenAjax.hub.publish("loading.destroy");
		Closer.Controllers.Application.processing = false;	
	},

	wrapUser: function( stats ) {
		var returnArray = new Array();
		returnArray.push(new Closer.Models.User(stats));
		return [returnArray];
	}


},
/* @Prototype */
{
	init: function() {
		
	},

	

});

