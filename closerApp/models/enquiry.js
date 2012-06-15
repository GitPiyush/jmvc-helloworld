$.Model.extend('Closer.Models.Enquiry',
/* @Static */
{
	errorHandler  : "error",
	basePath      : '/rest/enquiries/',
	attributesPath: '/attributes/',
	userPath      : '/rest/users/me/enquiries',
	userQueuedPath: '/rest/users/me/queues/',
	queuedPath    : '/rest/queues/',
	emailPath     : '/rest/enquiries/',

	findAll: function( params, success, error ) {
		if ( Closer.Controllers.Application.settings.liveData ) {
			$.ajax({
				url     : Closer.Controllers.Application.settings.dataUrl + this.basePath,
				type    : 'get',
				dataType: 'json',
				success : this.callback(['wrapMany',success]),
				error   : this.callback([this.errorHandler, error])
			});
		} else {
			
		}
	},

	findUser: function( params, success, error ){
		if ( Closer.Controllers.Application.settings.liveData ) {
			
			var queryString='';
			params['pageNum'] = params['pageNum'] || 1;

			// Handle filters
			if( params.filterText !== undefined &&  params.filteredFields !== undefined ){

				queryString = "?";
				if( $.type(params.filteredFields) === "array" ){
					$.each(params.filteredFields, function(k,field){
						queryString += 'filteredField=';
						queryString += field + '&';
						
					});

				}
				else{
					queryString += 'filteredField=';
					queryString += params.filteredFields + '&';
				}

				queryString += 'filterText=';
				queryString += params.filterText;



			}

			var data = { pageNumber: params['pageNum'] };
			$.ajax({
				url     : Closer.Controllers.Application.settings.dataUrl + this.userPath + queryString,
				type    : 'get',
				dataType: 'json',
				data    : data,
				success : this.callback(['seperateItems',success]),
				error   : this.callback([this.errorHandler, error])
			});
		} else { 
			$.ajax({
				url     : Closer.Controllers.Application.settings.dataUrl + this.userPath + queryString,
				type    : 'get',
				dataType: 'json',
				data    : data,
				success : this.callback(['seperateItems',success]),
				error   : this.callback([this.errorHandler, error]),
				fixture : "//closerApp/fixtures/enquiries" 
			});
		}
	},

	findQueued: function( params, success, error ){
		if ( Closer.Controllers.Application.settings.liveData ) {
			
			params['pageNum'] = params['pageNum'] || 1;

			var data = { pageNumber: params['pageNum'] };
			$.ajax({
				url     : Closer.Controllers.Application.settings.dataUrl + this.queuedPath + params['queue'] + "/enquiries",
				type    : 'get',
				dataType: 'json',
				data    : data,
				success : this.callback(['seperateManageItems',success]),
				error   : this.callback([this.errorHandler, error])
			});
		} else { 
			
			$.ajax({
				url     : Closer.Controllers.Application.settings.dataUrl + this.queuedPath + params['queue'] + "/enquiries",
				type    : 'get',
				dataType: 'json',
				data    : data,
				success : this.callback(['seperateItems',success]),
				error   : this.callback([this.errorHandler, error]),
				fixture : "//closerApp/fixtures/enquiries"
			});
		}
	},

	findOne: function( params, success, error ){

		if ( Closer.Controllers.Application.settings.liveData ) {

			$.ajax({
				url     : Closer.Controllers.Application.settings.dataUrl + this.basePath + params['id'],
				type    : 'get',
				dataType: 'json',
				success : this.callback(['wrapShittyData',success]),
				error   : this.callback([this.errorHandler, error])
			});
		} else {  }
	},

	findSearch: function( params, success, error ){

		if ( Closer.Controllers.Application.settings.liveData ) {

			$.ajax({
				url     : Closer.Controllers.Application.settings.dataUrl + this.basePath,
				type    : 'get',
				dataType: 'json',
				data    : params.searchTerms,
				success : this.callback(['wrapMany',success]),
				error   : this.callback([this.errorHandler, error])
			});
		} else {  }
	},

	setAttributes: function( id, params, success, error ) {

		if ( Closer.Controllers.Application.settings.liveData ) {
			$.ajax({
				url     : Closer.Controllers.Application.settings.dataUrl + this.basePath + id + this.attributesPath,
				type    : 'post',
				dataType: 'json',
				data    : JSON.stringify(params),
				success : success,
				error   : this.callback([this.errorHandler, error])
			});
		} else {
			
		}
	},

	terminateEnquiry: function( params, success, error ) {
			
		if ( Closer.Controllers.Application.settings.liveData ) {

			$.ajax({
				url     : Closer.Controllers.Application.settings.dataUrl + this.queuedPath + params['queue'] + "/enquiries" + "/" + params['enquiry'],
				type    : 'delete',
				dataType: 'json',
				success : success,
				error   : this.callback([this.errorHandler, error])
			});
		} else { 
			this.callback([success]);
		}
	},

	pullEnquiries: function( params, success, error ){

		if ( Closer.Controllers.Application.settings.liveData ) {
			$.ajax({
				url     : Closer.Controllers.Application.settings.dataUrl + this.userQueuedPath + params['queueId'] + "/enquiries",
				type    : 'get',
				dataType: 'json',
				success : this.callback(['wrapShittyData',success]),
				error   : this.callback([this.errorHandler])
			});
		} else { 
		
		}
	},

	update: function(id, attrs, success, error) {

		var queueMove = attrs.queue.moved || false;
		delete attrs.queue.moved;

 		// UPDATE THE ENQUIRY
		if ( !queueMove ) {

			if ( Closer.Controllers.Application.settings.liveData ) {
				$.ajax({
					url     : Closer.Controllers.Application.settings.dataUrl + this.basePath + id,
					type    : 'POST',
					dataType: 'json',
					data    : JSON.stringify(attrs),
					success : this.callback(['updatedSuccess',success]),
					error   : this.callback(error)
				});
			} else { return true; }


		// UPDATE ENQUIRY PATH
		} else {
			
			if ( Closer.Controllers.Application.settings.liveData ) {
				$.ajax({
					url     : Closer.Controllers.Application.settings.dataUrl + this.queuedPath + id + "/enquiries" + "/" + attrs.gimpEmailId ,
					type    : 'POST',
					dataType: 'json',
					data    : JSON.stringify(attrs),
					success : this.callback(['updatedSuccess',success]),
					error   : this.callback(error)
				});
			} else { return true; }
		}
	},

	/**
	 * Sets priority on allocated enquirires
	 * @param {int} id      enquiry id
	 * @param {object} attrs   parameters object
	 * @param {object} success callback function
	 * @param {onject} error   callback function
	 */
	setPriority: function(id, attrs, success, error) {

		if ( Closer.Controllers.Application.settings.liveData ) {
			$.ajax({
				url     : Closer.Controllers.Application.settings.dataUrl + this.basePath + id,
				type    : 'POST',
				dataType: 'json',
				data    : JSON.stringify(attrs),
				success : this.callback(['updatedSuccess',success]),
				error   : error
			});
		} else { return true; }
	},

	setUnallocatedPriority: function(params, success, error) {
		if ( Closer.Controllers.Application.settings.liveData ) {

			var service = Closer.Controllers.Application.settings.dataUrl + this.queuedPath + params.queue.id + '/enquiries/' + params.gimpEmailId;
			
			$.ajax({
				url     : service,
				type    : 'POST',
				dataType: 'json',
				data    : JSON.stringify(params),
				success : this.callback(['updatedSuccess',success]),
				error   : error

			});
		}
	},

	updatedSuccess: function() {
		OpenAjax.hub.publish('enquiry.updated'); 
		Closer.Controllers.Application.processing = false;
	},

	seperateItems: function(enquiries) {
		var enquiriesOnly  = new Array();

		$.each(enquiries.data, function(key, value) {
			enquiriesOnly.push(new Closer.Models.Enquiry(value));
			if ( value.priority ) {
				enquiriesOnly[key].priority = value.priority;
			}
		});

		delete enquiries.data;

		OpenAjax.hub.publish("enquiries.pageData.loaded", { metaData: enquiries });

		return [enquiriesOnly];
	},

	seperateManageItems: function(enquiries) {
		var enquiriesOnly  = new Array();

		// console.debug(enquiries.data, "TEST this");

		$.each(enquiries.data, function(key, value) {

			value.highPriority = value.priority || 0; // this is a hack so that MVC does not stript out the priority number
			enquiriesOnly.push(new Closer.Models.Enquiry(value));
		});

		delete enquiries.data;

		OpenAjax.hub.publish("manage.pageData.loaded", { metaData: enquiries });

		return [enquiriesOnly];
	},

	seperateItemsSearch: function(enquiries) {
		var enquiriesOnly  = new Array();

		$.each(enquiries.data, function(key, value) {
			enquiriesOnly.push(new Closer.Models.Enquiry(value));
		});

		delete enquiries.data;

		OpenAjax.hub.publish("search.pageData.loaded", { metaData: enquiries });

		return [enquiriesOnly];
	},

	wrapShittyData: function( enquiry ) {
		var enquiryArray  = new Array(new Closer.Models.Enquiry(enquiry));

		return enquiryArray;
	},

	getNext: function( params, success, error ){
		if ( Closer.Controllers.Application.settings.liveData ) {
			$.ajax({
				url     : Closer.Controllers.Application.settings.dataUrl + this.userPath,
				type    : 'get',
				dataType: 'json',
				success : this.callback(['wrapMany',success]),
				error   : this.callback([this.errorHandler, error])
			});
		} else {
			$.ajax({
				url     : '/enquiries',
				type    : 'get',
				dataType: 'json',
				data    : params,
				success : this.callback(['wrapMany',success]),
				error   : this.callback([this.errorHandler, error]),
				fixture : "//closerApp/fixtures/enquiries.json.get" //calculates the fixture path from the url and type.
			});
		}
	},

	sendEmail: function( params, email, success, error ) {

		// console.log(JSON.stringify(email), "stringified email");
		if ( Closer.Controllers.Application.settings.liveData ) {
			$.ajax({
				url     : Closer.Controllers.Application.settings.dataUrl + this.emailPath + params.id  + "/emails",
				type    : 'post',
				dataType: 'json',
				data    : JSON.stringify(email),
				success : this.callback([success]),
				error   : this.callback([error])
			});
		}
	},

	sortItems: function( queues ) {
		return queues;		
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

	getCustomer: function() { return this.customer; },
	getCustomerName: function() { return this.customer.fullName; },
	getCustomerEmail: function() { return this.customer.email; },
	getProgress: function() { return this.state.name; },
	getProgressIconClass:function(){ return this.state.name.replace(/\s/g, '') + 'Icon' },
	getAge: function() { return this.age; },
	getQueueName: function() { return this.queue.name; },
	getQueueId: function() { return this.queue.id; },
	getDate: function() { return this.receivedDate || "NA"; },
	getState: function() { return this.state; },
	// getStateWrapped: function() { return new Closer.Models.State(this.state); },
	getResolution:function(){
		// Returns the resolution type or false
		return ( this.resolution ) ? this.resolution.resolutionType : false;
	},
	getUser: function(){ return this.user },

	/* Enquiry Detail Getters */
	getEnqText: function() { return this.enquiryText; },

	getNote: function(){
		return ($.type(this.note)==='object' && this.note.note !== undefined) ? this.note.note : '';
	},

	getPriority: function(){
		return this.highPriority;
	},

	/* Enquiry State Change Functions */
	finish: function( resolutionID, upsell, user, bookingTTY, attributes, success, fail ) { 
		this.state.id = "12";

		// Set resolution properties
		this.resolution                = {};
		this.resolution.resolutionType = { id: resolutionID };
		this.resolution.upsell         = upsell;
		this.resolution.saleAmount     = bookingTTY;
		this.user                      = {}
		this.user.id                   = user.getID();

		// console.log(this, "ENQUIRY TO END");
		var attributes = attributes || {};
		if( !$.isEmptyObject(attributes) && $.type(attributes) === "object" ){
			this.Class.setAttributes( this.id, attributes );
		}

		this.Class.update( this.id, this, success, fail );
	},

	/**
	 * Removes and terminates enquiry without 
	 * @param  {object} success callback
	 * @param  {object} error callback
	 * @return {null}
	 */
	terminateEarly: function( success, error ) {

		// If passing in a success callback must invoke published event below
		var success = success || function(){ OpenAjax.hub.publish("enquiry.terminated"); };

		this.Class.terminateEnquiry({ queue: this.getQueueId(), enquiry: this.gimpEmailId  }, success, error);
	},

	setPriority: function( priority ) {
		//this.Class.setPriority( this.gimpEmailId, priority );
		this.priority = priority;
	},

	/**
	 * Shortcut method to set priority on unallocated enquiries
	 * @param {int} priority 1|0 to set priority enquiry
	 * @param {object} success  success callback
	 * @param {object} error    error callback
	 */
	setUnallocatedPriority: function( priority, success, error ) {
		this.setPriority( priority );
		this.Class.setUnallocatedPriority( this, success, error );
	},

	setNewQueue: function( queueId, success ) {
		var oldId = this.queue.id,
		success = success || function(){};
		this.queue.id = queueId;

		this.queue.moved = true;
		this.Class.update(oldId, this, success);
	},

	setNotes:function( note, success, fail ){
		this.note = { note:note };
		this.Class.update( this.id, this, success, fail );
	},
	
	setEnquiryState:function(id){
		this.state = {};
		this.state.id = id;
	},

	update:function( success, fail ){

		if( $.type(this.note) === "string" ) {
			var note = this.note;
			this.note = { note:note };
		}

		this.Class.update( this.id, this, success, fail );
	}
});

