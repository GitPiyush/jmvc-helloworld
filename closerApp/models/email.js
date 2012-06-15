$.Model.extend('Closer.Models.Email',
/* @Static */
{
	errorHandler: "error",
	basePath: '/rest/enquiries/',

	findAll: function( params, success, error ){
		if ( Closer.Controllers.Application.settings.liveData ) {
			$.ajax({
				url: Closer.Controllers.Application.settings.dataUrl + this.basePath + params['id'] + "/emails",
				type: 'get',
				dataType: 'json',
				success: this.callback(['wrapMany',success]),
				error: this.callback([this.errorHandler, error])
			});
		} else {
			
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
	getEmailTitle: function() { return this.message; },
	getEmailSubject: function() { return this.subject; },
	getEmailToAddress: function() { return this.toAddress; },
	getEmailFromAddress: function() { return this.fromAddress; },
	getEmailCCAddresses: function() { return this.ccAddresses; },
	getEmailBCCAddresses: function() {

		return this.bccAddresses;
	},
	getEmailAttachments: function() { return this.attachments; },
	getEmailAttachmentFiles:function(){
		var attachments=[];
		if ( this.attachments.length > 0 ) {
			$.each(this.attachments, function(k, v){
				attachments.push(v.filename);
			});
		}
		return attachments;
	}, 
	getEmailDataSent: function() { return this.dataSent; }

});

