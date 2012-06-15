$.Model.extend('Closer.Models.Queue',
/* @Static */
{
	errorHandler: "error",
	basePath: '/rest/queues/',
	reportPath: '/rest/queuereport',
	userPath: '/rest/users/me/queues',
	refreshPath:'/rest/queues/refresh',

	findAll: function( params, success, error ){
		if ( Closer.Controllers.Application.settings.liveData ) {
			$.ajax({
				url: Closer.Controllers.Application.settings.dataUrl + this.basePath,
				type: 'get',
				dataType: 'json',
				success: this.callback(['wrapMany',success]),
				error: this.callback([this.errorHandler, error])
			});
		} else {
			$.ajax({
				url: Closer.Controllers.Application.settings.dataUrl + this.basePath,
				type: 'get',
				dataType: 'json',
				success: this.callback(['wrapMany',success]),
				error: this.callback([this.errorHandler, error]),
				fixture: "//closerApp/fixtures/queues"
			});
		}
	},

	findAuthed: function( params, success, error ){
		if ( Closer.Controllers.Application.settings.liveData ) {
		
			$.ajax({
				url: Closer.Controllers.Application.settings.dataUrl + this.userPath,
				type: 'get',
				dataType: 'json',
				statusCode: {
					200: this.callback(['wrapMany',success])
				},
				error: this.callback([this.errorHandler, error])
			});
		} else {
			$.ajax({
				url: Closer.Controllers.Application.settings.dataUrl + this.userPath,
				type: 'get',
				dataType: 'json',
				statusCode: {
					200: this.callback(['wrapMany',success])
				},
				error: this.callback([this.errorHandler, error]),
				fixture: "//closerApp/fixtures/queues"
			});
		}
	},

	refreshAD: function(params, success, error){
		var ajaxSetup = {
			url: Closer.Controllers.Application.settings.dataUrl + this.refreshPath,
			type: 'get',
			dataType: 'json ',
			statusCode: {
				200: this.callback(['wrap',success])
			},
			error: this.callback([this.errorHandler, error])
		};

		if ( !Closer.Controllers.Application.settings.liveData ) {
			ajaxSetup.fixture = "//closerApp/fixtures/queues"
		}

		$.ajax( ajaxSetup );
	},

	findAllReport: function( params, success, error ){
		if ( Closer.Controllers.Application.settings.liveData ) {
			$.ajax({
				url: Closer.Controllers.Application.settings.dataUrl + this.reportPath,
				type: 'get',
				dataType: 'json',
				statusCode: {
					200: this.callback(['wrapMany',success])
				},
				error: this.callback([this.errorHandler, error])
			});
		} else {
			$.ajax({
				url: '/endpoint',
				type: 'get',
				dataType: 'json',
				success: this.callback(['wrapMany',success]),
				error: this.callback([this.errorHandler, error]),
				fixture: "//closerApp/fixtures/queues"
			});
		}
	},

	findOne:function( params, success, error ){

		var ajaxSetup = {
			url: Closer.Controllers.Application.settings.dataUrl + this.basePath + params.id,
			type: 'get',
			dataType: 'json',
			success: this.callback(['wrap',success]),
			error: this.callback([this.errorHandler, error])

		}

		if ( Closer.Controllers.Application.settings.liveData ) {
			$.extend(ajaxSetup, {fixture: "//closerApp/fixtures/queues"});
		}
			
		$.ajax( ajaxSetup );
	},

	update: function( id, attrs, success, error ){

		if ( Closer.Controllers.Application.settings.liveData ) {

			$.ajax({
				url: Closer.Controllers.Application.settings.dataUrl + this.basePath + attrs.id,
				type: 'post',
				dataType: 'json',
				data: JSON.stringify(attrs),
				success: this.callback(success),
				error: this.callback([this.errorHandler, error])
			});
		} else {
			this.callback(success);
		}
	},

	create: function( attrs, success, error ){
		if ( Closer.Controllers.Application.settings.liveData ) {
		
			$.ajax({
				url: Closer.Controllers.Application.settings.dataUrl + this.basePath + 'types/' +  attrs.type + '/',
				type: 'post',
				dataType: 'json',
				data: JSON.stringify(attrs),
				success: this.callback(success),
				error: this.callback([this.errorHandler, error])
			});
		} else {
			this.callback(success);
		}
	},

	destroy: function( attrs, success, error ){
		if ( Closer.Controllers.Application.settings.liveData ) {
		
			$.ajax({
				url: Closer.Controllers.Application.settings.dataUrl + this.basePath + 'types/' +  attrs.type + '/' + attrs.id,
				type: 'delete',
				success: this.callback(success),
				error: this.callback([this.errorHandler, error])
			});
		} else {
			this.callback(success);
		}
	},

	moveBulkEnquiries:function( params, success, error ) {

		var ajaxSetup = {
			url: Closer.Controllers.Application.settings.dataUrl + this.basePath + 'move',
			type: 'post',
			dataType: 'json',
			data: JSON.stringify(params),
			success: this.callback(success),
			error: this.callback([this.errorHandler, error])
		}

		// if ( Closer.Controllers.Application.settings.liveData ) {
		// 	$.extend(ajaxSetup, {fixture: "//closerApp/fixtures/queues"});
		// }
			
		$.ajax( ajaxSetup );
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
	getID:function(){ return this.id; },
	getName: function() { return this.name.replace(/^CLR_/, ''); },
	getDescription: function() { return this.description; },
	getIsActive: function() { return this.active; },
	getNumEnquiries: function() { return this.enquiryCount; },
	getNumAllocated: function() { return this.enquiryCountAlloc; },
	getNumUnallocated: function() { return this.enquiryCountUnAlloc; },
	getAvgAgeAllocated: function() { return this.averageAgeOfAllocatedFormatted; },
	getAvgAgeUnallocated: function() { return this.averageAgeOfUnallocatedFormatted; },
	getAvgAgeAllocatedRaw: function() { return this.averageAgeOfAllocatedInMillis; },
	getAvgAgeUnallocatedRaw: function() { return this.averageAgeOfUnallocatedInMillis; },
	getEnquiryCountNonReserved: function() { return this.enquiryCountNonReserved; },
	getCounts: function() { return this.enquiryCountNonReserved; },
	getStatus: function() { return this.status; },

	getAddedCount: function(){ return this.addedCount; },
	getDisabledCount: function(){ return this.disabledCount; },

	setQueueName: function(name) { this.name = name; },
	setDesc: function(description) { this.description = description; },
	setIsActive: function(active) { this.active = active; },

	moveBulkEnquiries: function( params, success, error ) {
		params.sourceQueueId = this.getID();
		this.Class.moveBulkEnquiries( params, success, error );
	}

});

