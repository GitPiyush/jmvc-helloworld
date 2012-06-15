/**
 * @tag controllers, home
 */
$.Controller.extend('Closer.Controllers.Page.Search',
/* @Static */
{
	pageDetails: {
		name: "Search Enquiries",
		alias: "searchEnquiries",
		component: "Enquiries",
		filterClass: ".enquiry",
		listContainer: "searchResults"
	},

	setup: function() {
		var self = this;
		
		OpenAjax.hub.subscribe('Auth.Success.Ready', function() {
			$('#searchTab').closer_page_search({ pageDetails: self.pageDetails });
		});
	},

	assignConsultantAutocomplete: function( element, storage ) {
		
		Closer.Controllers.Application.setupAutocomplete( element, Closer.Controllers.Application.userData, Closer.Controllers.Application.userList, storage, null );
	}
},
/* @Prototype */
{
	
	currentEnquiry:null,
	enquiryNotesEditor:null,
	searchTruncatedMsg:$.View('//closerApp/views/page/partials/search/searchTruncatedMsg'),

	init: function(el, params) {	
		this.pageDetails = params.pageDetails;
	},

	applyDatePickers: function() {
		var startPicker = this.element.find(".searchReceivedStartDate");
		var endPicker = this.element.find(".searchReceivedEndDate");

		var startOptions = {
			defaultDate: -7,
			dateFormat: "dd-mm-yy",
			gotoCurrent: true
		};

		var endOptions = {
			defaultDate: 0,
			dateFormat: "dd-mm-yy",
			gotoCurrent: true
		};

		startPicker.datepicker(startOptions);
		endPicker.datepicker(endOptions);

		var newDate = new Date();

		endPicker.datepicker( "setDate", newDate );
		startPicker.datepicker( "setDate", "-7d" );

		
	},

	"searchTab.Focus subscribe": function(event, data) {
		var self = this;

		// Kill any instances of the EnquiryEditor
		if( this.enquiryNotesEditor ){
			this.enquiryNotesEditor.destroy();
		}

		this.element.html("");
		this.element.append('//closerApp/views/page/partials/pageHeader', { data: this.pageDetails });
		this.element.append('//closerApp/views/page/search_main', { data: this.pageDetails }, function() {
			var filterDetails = {
				type: "list",
				container: self.element.find("." + self.pageDetails.listContainer),
				itemElement: self.pageDetails.filterClass,
				itemSubElement: ".info"
			};

			self.applyDatePickers();

			// Setup the consultant autocomplete
			if(Closer.Controllers.Page.Login.checkPermission('searchByConsultant')) {
				var inputField = self.element.find('input[name="consultant"]');
				self.Class.assignConsultantAutocomplete(inputField,inputField);
			}

			OpenAjax.hub.publish("tab.loaded");
		});
	},

	".consultantSearchButton click": function( el, ev ) {
		this.refreshEnquiries();
	},

	/*"#searchForm :input keypress":function( el, ev ) {
		var code = (ev.keyCode ? ev.keyCode : ev.which);
		if( code===13 ){
			this.refreshEnquiries();
		}
	},*/

	refreshEnquiries: function () {

		var searchTermsForm = this.element.find(".searchListing form").serializeArray();
		var searchTerms = {};

		$.each(searchTermsForm, function(key, value) {
			searchTerms[value.name] = value.value;
		});
		
		searchTerms.country = Closer.Controllers.Application.getDomainFeatures('countryCode');

		if ( this.validate( searchTerms ) ) {

			OpenAjax.hub.publish("list.loading", { element: $("." + this.pageDetails.listContainer) });

			Closer.Models.Enquiry.findSearch({ searchTerms: searchTerms }, this.callback('refreshEnquiriesList'));

		}
	},

	refreshEnquiriesList: function ( enquiries ) {

		OpenAjax.hub.publish("list.loaded", { element: $("." + this.pageDetails.listContainer) });

		if ( enquiries === undefined ) {
			this.element.children("." + this.pageDetails.listContainer).html("");
			this.element.children("." + this.pageDetails.listContainer).append('<h2 style="text-align:center;">No Enquiries Found</h2>');
		} else { 
			if( enquiries.length >= 30 ){
				OpenAjax.hub.publish("modal.display", { content: this.searchTruncatedMsg, callbackEvent: "none", modalLoadedEvent: "none" });

				window.setTimeout(function(){
					OpenAjax.hub.publish('modal.destroy');
				}, 5000);
			}
			this.element.children("." + this.pageDetails.listContainer).html("");
			this.element.children("." + this.pageDetails.listContainer).append('//closerApp/views/page/partials/enquiries/listingEnquiry', { data: enquiries, isSearch:true }, function() { OpenAjax.hub.publish("data.loaded"); });
		}

	},

	validate: function ( searchTerms ) {
		
		if ( Closer.Controllers.Application.validateFields( searchTerms ) ) {
			
			if ( searchTerms.consultant === "" && searchTerms.customerEmail === "" ) {
				OpenAjax.hub.publish("Closer.Message", { type:'error', message:'Please specify either a Consultant or a Customer Email' });
				// OpenAjax.hub.publish("modal.display", { content: "Please specify either a Consultant or a Customer Email", callbackEvent: "none", modalLoadedEvent: "none" });

				return false;
			} else {
				return true;
			}

		} else {
			return false;
		}
	},

	/**
	* Edit enquiry from search results 
	* TODO:  Large amount of duplication here from enquiries controller
	* @param  {[type]} enquiry [description]
	* @return {[type]}         [description]
	*/
	editEnquiry: function ( enquiry ) {
		var self = this;

		this.currentEnquiry = enquiry;
		// window.enquiry = enquiry;

		// check if this is another consultants enquiry
		var myEnquiry = (Closer.Controllers.Application.getMe().id === enquiry.getUser().id);


		$(this.element).find(".filters").addClass('temporarilyHidden').fadeOut(500);
		$(this.element).find(".sorting").addClass('temporarilyHidden').fadeOut(500);
		$(this.element).find(".searchHeading").addClass('temporarilyHidden').fadeOut(500);
		$(this.element).find(".paging").addClass('temporarilyHidden').fadeOut(500);
		$(this.element).find("h1").next("h2").addClass('temporarilyHidden').fadeOut(500);
		$(this.element).find(".searchListing").addClass('temporarilyHidden').fadeOut(500, function() {
			$(self.element).find("h1").before($.View("//closerApp/views/page/partials/enquiries/backTo_link", {linkText:'Back to Search Results'}));
			$("." + self.pageDetails.listContainer ).html("//closerApp/views/page/partials/enquiries/editEnquiry", {
				myEnquiry:myEnquiry,
				enquiry: enquiry,
				emailMethod:Closer.Controllers.Application.getEmailMethod()

			}, function(){//Template loaded callback

				//hook up the reassign widget
				if( Closer.Controllers.Page.Login.checkPermission('reassign') ){
					// self.element.find('.reassignEnquiry').closer_reassign({ currentEnquiry:self.currentEnquiry });
					OpenAjax.hub.publish("reassign.load", { element: self.element.find('.reassignEnquiry'), currentEnquiry:self.currentEnquiry } );
				}

				//Load the notes editor
				self.enquiryNotesEditor = CKEDITOR.replace('notes', { toolbar: Closer.Controllers.Application.editorToolbar, readOnly:true });

				//Set all links in the enquiry to open externally
				self.element.find('.enquiryText').find('a').attr('target', '_blank');
			});

			// $.extend( enquiry.state, {async:false} );

			if( myEnquiry ){
				Closer.Models.State.findPermitted( enquiry.state, self.callback('loadEnquiryTransitions') );
			}


			Closer.Models.Email.findAll( { id: enquiry.id }, self.callback("loadEmailList") );
		});
		$(this.element).find("h1").text("Enquiry View");
		$(window).scrollTop(0);
	},

	/**
	* saveNotes button will revert styling of the textarea and trigger an update on the enquiry
	* @param  {[type]} el [description]
	* @param  {[type]} ev [description]
	* @return {[type]}
	*/
	".saveNotesButton click": function( el, ev ) {
		var $notes = this.element.find("#notes");

		// Save the CKEditor into the textarea
		$notes.val( this.enquiryNotesEditor.getData() );


		if( $notes.val().length > 0 ) {
			
			// validate
			// var validationObj = {};
			// validationObj[$notes.attr('name')] = $notes.val();

			// if( Closer.Controllers.Application.validateFields(validationObj) ) {
				this.currentEnquiry.setNotes( $notes.val() );

				// Reset the dom state of the notes section
				// $notes.attr("readonly", true).addClass('readonly');
				this.enquiryNotesEditor.setReadOnly( true );
				el.text("Edit");
				el.attr("class", "editButton");
			// }
		}
		else{
			// Clear the note against this enquiries section
			// Reset the dom state of the notes section
			this.currentEnquiry.setNotes( "<p></p>" );
			// $notes.attr("readonly", true).addClass('readonly');
			this.enquiryNotesEditor.setReadOnly( true );
			
			el.text("Edit");
			el.attr("class", "editButton");
		}

	},

	/**
	* Handles making notes editable
	* @param  {Object} el jquery dom object
	* @param  {Object} ev Event object passed
	* @return {null}
	*/
	".editButton click":function( el, ev ){
		
		this.enquiryNotesEditor.setReadOnly(false);

		// $("#notes").attr("readonly", false).removeClass('readonly').focus();
		el.text('Save');
		el.attr('class', 'saveNotesButton clsButton');
	},

	loadEnquiryTransitions: function( transitions ) {

		var self = this,
			newTransitions=[];

		// var currentState = (this.currentEnquiry.state.id == 100) ? null : this.currentEnquiry.state;
		var currentState = this.currentEnquiry.state;


		// filter the transions
		$.each(transitions, function(k,v){

			if( this.name !== "Closed" && this.name !== "Reassigned" && this.name !== "New" ){
				newTransitions.push(this);
			}
		});

		if( currentState.name !== "Closed" ){
			$(this.element).find(".enquiryProgress").html("");
			$(this.element).find(".enquiryProgress").append($.View('//closerApp/views/page/partials/enquiries/permittedTransitions', { transitions: newTransitions, current: self.currentEnquiry.state } ));

		}

		else{
			$(this.element).find(".enquiryProgress").replaceWith('<strong>Closed</strong>');
		}

	},

	loadEmailList: function ( emails ) {
		$(this.element).find(".previousEmails").append($.View('//closerApp/views/page/partials/enquiries/listEmail', { data: emails })); 
	},



	/* CMAIL - MASS DUPKICATION HERE AND ENQUIRIES CONTROLLER NEEDS MOVING TO OWN CMAIL WIDGET*/

	/**
	 * Handles email buttons in single enquiry view screen
	 * @param  {object} el Element object passed with event
	 * @param  {object} ev Event object
	 * @return {null} 
	 */
	".email click": function( el, ev ) {
		ev.preventDefault();
		if ( Closer.Controllers.Application.checkMailAddress() ) {
			this.emailClient( this.currentEnquiry, el, ev );
		};
	},

	/**
	 * Destroy the CKEditor instance
	 * #THIS MAY BE RUNNING TWICE
	 * @param  {[type]} attribute [description]
	 * @return {[type]}
	 */
	// "emailSearchModal.destroyed subscribe": function(attribute){
	// 	// delete this.currentEnquiry;
	// 	this.emailSpellingChecked=null;
	// 	CKEDITOR.instances.cmailMessage.destroy();
	// },

	/**
	 * This function will check to see if the users domain has access to CMail and
	 * will choose a method based on result
	 * @param  {[type]} attribute [description]
	 * @return {[type]}           [description]
	 */
	emailClient: function( enquiry, el, ev ){
		var emailMethod = Closer.Controllers.Application.getEmailMethod(),
			me = Closer.Controllers.Application.getMe();

		// Open standard Cmail application
		if( emailMethod == "cmail" ) {
			OpenAjax.hub.publish('modal.display',{
				content: $.View('//closerApp/views/page/partials/enquiries/cmail/cmail', { enquiry:enquiry, user: me }),
				callbackEvent: 'enquiry.sendEmail',
				modalLoadedEvent: 'emailModal.loaded',
				modalDestroyedEvent: 'emailModal.destroyed'
			});

			ev.preventDefault();
		}
	},

	/* END OF CMAIL DUPLICATION IMPLEMENTATION */


	/* START MASS DUPLICATION OF FINISH ENQUIRY */

	".editEnquiryFinish click": function( el, ev ) {
		OpenAjax.hub.publish('modal.display',{
	 		content: $.View('//closerApp/views/page/partials/enquiries/finish_outer', { enquiry: this.currentEnquiry }),
	 		callbackEvent: 'enquiryViaSearch.finish',
	 		modalLoadedEvent: 'finishModal.loaded'
	 	});
	},

	"enquiryViaSearch.finish subscribe": function( event, data ) {

		// console.log('FINISHING');
		
		var formData = {},
			upsell = false,
			errorsFound=false
			attributes={},
			resolutionID=false;

		
		// Process form data into object
		$.each(data.formData, function(key, value) {
			var dataClean=true;
			if( $.type(value.value) === "string" && value.value.length < 1 ) {
				dataClean = false;
			}

			if(dataClean) {
				formData[value.name] = value.value;
			}
		});


		if ( formData.outcome == "SALE" ) {
			upsell = formData.upsell;
		 	resolutionID = formData.outcomeUpsell || false;
		}
		else
		{
		 	resolutionID = formData.outcomeInput || false;

		 	// console.debug( resolutionID, "why you no work" );
		}

		if ( $.type(formData.outcome) === 'undefined' ) {
			errorsFound=true;
			OpenAjax.hub.publish("elementNotice.display", { info: { outcomeNosale: "Please choose an enquiry resolution type." } });
		}

		// Is booking TTV set??
		if( formData.outcome === "SALE" && ( formData.bookingTTV === undefined || formData.bookingTTV.length < 1 )){
			errorsFound=true;
			OpenAjax.hub.publish("elementNotice.display", { info: { dollarInput: "Please enter a Booking TTV value." } });
		}

		// Is the upsell set
		if(formData.outcome === "SALE" && resolutionID === false) {
			errorsFound=true;
			OpenAjax.hub.publish("elementNotice.display", { info: { outcomeInput: "Please select an upsell value." } });

		}

		if( formData.outcome === 'NO_SALE' && resolutionID === false){
			errorsFound=true;
			OpenAjax.hub.publish("elementNotice.display", { info: { outcomeInput: "Please select a reason for no sale." } });
		}

		// Check if the hot or not feature has been used
		if( $.type(formData.hotOrNot) !== 'undefined' ){

			formData.hotOrNotText = formData.hotOrNotText || "No reason given";

			var hotOrNot = {
				hotOrNot:( formData.hotOrNot === "true" ) ? "Hot" : "Not",
				hotOrNotReason: formData.hotOrNotText
			};

			if( Closer.Controllers.Application.validateFields(hotOrNot) ) {
		 		attributes = $.extend(attributes, hotOrNot);
			}

			else{
				errorsFound=true;
			}
		}
		
		if( !errorsFound ) {
			// this.currentEnquiry.update();
			var user = $('#Outer').model();

			this.currentEnquiry.finish( resolutionID, upsell, user, attributes, this.callback("enquiryClosedSuccess"), this.callback("enquiryClosedFailure") );
			OpenAjax.hub.publish("modal.destroy");
		}
	},

	enquiryClosedSuccess: function() {
		// OpenAjax.hub.publish("modal.display", { content: "Enquiry successfully closed", callbackEvent:"", modalLoadedEvent:'' });

		// setTimeout( function() { OpenAjax.hub.publish("modal.destroy"); }, 2000 );
		OpenAjax.hub.publish('Closer.Message', {
			type:'notice',
			message:'Enquiry successfully closed'
		});
		
		//CHANGE THIS LINE TO CHANGE WHERE THE REDIECT GOES TO
		//PROBABLY BACK TO SEARCH RESULTS
		OpenAjax.hub.publish('tab.load', { tab: 'enquiries' });
		

	},

	enquiryClosedFailure: function(){
		// OpenAjax.hub.publish("modal.display", { content: "There was a problem closing this enquiry.  If the issue persists please contact system administration.", callbackEvent:"", modalLoadedEvent:'' });
		OpenAjax.hub.publish('Closer.Message', {
			type:'error',
			message:'There was a problem closing this enquiry.  If the issue persists please contact system administration.'
		});
	},

	/* FINISH MASS DUPLICATION OF FINISH ENQUIRY */


	/* End of enquiry edit functions */


	/**
	* SHOULD THIS BE HERE
	* @param  {[type]} el [description]
	* @param  {[type]} ev [description]
	* @return {[type]}    [description]
	*/
	".manageEnquiry dblclick":function (el, ev) {
		Closer.Models.Enquiry.findOne( el.models()[0], this.callback('editEnquiry') );
	},

	".backToLink click": function( el, ev ) {
		// Kill any instances of the EnquiryEditor
		if( this.enquiryNotesEditor ){
			this.enquiryNotesEditor.destroy();
		}
		

		ev.preventDefault();
		$(this.element).find("h1").text("Search Enquiries");
		$(this.element).find(".backToLink").remove();
		$(this.element).find(".temporarilyHidden").fadeIn();
		this.refreshEnquiries();
	},

	".sortButton click":function(el, ev){
		ev.preventDefault();
	}
});
