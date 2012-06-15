$.Model.extend('Closer.Models.State',
/* @Static */
{
	errorHandler: "error",
	basePath: '/rest/states/',

	findAll: function( params, success, error ){
		this.callback(['wrapMany',success])

		if ( Closer.Controllers.Application.settings.liveData ) {
			$.ajax({
				url: Closer.Controllers.Application.settings.dataUrl + this.basePath,
				type: 'get',
				dataType: 'json',
				success: this.callback(['wrapMany',success]),
				error: this.callback([this.errorHandler, error])
			});
		} else {  }
	},

	findPermitted: function( params, success, error ){
		var async = ( params['async'] == undefined ) ? true : false,
			permitted = null,
			self = this,

			returnResults = function(data){
				permitted = new Closer.Models.State(data);
			};

		if ( Closer.Controllers.Application.settings.liveData ) {
			$.ajax({
				url: Closer.Controllers.Application.settings.dataUrl + this.basePath + params.id + '/transitions',
				type: 'get',
				async: false,
				dataType: 'json',
				success: this.callback(['wrapMany',success]),
				error: this.callback([this.errorHandler, error])
			});


		} else {  }

		if( permitted ){
			return permitted;
		}
	},

	// findPermittedFiltered: function(params, success, error){
	// 	id=9;
	// 	var filtered=[];

	// 	$.each(this.findPermitted({id:id, async:false}), function(k,v){

	// 		if( v.name != "Reassigned" ){
	// 			filtered.push(v);	
	// 		}
	// 	});


	// 	this.callback(success);

	// 	// console.log( filtered );
		
	// },

	error: function(xhr, status, error) {
		OpenAjax.hub.publish('error.display', { error: error });
		OpenAjax.hub.publish("loading.destroy");
		Closer.Controllers.Application.processing = false;	
	}


},
/* @Prototype */
{
	init: function() {
		
	},

	getTransitionName: function() { return this.name; }

});

