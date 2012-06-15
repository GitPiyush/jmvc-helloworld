$.Model.extend('Closer.Models.User',
/* @Static */
{
	errorHandler: "error",
	basePath: '/rest/users',
	attributePath: '/rest/users/me/attributes',

	findAll: function( params, success, error ){
		if ( Closer.Controllers.Application.settings.liveData ) {
			$.ajax({
				url: Closer.Controllers.Application.settings.dataUrl + this.basePath,
				type: 'get',
				dataType: 'json',
				data: { country: params.country },
				success: this.callback(['wrapMany',success]),
				error: this.callback([this.errorHandler, error])
			});
		} else {
			
		}
	},

	findStats: function( params, success, error ){

		if ( params['async'] == undefined ) { params['async'] = true; }

		if ( Closer.Controllers.Application.settings.liveData ) {
			if ( !params['async'] ) {

				var stats;
				var self = this;

				$.ajax({
					url: Closer.Controllers.Application.settings.dataUrl + this.basePath + "/me/stats",
					type: 'get',
					dataType: 'json',
					async: false,
					success: function(data) {
						var userStats = self.wrapUser(data);
						stats = userStats;
					},
					error: this.callback([this.errorHandler, error])
				});

				return stats;
			} else {
				$.ajax({
					url: Closer.Controllers.Application.settings.dataUrl + this.basePath + "/me/stats",
					type: 'get',
					dataType: 'json',
					success: this.callback(['wrapUser',success]),
					error: this.callback([this.errorHandler, error])
				});
			}
		} else { 
			if ( !params['async'] ) {

				var stats;
				var self = this;

				$.ajax({
					url: Closer.Controllers.Application.settings.dataUrl + this.basePath + "/me/stats",
					type: 'get',
					dataType: 'json',
					async: false,
					success: function(data) {
						var userStats = self.wrapUser(data);
						stats = userStats;
					},
					error: this.callback([this.errorHandler, error]),
					fixture: "//closerApp/fixtures/user_stats"
				});

				return stats;
			} else {
				$.ajax({
					url: Closer.Controllers.Application.settings.dataUrl + this.basePath + "/me/stats",
					type: 'get',
					dataType: 'json',
					success: this.callback(['wrapUser',success]),
					error: this.callback([this.errorHandler, error]),
					fixture: "//closerApp/fixtures/user_stats"
				});
			}
		}
	},

	findMe: function( params, success, error ){

		if ( params['async'] == undefined ) { params['async'] = true; }

		if ( Closer.Controllers.Application.settings.liveData ) {
			if ( !params['async'] ) {

				var me, getMeObj, getMeAttrObj,
				self = this;

				getMeObj = $.ajax({
					url: Closer.Controllers.Application.settings.dataUrl + this.basePath + "/me",
					type: 'get',
					dataType: 'json',
					async: false,
					// success: function(data) {


					// 	console.debug(data, "ramifications");

					// 	var user = self.wrapSingleUser(data);
					// 	me = user;
					// },
					error: this.callback([this.errorHandler, error])
				});
				
				// Add the user to the me Obj
				getMeObj.success(function( data ){
					me = data;
				});
				
				// On success of getMe, retrieve user attributes
				getMeObj.success(function( data ){
					getMeAttrObj = $.ajax({
						url: Closer.Controllers.Application.settings.dataUrl + self.basePath + "/me/attributes",
						type: 'get',
						dataType: 'json',
						async: false,
						error: function(){ alert('Error getting user.'); }
					});
				});

				// Merge the user attributes onto the me Obj
				getMeAttrObj.success(function(data){
					$.extend(me, data);

					me = self.wrapSingleUser(me);

				});


				return me;

			} else {
				$.ajax({
					url: Closer.Controllers.Application.settings.dataUrl + this.basePath + "/me",
					type: 'get',
					dataType: 'json',
					async: false,
					success: this.callback(['wrapUser',success]),
					error: this.callback([this.errorHandler, error])
				});
			}
		} else {
			if ( !params['async'] ) {

				var me;
				var self = this;

				$.ajax({
					url: Closer.Controllers.Application.settings.dataUrl + this.basePath + "/me",
					type: 'get',
					dataType: 'json',
					async: false,
					success: function(data) {
						var user = self.wrapSingleUser(data);
						me = user;
					},
					error: this.callback([this.errorHandler, error]),
					fixture: "//closerApp/fixtures/users_me"
				});

				return me;

			} else {
				$.ajax({
					url: Closer.Controllers.Application.settings.dataUrl + this.basePath + "/me",
					type: 'get',
					dataType: 'json',
					async: false,
					success: this.callback(['wrapUser',success]),
					error: this.callback([this.errorHandler, error]),
					fixture: "//closerApp/fixtures/users_me"
				});
			}
		}
	},

	findAttribute: function( params, success, error ) {

		var attr;

		if ( Closer.Controllers.Application.settings.liveData ) {
			$.ajax({
				url: Closer.Controllers.Application.settings.dataUrl + this.attributePath + "/" + params['attribute'],
				type: 'get',
				dataType: 'json',
				async: false,
				success: function(data) {
					attr = data;
				},
				error: this.callback([this.errorHandler, error])
			});
		} else {
			attr = "Test";
		}

		return attr;
	},

	setAttribute: function( params, success, error ) {

		if ( Closer.Controllers.Application.settings.liveData ) {
			$.ajax({
				url: Closer.Controllers.Application.settings.dataUrl + this.attributePath,
				type: 'post',
				dataType: 'json',
				data: JSON.stringify(params),
				success: success,
				error: this.callback([this.errorHandler, error])
			});
		} else {
			
		}
	},

	setAttributes: function( params, success, error ) {

		if ( Closer.Controllers.Application.settings.liveData ) {
			$.ajax({
				url: Closer.Controllers.Application.settings.dataUrl + this.attributePath,
				type: 'post',
				dataType: 'json',
				data: JSON.stringify(params),
				success: success,
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
	},

	wrapSingleUser: function( stats ) {
		return new Closer.Models.User(stats);
	},

	/**
	 * DEPRECATED IN FAVOUR OF PROTOTYPE
	 * @return {[type]} [description]
	 */
	checkReachedLimit: function() { 
		var remainingQuota = 0;

		var stats = this.findStats({ async: false });
		
		remainingQuota = stats[0][0].getAllocation() - stats[0][0].getNew();

		if ( remainingQuota > 0 ) {	return false; } else { return true; }

	}

},
/* @Prototype */
{
	init: function() {
		
	},

	getAllocation: function() { 

		if ( this.enquiryAllocation == undefined ) {
			var self = this;
			this.Class.findMe({}, function( stats ) { self.enquiryAllocation = stats[0].enquiryAllocation; });
		}

		return this.enquiryAllocation;
	},
	getRemaingQuota: function() { 
		var remainingQuota = 0;
		remainingQuota = this.getAllocation() - (this.getNew() + this.getReassigned());
		return remainingQuota; 
	},

	getCombinedTotal:function(){
		return (this.getWaitingResponse() + this.getInProgress() + this.getReassigned());
	},

	checkReachedLimit:function(){
		// console.log('Remaining quota: '+ );
		return ( this.getRemaingQuota() > 0 ) ? false : true;
	},
	getWaitingResponse: function() { return this['Waiting For Response']; },
	getClosed: function() { return this.Closed; },
	getNew: function() { return this.New || 0; },
	getReassigned: function() { return this.Reassigned || 0; },
	getInProgress: function() { return this['In Progress']; },
	getID:function(){ return this.id; },
	getName: function() { return this.name; },
	getUsername:function(){ return this.principalName },

	getEmail:function(){

		if( $.type(this.consultantEmail) === 'undefined' ) {
			//If the consultant email is not set try the native email field.  
			//If this is set then automatically set the consultantEmail field from it
			this.consultantEmail = this.mail;

			if( $.type(this.consultantEmail) !== 'undefined' ) {
				this.Class.setAttribute({ consultantEmail: this.consultantEmail });
			}
		}

		return this.consultantEmail;
	},

	getRole:function(){ return this.role.name },
	getDomain:function(){ return this.principalName.replace(/^.+?@/, "") },

	/* User Attribute Related getters */
	setAttributes: function(attributes, success, error) {
		this.Class.setAttribute(attributes, success, error);

		return;
	},

	/**
	 * Attributes are now retrieved with user call so need for secondary attribute calls
	 * @return {[type]} [description]
	 */
	getSignature: function() {
		// var data = this.Class.findAttribute({ attribute: "consultantSignature" });
		// return data.consultantSignature;
		return this.consultantSignature || "Please set your email signature in the consultant setup screen";
	},

	setSignature: function(signature) {
		this.Class.setAttribute({ consultantSignature: signature });
		return;
	},

	getStoreName: function() {
		// var data = this.Class.findAttribute({ attribute: "storeName" });
		// return data.storeName;
		return this.storeName;

	},

	setStoreName: function(storeName) {
		this.Class.setAttribute({ storeName: storeName });
		return;
	},

	getStorePsuedo: function() {
		// var data = this.Class.findAttribute({ attribute: "storePseudo" });
		// return data.storePseudo;
		return this.storePseudo;
	},

	setStorePsuedo: function(signature) {
		this.Class.setAttribute({ storePseudo: signature });
		return;

	}

});

