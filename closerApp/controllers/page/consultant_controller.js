/**
 * @tag controllers, home
 */
$.Controller.extend('Closer.Controllers.Page.Consultant',
/* @Static */
{
	pageDetails: {
		name: "Consultant Details",
		alias: "consultantDetails",
		component: "Queues",
		filterClass: ".queue",
		listContainer: "manageQueueListing",
		defaultSig: "Please set your signature in the 'Consultant Setup' page"
	},

	setup: function() {
		var self = this;

	    OpenAjax.hub.subscribe('Auth.Success.Ready', function() {
	    	$('#consultantSetupTab').closer_page_consultant({ pageDetails: self.pageDetails });
	    });
	}
},
/* @Prototype */
{
	// CKEDITOR instance
	editor:null,

	init: function(el, params) {	
		this.pageDetails = params.pageDetails;
		
	},

	/**
	 * Setups the page when the consultant tab is selected
	 * @param  {Object} event object containing details of the event triggered
	 * @param  {Object} data  Data object passed with event
	 * @return {null} 
	 */
	"consultantSetupTab.Focus subscribe": function(event, data) {
		var self = this;

		this.consultantDetails = Closer.Controllers.Application.getMe();

		// if ( $.isEmptyObject(this.consultantDetails.getSignature()) ) {
			// this.consultantDetails.consultantSignature = this.pageDetails.defaultSig;
			// this.consultantDetails.setSignature( this.pageDetails.defaultSig );
		// }

		this.element.html("");
		this.element.append('//closerApp/views/page/partials/pageHeader', { data: this.pageDetails });
		this.element.append('//closerApp/views/page/consultantSetup_main', { data: this.pageDetails, consultantDetails: this.consultantDetails }, function() {
			self.editor = CKEDITOR.replace( 'consultantSignature', { 
				toolbar: Closer.Controllers.Application.editorToolbar,
				extraPlugins: 'aspell'
			});

			// Check email and if not exist focus and make prominent
			var email = self.consultantDetails.getEmail() || "";
			if( !email.match(Closer.Controllers.Application.validationPatterns.email) ) {
				self.element.find('#consultantEmail').addClass('ui-state-error').focus();
			} 

			// If the email is set and active directory is on then do not allow chaging of email
			else if( Closer.Controllers.Application.getDomainFeatures('ActiveDirectorySetup') ){
				self.element.find('#consultantEmail').addClass('readonly').attr('readonly', true);
			}

			OpenAjax.hub.publish("tab.loaded");
		});
	},
	
	/* Begin Consultant Save Functions */

	".inputForm .saveButton click":function( el, ev ) {
		ev.preventDefault();

		OpenAjax.hub.publish("data.loading");

		var consultantDetails = {};

		// Save the contents of the CKEDITOR instance
		$('textarea[name=consultantSignature]').val( this.editor.getData() );

		var newDetails = this.element.find(".inputForm form").serializeArray();


		// Process form data into object
		$.each(newDetails, function(key, value) {
			if ( value.value != "" && value.name != "consultantName" ) { consultantDetails[value.name] = value.value; }
	 	});


	 	if( this.validate( consultantDetails ) ){

		 	this.consultantDetails.setAttributes( consultantDetails, 
		 		function(){
		 			OpenAjax.hub.publish("Closer.Message", {
		 				type:'success',
		 				message:'Successfully updated consultant details'
		 			});

		 			// Update the ME object
		 			Closer.Controllers.Application.updateMe();
		 		}, 
		 		function(){
		 			OpenAjax.hub.publish("Closer.Message", {
		 				type:'error',
		 				message:'There was an error updating consultant details, please contact system administrator'
		 			});
		 		}
		 	);
		 	// this.consultantDetails.setStorePsuedo( consultantDetails.storePsuedo );
		 	// this.consultantDetails.setStoreName( consultantDetails.storeName );
	 	}

	 	OpenAjax.hub.publish("data.loaded");

	},

	validate: function( details ) {
		if ( Closer.Controllers.Application.validateFields( details ) ) {
			return true;
		} else {
			return false;
		}
	},

	/**
	 * Clears the `important` class when text is changed
	 * @param  {object} el jquery element object
	 * @param  {object} ev event object
	 * @return {null}
	 */
	".ui-state-error keypress": function( el, ev ){
		el.removeClass('ui-state-error');
	},

	/**
	 * Catches Consultant tab.destroyed and destroys CKEditor instance
	 * @return {[type]}
	 */
	"consultantSetup.destroyed subscribe": function( called, data ){
		CKEDITOR.instances.consultantSignature.destroy();
	}

	
	/* End Consultant Save Functions */	
});