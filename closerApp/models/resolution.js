$.Model.extend('Closer.Models.Resolution',
/* @Static */
{
	errorHandler: "error",
	basePath: '/rest/resolutions/types',
	resolutionTypes:false,


	findAll: function( params, success, error ){
		if ( Closer.Controllers.Application.settings.liveData ) {
			$.ajax({
				url: Closer.Controllers.Application.settings.dataUrl + this.basePath,
				type: 'get',
				dataType: 'json',
				data:params,
				success: this.callback(['wrapMany',success]),
				error: this.callback([this.errorHandler, error])
			});
		} else {  }
	},

	findAllDirect: function( params, success, error ){
		
		var items = [];
		var _this = this;

		if ( Closer.Controllers.Application.settings.liveData ) {
			$.ajax({
				url: Closer.Controllers.Application.settings.dataUrl + this.basePath,
				type: 'get',
				async: false,
				dataType: 'json',
				data: params,
				success: function(data) {
					items = _this.wrapMany(data);
				},
				error: this.callback([this.errorHandler, error])
			});
		} else {  }

		this.resolutionTypes = items;
		return items;
	},

	/**
	 * Optimised to only request resolution types once a session
	 * @param  {[type]} group [description]
	 * @return {[type]}
	 */
	filterResolutionGroups:function( params ){
		var resolutionTypesNew = new Array()
			resolutionTypes = this.resolutionTypes ? this.resolutionTypes : this.findAllDirect();

		$.each(resolutionTypes, function(k,v){
			if( v.getGroups() === params.group ) {
				resolutionTypesNew.push(v);
			}
		});

		return resolutionTypesNew;
	},


	getResolutionByName:function(){

		// var 

		if( !this.resolutionTypes ){
			this.findAll({});
		}
	},

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

	getTransitionName: function() { return this.name; },
	getName: function(){ return this.name;	},
	getID: function(){ return this.id;	},
	getGroups: function(){ return this.groups;	},
	getCode: function(){ return this.code;	},
	getOrdinal:function(){ return this.ordinal; },
	getActive:function(){ return this.active; }

});

