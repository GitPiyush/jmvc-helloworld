/**
 * @tag controllers, home
 * Reassign widget is used in several instances, moved into own controller
 */
$.Controller.extend('Closer.Controllers.Reassign',
/* @Static */
{

	setup: function(){
		var self = this;
		OpenAjax.hub.subscribe('reassign.load', function(event, data) {

			
			data.element.closer_reassign({ currentEnquiry: data.currentEnquiry });
		});
	}
},
/* @Prototype */
{
	init: function(el, params){

		if( $.type(params) === 'undefined' || 
			$.type(params.currentEnquiry) === 'undefined' ){
			OpenAjax.hub.publish('Closer.Message', {
				type:'error',
				message:'There was a problem initiating enquiry reassign feature.  If the problem persists please contact the system administrator'
			});
			return false;
		}

		this.options = params;
		this.currentEnquiry = this.options.currentEnquiry;
	},

	/** Event mapping **/
	/**
	 * Handles click events on the reassign icon
	 * @param  {object} el element object passed with event
	 * @param  {object} ev event object describes event
	 * @return {null}    
	 */
	".reassignButton click": function( el, ev ) {
		ev.preventDefault();
		this.reassignEnquiryShow();
	},

	/**
	 * Handles clicks on the reassign do button
	 * @param  {[type]} el [description]
	 * @param  {[type]} ev [description]
	 * @return {[type]}    [description]
	 */
	".reassignDoButton click": function( el, ev ) {
		this.reassignEnquiry( el.data("model") );
	},

	".cancelButton click": function( el, ev ) {
		this.reassignEnquiryDestroy();
	},


	/** Reassign methods **/
	reassignEnquiryShow:function(){

		var self = this;

		if( this.element.find('.reassignBox').length === 0 ){

			this.newRBox = $( $.View('//closerApp/views/page/partials/enquiries/reassign') );
			this.element.append( this.newRBox );
			this.newRBox.html('//closerApp/views/page/partials/enquiries/reassign_inner', {}, function(data) {
				self.newRBox.fadeIn('slow');
				self.assignConsultantAutocomplete( self.newRBox.find("input.reassignConsultant"), self.newRBox.find(".reassignDoButton") );
				self.newRBox.find("input.reassignConsultant").focus();
			});
		}
	},

	reassignEnquiryDestroy:function(){
		this.element.find('.reassignBox').remove();
	},


	reassignEnquiry:function( user ){
		var self = this;
		this.currentEnquiry.user = user; //user object is attached to the button when autocmplete is selected
		this.currentEnquiry.setEnquiryState(1086001); // Set to reassigned state
		this.currentEnquiry.setPriority(1);

		this.currentEnquiry.update(function(){

			self.reassignEnquiryDestroy();

			// Success message
			OpenAjax.hub.publish('Closer.Message', {
				type:'notice',
				message:'Enquiry successfully reassigned'
			});

		}, function(){
			// fail message
			OpenAjax.hub.publish('Closer.Message', {
				type:'error',
				message:'Enquiry could not be reassigned please contact system administrator'
			});
		});
	},


	/** Helper methods **/
	assignConsultantAutocomplete: function( element, storage ) {
		Closer.Controllers.Application.setupAutocomplete( element, Closer.Controllers.Application.userData, Closer.Controllers.Application.userList, storage, null );
	}




});