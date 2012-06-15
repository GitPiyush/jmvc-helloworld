/**
 * @tag controllers, home
 */
$.Controller.extend('Closer.Controllers.Page.Enquiries',
/* @Static */
{

	cmailCounter:0,
	pendingAttachments:[],

	pageDetails: {
		name          : "Your Enquiries",
		alias         : "enquiries",
		component     : "Enquiries",
		filterClass   : ".enquiry",
		listContainer : "enquiryListing"
	},

	resolutionTypes:null,

	setup: function() {
		var self = this;
		
		OpenAjax.hub.subscribe('Auth.Success.Ready', function() {

			$('#enquiriesTab').closer_page_enquiries({ pageDetails: self.pageDetails });
		});
	},

	assignConsultantAutocomplete: function( element, storage ) {
		Closer.Controllers.Application.setupAutocomplete( element, Closer.Controllers.Application.userData, Closer.Controllers.Application.userList, storage, null );
	},

	/**
	 * Starts new upload and adds the attachment details to an array of pendingAttachments
	 * @param  {object} data description of attachment object
	 * @return {null}
	 */
	uploadAttachment: function( data ) {

		var self              = this,
			iframe            = data.element.find("iframe"),
			form              = data.element.find("form"),
			fileName          = form.find(".cmailAttachment").val();

			// Clean the filename display for anything before last slash
			fileName          = fileName.replace(/^(.+?(\/|\\))*/i, ''),

			// Check the browser support matrix before chossing a method to upload the file
			nativeJSONSupport = Closer.Controllers.Application.getBrowserSupport('nativeJSONSupport');
			responseType      = nativeJSONSupport ? 'json' : 'html';

		// Check 
		this.pendingAttachments.push({
			iframe       : iframe,
			form         : form,
			fileName     : fileName,
			status       : "pending",
			responseType : responseType
		});

		var callbackID = this.pendingAttachments.length-1;

		// Makes the form target the ifram to send file as if asynchronously
		form.attr("target", iframe.attr("id"));

		if( responseType === 'json' ) {

			iframe.bind('load', function(){ self.uploadComplete( callbackID ) });
		} else if ( responseType === 'html' ) {
			var params = {
				responseType : responseType,
				callback     : 'top.Closer.Controllers.Page.Enquiries.uploadComplete',
				callbackID   : callbackID
			}; 

			var uploadURL = Closer.Controllers.Application.settings.dataUrl + Closer.Controllers.Application.settings.fileUploadUrl;
			
			form.attr('action', function(){ return uploadURL + "?" + $.param(params); })
			// form.attr('action', function(){ return "/closerApp/data/sampleAttachmentResponse.html" + "?" + $.param(params); });
			
		} else {
			OpenAjax.hub.publish('Closer.Message', {
				type    : 'error',
				sticky  : true,
				message :'An unknown error occured when uploading your attachment, if the problem persists please contant the system administrator'
			});
		}
	},

	/**
	 * Callback invoked when attachement upload has finished
	 * Currently interface only allows one attachment upload at a time
	 * however script functionality allows for concurrent uploads to be handled
	 * so only small change to interface would be needed to allow multiple attachments 
	 * to be added at the smae time.
	 * 
	 * @param  {int} id id of pending attachment to be completed
	 * @return {null}
	 */
	uploadComplete:function( id ){

		// console.log('Upload complete is called');

		if( $.type(id) !== "number" ) {
			OpenAjax.hub.publish('Closer.Message', {
				type   : 'error',
				sticky : true,
				message: "Error uploading attachment.  If problem persists please contact system administrator."
			});
			return false;
		}

		// get attachment details
		var attachment    = this.pendingAttachments[ id ],
			jsonData,
			element,
			attachmentId,
			iframeData    = frames[attachment.iframe.attr("name")].document.getElementsByTagName("body")[0],
			$iframeData   = $(iframeData),
			formContainer = attachment.form.parent(".cmailAttachmentField"),
			uploadResponse;

		// Passing unformed JSON string to $.parseJSON will likely throw an exception,
		// this will help us handle it gracefully
		try{

			switch( attachment.responseType ) {
				case "json":
					uploadResponse = ($iframeData.find("pre").length > 0) ? 
						$.parseJSON( $iframeData.find("pre").text() ) :
						$iframeData.find(':contains("mailattch")').text(); 
					break;
				case "html":
					uploadResponse = $.parseJSON( $iframeData.find('pre#uploadResponse').text() );
					break;
			}

			// catch upload errors
			if( $.type(uploadResponse.errorCode) !== 'undefined') {

				attachment.status='failed';
				
				var errorReported=false;

				//Cycle through error types outputting messages
				$.each(uploadResponse.errorMessages, function(k1, serverError ){

					$.each(Closer.Controllers.Application.settings.cmail.errorTypes, function(k2, closerError){
						if( serverError.indexOf( closerError.type ) > -1 ) {

							errorReported=true;
					
							OpenAjax.hub.publish('Closer.Message', {
								type    :'error',
								message :closerError.message
							});
						}
					});
				});

				if( !errorReported ) {
					throw "unknown";
				}

			} else if ( $.type(uploadResponse.attachmentFileHandle) !== 'undefined' && 
				uploadResponse.attachmentFileHandle.match(/mailattch[\d]+/i)) {
				//Successful attachment handle found
				$(".uploadedAttachments").append( "//closerApp/views/page/partials/enquiries/cmail/attachment_od", {
					attachment : uploadResponse.attachmentFileHandle,
					fileName   : attachment.fileName 
				});

				attachment.status='complete';
				
			} else {
				throw "unknown";
			}

		} catch(err){
			// Catches unhandled errors and displays a standard message
			OpenAjax.hub.publish('Closer.Message', {
				type    :'error',
				message :'An ' + err + ' error occured whilst uploading your file.  If problem persists please contact system administrator'
			});

			attachment.status='failed';
		}

		// replace the field
		this.replaceUploadField( formContainer );

	},

	/**
	 * removes the current upload form and replaces with a new 
	 * instance so further uploads can be made
	 * 
	 * @param  {object} formContainer jQuery object containing current upload formContainer
	 * @return {null}
	 */
	replaceUploadField:function ( formContainer ) {
		this.cmailCounter++;
		formContainer.after('//closerApp/views/page/partials/enquiries/cmail/attachment', { number: this.cmailCounter } );
		formContainer.remove();
	}
},

/* @Prototype */
{
	// Defining prototype scope variables
	currentEnquiry       :null,
	enquiryNotesEditor   :null,
	currentSelectedQueue :null,
	currentViewState     :null,
	emailSpellingChecked :null,
	emailSendPending     :{
		status :false,
		data   :null
	},

	init: function(el, params) {	
		this.pageDetails = params.pageDetails;

		//Register listener for CKEDITOR dialog close calls (i.e. when Spell check closed)
		$(document).delegate(".cke_dialog a[title=Cancel], .cke_dialog_close_button",
			"click",
			function(){

			// Actually fires for all dialogs closes so will need to check that there is a 
			// pending email send before doing anything with it
			OpenAjax.hub.publish('Closer.Spellcheck', { state: 'finished' });
		});
	},

	/**
	 * Filters are now applied here using new REST service call rather than JS filtering
	 * @return {null}
	 */
	".applyTextFilter click":function(){
		this.currentPage=1;
		this.refreshEnquiries()
	},

	/**
	 * Clears the filter text input
	 * @return {null}
	 */
	".clearTextFilter click":function(){
		this.element.find('input.textFilter').val('').trigger('blur');
		this.refreshEnquiries(1);
	},

	/**
	 * Allows filter to be applied via hitting the return key
	 * @param  {object} el jQuery element object
	 * @param  {objet} ev jQuery event object
	 * @return {null}
	 */
	".textFilter keypress":function( el, ev ) {
		var code = (ev.keyCode ? ev.keyCode : ev.which);
		if( code === 13 ){
			this.currentPage=1;
			this.refreshEnquiries()
		}
	},

	/**
	 * Called each time the enquiries tab is loaded
	 * @param  {string} event name of published event
	 * @param  {object} data  object containing whatever was passed with the published event
	 * @return {null}
	 */
	"enquiriesTab.Focus subscribe": function(event, data) {
		var self = this;

		this.currentViewState = 'list';

		// Create the view
		this.element.html("");
		this.element.append('//closerApp/views/page/partials/pageHeader', { data: this.pageDetails });
		this.element.append('//closerApp/views/page/partials/enquiries/getEnquiries', { data: this.pageDetails });
		this.element.find('.enquiryRetrieveBox').after('//closerApp/views/page/partials/filter_list', {pageData: self.pageDetails}, this.callback('setupFilterForm'));
		this.element.append('//closerApp/views/page/enquiries_main', { data: this.pageDetails }, function() {
			var filterDetails = {
				type           : "list",
				container      : self.element.find("." + self.pageDetails.listContainer),
				itemElement    : self.pageDetails.filterClass,
				itemSubElement : ".dataCol"
			}

			// Sorting of this table is currently disabled.
			// OpenAjax.hub.publish("sorting.load", { element: self.element.find(".sorting") , callback: self.pageDetails.alias } );
			// OpenAjax.hub.publish("filter.load", { after:$(self.element).find(".enquiryRetrieveBox"), pageDetails:self.pageDetails, filterDetails: filterDetails });
			
			self.refreshEnquiries( 1 );
			self.refreshQueues();
			Closer.Models.User.findStats({}, self.callback('refreshUserStats'));
			OpenAjax.hub.publish("tab.loaded");
		});
	},

	setupFilterForm: function(){
		// custom jQuery plugin invoked to attach autoclearing of placeholder
		$('.autoclear').autoclear();
	},

	/**
	 * Refreshes queue enquiries
	 * @param  {int} page passes the pagination page number user is currently on
	 * @return {null}
	 */
	refreshEnquiries: function( page ) {
		var params ={};

		// Shows loading graphic
		OpenAjax.hub.publish("list.loading", { element: $("." + this.pageDetails.listContainer) });

		if ( this.currentPage === undefined ) {
			this.currentPage = page || 1;
		} else if ( page !== undefined ) {
			this.currentPage = page;
		}

		params.pageNum = this.currentPage;
		
		var $filter = this.element.find('input.textFilter');
		if( !$filter.hasClass('autoclearActive') ){

			// Remove any none email like characters
			params.filterText = $filter.val()
				.replace(/[^a-z0-9\s\.@_]/gi,'');

			params.filteredFields = ['email', 'fullName'];
		}

		Closer.Models.Enquiry.findUser(params, this.callback('refreshEnquiryList'));
	},

	/**
	 * Callback for when refreshEnquiries has finished
	 * @param  {array} enquiries array of enquiry objects
	 * @return {null}
	 */
	refreshEnquiryList: function ( enquiries ) {

		var self = this;

		OpenAjax.hub.publish("list.loaded", { element: $("." + this.pageDetails.listContainer) });
		
		this.element.children("." + this.pageDetails.listContainer).html("");
		this.element.children("." + this.pageDetails.listContainer).append('//closerApp/views/page/partials/enquiries/listingEnquiry', {
			data: enquiries,
			emailMethod: Closer.Controllers.Application.getEmailMethod()
		}, function() { OpenAjax.hub.publish("data.loaded"); });
	},

	/**
	 * Refreshes user queues
	 * @return {null}
	 */
	refreshQueues: function() {
		Closer.Models.Queue.findAuthed({}, this.callback('refreshQueueList'));	
	},

	/**
	 * Callback for when refreshQueues has finished
	 * @param  {array} queues array of queue objects
	 * @return {null}
	 */
	refreshQueueList: function ( queues ) {

		var container = this.element.find(".queueList");

		container.html("");
		container.append('//closerApp/views/page/partials/enquiries/listingQueue', { data: queues });

		// Check to see if there was a previously selected queue
		if( $.type(this.currentSelectedQueue) !== null ) {
			var $queueList = this.element.find('.queueList');
			$queueList.find(':selected').attr('selected',false);
			$queueList.find('option[value='+ this.currentSelectedQueue +']')
				.attr('selected', true)
				.focus();
		}
	},

	/**
	 * Writes new stats to the user stats panel
	 * @param  {array} stats array of models (stats)
	 * @return {null}
	 */
	refreshUserStats: function ( stats ) {
		
		var updatedStatsModel = stats[0];

		//attach stats to stats container
		this.element.find('.enquiryRetrieveBox').model( updatedStatsModel );
		this.element.find(".enquiryLimit").html( updatedStatsModel.getAllocation() );
		this.element.find(".remainingLimit").html( updatedStatsModel.getRemaingQuota() );
		this.element.find(".waitingResponse").html( updatedStatsModel.getWaitingResponse() + updatedStatsModel.getInProgress() );
	},

	/* Start Pull Enquiry Functions */

	/**
	 * Click handler for 'get next enquiry button'
	 * @param  {object} el jQuery element object
	 * @param  {object} ev jQuery event object
	 * @return {null}
	 */
	".getNextEnquiry click": function( el, ev ) {

		if ( $(".queueList").val() == null ) {

			OpenAjax.hub.publish('Closer.Message', {
				type:'error',
				message:'Please select a queue to pull an enquiry from'
			});

		} else if ( this.element.find('.enquiryRetrieveBox').model().checkReachedLimit() ) {

			OpenAjax.hub.publish('Closer.Message', {
				type    :'error',
				message :'You have already pulled your maximum number of enquiries. If you would like to pull more please close/finish some open enquiries you have.'
			});

		} else {
			this.pullNextEnquiry( $(".queueList").val(), el );
		}
	},

	/**
	 * Pulls next enquiry from Closer back-end
	 * @param  {int} queueId id of queue to be pulled from
	 * @param  {[type]} el      [description]
	 * @return {[type]}         [description]
	 */
	pullNextEnquiry: function( queueId, el ) {

		var self = this;

		el.append('//closerApp/views/components/loading.ejs', {className:'getNextEnquiryLoader'})
			.attr('disabled', true);

		// OpenAjax.hub.publish("data.loading");
		Closer.Models.Enquiry.pullEnquiries({ queueId: queueId }, function(data) { 

			// Refresh the user stats
			Closer.Models.User.findStats({}, self.callback('refreshUserStats'));

			// Remove loading graphics
			el.attr('disabled', false);
			el.find('.getNextEnquiryLoader').remove();

			var message;
			// OpenAjax.hub.publish("data.loaded");
			if ( data.numEnquiriesPulled == 0 ) {
				message = "No new enquiries pulled";
			} else if ( data.numEnquiriesPulled == 1 ) {
				message = "1 new enquiry pulled";
			} else {
				message = data.numEnquiriesPulled + " new enquiries pulled";
			}
			
			OpenAjax.hub.publish('Closer.Message', {
				type:'notice',
				message:message
			});

			self.refreshEnquiries();
			self.refreshQueues();
		});
	},

	/**
	 * Just stores the current selected queue in case of refresh
	 * @param  {object} el jQuery element object
	 * @param  {object} ev jQuery event object
	 * @return {null}
	 */
	".queueList change":function( el, ev ){
		this.currentSelectedQueue = el.val();
	},

	/* End Pull Enquiry Functions */

	/* Start Enquiry Edit Functions */

	".manageEnquiry dblclick": function(el, ev) {
		Closer.Models.Enquiry.findOne( el.model(), this.callback('editEnquiry') );
	},

	/**
	 * Allows loading of an enquiry view from outside via a history call
	 * @param  {[type]} eventName  [description]
	 * @param  {[type]} enquiryObj [description]
	 * @return {[type]}
	 */
	"Closer.History.EnquiryView subscribe":function(eventName, enquiryObj){
		var currentState = Closer.Controllers.Components.Tabs.getInstance().currentState,
			self = this;
		if( currentState.tab !== "enquiries" ){
			OpenAjax.hub.publish('tab.load', {
				tab:'enquiries',
				historyType:'tab.change',
				ignore:true, 
				callback:function(){

					Closer.Models.Enquiry.findOne( $.extend(enquiryObj, {ignore:true}), self.callback('editEnquiry') );
				}
			});
		}
		else{

			Closer.Models.Enquiry.findOne( $.extend(enquiryObj, {ignore:true}), this.callback('editEnquiry') );
		}
	},

	/**
	 * saveNotes button will revert styling of the textarea and trigger an update on the enquiry
	 * @param  {[type]} el [description]
	 * @param  {[type]} ev [description]
	 * @return {[type]}
	 */
	".saveNotesButton click": function( el, ev ) {
		var $notes = $("#notes");

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

	/**
	 * Creates the enquiries 'edit' view screen from selected enquiry
	 * @param  {object} enquiry model of enquiry
	 * @return {null}
	 */
	editEnquiry: function ( enquiry ) {

		var historyObj = $.extend({}, {
			historyType :'enquiry.view',
			id          :enquiry.id,
			ignore      :enquiry.ignore || false,
			gimpEmailId :enquiry.gimpEmailId,
			title       :'Closer - Enquiry View'
		});

		// Publish the history state
		OpenAjax.hub.publish('Closer.History.Add', historyObj);

		var self = this;
		this.currentViewState = 'edit';
		this.currentEnquiry = enquiry;

		$(this.element).find(".filters").fadeOut(500);
		$(this.element).find(".sorting").fadeOut(500);
		$(this.element).find(".paging").fadeOut(500);
		$(this.element).find("h1").next("h2").fadeOut(500);
		$(this.element).find(".enquiryRetrieveBox").fadeOut(500, function() {
			$(self.element).find("h1").before("//closerApp/views/page/partials/enquiries/backTo_link", {});
			console.log('start');
			console.log(enquiry, 'enquiry');
			$("." + self.pageDetails.listContainer ).html('');
			$("." + self.pageDetails.listContainer ).html("//closerApp/views/page/partials/enquiries/editEnquiry", {
				myEnquiry   : true,
				enquiry     : enquiry,
				emailMethod : Closer.Controllers.Application.getEmailMethod()

			}, function(){ //Callback run when edit enquiry template is loaded

				//hook up the reassign widget
				if( Closer.Controllers.Page.Login.checkPermission('reassign') ){

					// alert('DEBUG-- num of .reassignEnquiry::' + self.element.find('.reassignEnquiry').length);
					// self.element.find('.reassignEnquiry').closer_reassign({ currentEnquiry:self.currentEnquiry });
					OpenAjax.hub.publish("reassign.load", { element: self.element.find('.reassignEnquiry'), currentEnquiry:self.currentEnquiry } );
				}
				
				//Add the notes edior
				self.enquiryNotesEditor = CKEDITOR.replace('notes', { toolbar: Closer.Controllers.Application.editorToolbar, readOnly:true });

				//Get enquiry states and get email history
				Closer.Models.State.findPermitted( enquiry.state, self.callback('loadEnquiryTransitions') );
				Closer.Models.Email.findAll( { id: enquiry.id }, self.callback("loadEmailList") );

				//Set all links in the enquiry to open externally
				self.element.find('.enquiryText').find('a').attr('target', '_blank');
			});
		});

		$(this.element).find("h1").text("Enquiry View");
		$(window).scrollTop(0);
	},

	/**
	 * gets and writes progress select box i.e. New | In Progress | Waiting for response
	 * @param  {array} transitions array of transition objects
	 * @return {null}
	 */
	loadEnquiryTransitions: function( transitions ) {

		var self = this,
			newTransitions=[];

		// var currentState = (this.currentEnquiry.getState().id == 100) ? null : this.currentEnquiry.getState();
		var currentState = this.currentEnquiry.getState(),
			$iconContainer = this.element.find('.customerProgressIcon span');

		$iconContainer.removeClass('NewIcon InProgressIcon WaitingForResponseIcon');
		$iconContainer.addClass(currentState.name.replace(/\s/g, '')+'Icon');

		// filter the transions
		$.each(transitions, function(k,v){

			if( this.name != "Closed" && this.name != "Reassigned" && this.name != "New" ){
				newTransitions.push(this);
			}
		});

		$(this.element).find(".enquiryProgress").html("");
		$(this.element).find(".enquiryProgress").append($.View('//closerApp/views/page/partials/enquiries/permittedTransitions', { transitions: newTransitions, current: new Closer.Models.State(currentState) } ));
	},

	/**
	 * Write previous emails display in enquiry 'view' screen	
	 * @param  {array} emails array of email model objects
	 * @return {null}
	 */
	loadEmailList: function ( emails ) {
		$(this.element).find(".previousEmails").append($.View('//closerApp/views/page/partials/enquiries/listEmail', { data: emails })); 
	},

	/**
	 * Handles changes to the progress select menu in enquiry view
	 * @param  {object} el jQuery element object
	 * @param  {object} ev jQuery event object
	 * @return {null}
	 */
	".enquiryProgress change": function( el, ev ) {
		this.currentEnquiry.state = $(el).find(":selected").models()[0];
		Closer.Models.State.findPermitted( this.currentEnquiry.getState(), this.callback('loadEnquiryTransitions') );
		this.currentEnquiry.update();
	},

	/**
	 * Handles back buttons on enquiry view pages
	 * @param  {object} el jQuery element object
	 * @param  {object} ev jQuery event object
	 * @return {null}
	 */
	".backToLink click": function( el, ev ) {
		ev.preventDefault();
		OpenAjax.hub.publish('tab.load', { tab:'enquiries' });
	},

	/* End Enquiry Edit Functions */ 


	/* Start Enquiry Email Functions */

	/**
	 * This function will check to see if the users domain has access to CMail and
	 * will choose a method based on result
	 * @param  {object} enquiry enquiry model object
	 * @param  {object} el      jQuery element object
	 * @param  {object} ev      jQuery event object
	 * @return {null}
	 */
	emailClient: function( enquiry, el, ev ){
		var emailMethod = Closer.Controllers.Application.getEmailMethod(),
			me = Closer.Controllers.Application.getMe();

		// Open standard Cmail application
		if( emailMethod == "cmail" ) {
			OpenAjax.hub.publish('modal.display',{
				content             : $.View('//closerApp/views/page/partials/enquiries/cmail/cmail', 
					{ 
						enquiry :enquiry, 
						user    : me
					}),
				callbackEvent       : 'enquiry.sendEmail',
				modalLoadedEvent    : 'emailModal.loaded',
				modalDestroyedEvent : 'emailModal.destroyed'
			});

			ev.preventDefault();
		}
	},

	/**
	 * Handles email buttons in single enquiry view screen
	 * @param  {object} el Element object passed with event
	 * @param  {object} ev Event object
	 * @return {null} 
	 */
	".emailButton click": function( el, ev ) {
		ev.preventDefault();

		if ( Closer.Controllers.Application.checkMailAddress() ) {
			this.emailClient( this.currentEnquiry, el, ev );
		};
	},

	/**
	 * Handles email buttons in enquiry list view
	 * @param  {object} el Element object passed with event
	 * @param  {object} ev event object
	 * @return {null} 
	 */
	"a.email click": function( el, ev ) {
		ev.preventDefault();

		if ( Closer.Controllers.Application.checkMailAddress() ) {
			var enquiry = this.currentEnquiry;

			if( el.closest('.manageEnquiry').length > 0 ) {
				enquiry = el.closest('.manageEnquiry').model();
			}

			// var enquiry = this.currentEnquiry || el.closest('.manageEnquiry').model();
			this.emailClient( enquiry, el, ev );
		};
		return;
	},

	/**
	 * Handles the sending of the enquiry data
	 * @param  {object} event information about the event
	 * @param  {object} data  data passed with published event
	 * @return {null}
	 */
	"enquiry.sendEmail subscribe": function( event, data ) {

		this.emailSendPending = {
			status :true,
			data   :data
		};

		if( $.type(this.emailSpellingChecked) === 'null' ) {

			// $('.cke_button_aspell').trigger('click');
			this.editor.openDialog('aspell');
			// CKEDITOR.tools.callFunction(6);
			// Returning out early as spelling needs to be checked
			return false;
		}

		var email     = {},
			emailData = {},
			el        = data.element,
			self      = this;


		el.attr('disabled', true)
			.append('//closerApp/views/components/loading.ejs', {className:'sendEmailLoading'});

		// Process form data into object data
		$.each(data.data, function(key, value) {
			var dataClean = true;
			if( $.type(value.value) === "string" && value.value.length < 1 ) {
				dataClean=false;
			}

			if( dataClean ) {
				// console.log('added to emaildata');
				emailData[value.name] = value.value;
			}
		});

		// Assign the from address of the currently logged in user
		var me = Closer.Controllers.Application.getMe();

		// NOTE: For testing change email address in closer consultant setup page

		// Get the main form data and create the basic object structure for the email to send
		email.fromAddress  = me.getEmail();
		email.message      = this.editor.getData();
		email.toAddress    = emailData.toInput;
		email.ccAddresses  = [];
		email.bccAddresses = [];
		email.subject      = emailData.subjectInput;
		email.attachments  = [];

		// Loop through the emaildata and find any attachments
		$.each( emailData, function( key, value ) {

			if (  key.indexOf("attachment") != -1 ) { // Found an attachment, push it into the array
				var name = key.slice( key.indexOf("[") + 1, key.lastIndexOf("]") ); // Extract the file name that is passed through as part of the name attr on the input field

				email.attachments.push({ filename: name, attachmentFileHandle: value });
			}
		});

		// Split the cc amd bcc addresses into an array
		var bccAd = [],
			ccAd  = [];

		if ( $.type(emailData.bccInput) !== "undefined" && 
			emailData.bccInput.length > 0 ) { bccAd = emailData.bccInput.split(","); }
		if ( $.type(emailData.ccInput) !== "undefined" && 
			emailData.ccInput.length > 0 ) { ccAd = emailData.ccInput.split(","); }

		if ( ccAd.length != 0 ) { email.ccAddresses = ccAd; }
		if ( bccAd.length != 0 ) { email.bccAddresses = bccAd };
		
		// CC'ing the user address
		email.bccAddresses.push(email.fromAddress);

		// For future development, this will be the email template feature
		//email.message = Closer.Controllers.Application.buildMessage(email.message);

		// Send the Enquiry
		Closer.Models.Enquiry.sendEmail( { id: emailData.enquiryId }, email, 
			function() {

				this.emailSendPending = {
					status :false,
					data   :null
				};

				OpenAjax.hub.publish("email.sent"); 
			},
			function( sendEmailResponse, type ) { 


				// jsonize the response text
				var sendEmailResponseJSON = $.parseJSON( sendEmailResponse.responseText );
				


				try {
					var errorReported=false;

					//Cycle through error types outputting messages
					$.each(sendEmailResponseJSON.errorMessages, function( k1, serverError ){

						$.each(Closer.Controllers.Application.settings.cmail.errorTypes, function(k2, closerError){
							if( serverError.indexOf( closerError.type ) > -1 ) {

								errorReported=true;
						
								OpenAjax.hub.publish('Closer.Message', {
									type    :'error',
									message :closerError.message
								});
							}
						});
					});

					if( !errorReported ) {
						throw "unknown";
					}
				}

				catch(e) {
					OpenAjax.hub.publish('Closer.Message', {
						message :'An unknown error occured when sending your email. If the issue persists please contact the system administrator',
						type    :'error',
						sticky  :true
					});
				}

				self.cancelEmailPending();
			}
		);

		
	},

	cancelEmailPending:function(){
		this.emailSendPending.data.element.attr('disabled', false).find('.sendEmailLoading').remove();


		this.emailSendPending = {
			status :false,
			data   :null
		}
		// .remove('//closerApp/views/components/loading.ejs', {className:'sendEmailLoading'});
	},

	/**
	 * Listens for the spellcheck finishing.  If there is a pending email to be sent 
	 * then the sendEmail published event is called again
	 * @param  {string} called name of published event
	 * @param  {object} data   data passed with published event
	 * @return {null}
	 */
	"Closer.Spellcheck subscribe":function( called, data ){
		if( this.emailSendPending.status === true && 
			this.emailSendPending.data !== null &&
			$.type(data.state) !== 'undefined' &&
			data.state === 'finished' ) {

			// Flag the spellchecker as called
			this.emailSpellingChecked=1;

			// restart the send functionality
			OpenAjax.hub.publish('enquiry.sendEmail', this.emailSendPending.data);
		}
	},

	"email.sent subscribe": function( event, data ) { 
		
		// $(".cmailBox").html('<h1 style="text-align:center;">Email Sent</h1>');

		// setTimeout( function() { OpenAjax.hub.publish("modal.destroy"); }, 2000 );
		// 
		OpenAjax.hub.publish('modal.destroy');
		OpenAjax.hub.publish('Closer.Message', {
			type    :'notice',
			message :'Email sent successfully'
		});
	},

	// Wait for window to load then setup Rich Text Area

	"emailModal.loaded subscribe": function( event, data ) {
		this.editor = CKEDITOR.replace( 'cmailMessage', { toolbar: Closer.Controllers.Application.editorToolbar });
	},
	
	/* End Enquiry Email Functions */

	/* Start Enquiry Close Functions */

	".editEnquiryFinish click": function( el, ev ) {
		OpenAjax.hub.publish('modal.display',{
	 		content: $.View('//closerApp/views/page/partials/enquiries/finish_outer', { enquiry: this.currentEnquiry }),
	 		callbackEvent: 'enquiry.finish',
	 		modalLoadedEvent: 'finishModal.loaded'
	 	});
	},

	setActiveRow: function(el){
		this.removeActiveRow();
		$(el).addClass('activeRow');
	},

	removeActiveRow:function(){
		this.element.find('.activeRow').removeClass('activeRow');
	},

	".listEnquiryFinish click": function( el, ev ) {

		var self =this;

		this.setActiveRow( el.closest('.dataItem') );
		this.currentEnquiry = el.closest('.manageEnquiry').models()[0];

		// Get the 
		// Closer.Models.Resolutions.findAll({}, this.callback('setResolutions'));

		OpenAjax.hub.publish('modal.display',{
	 		content: $.View('//closerApp/views/page/partials/enquiries/finish_outer', { enquiry: self.currentEnquiry  }),
	 		callbackEvent: 'enquiry.finish',
	 		modalLoadedEvent: 'finishModal.loaded'
	 	});
	},

	"enquiry.finish subscribe": function( event, data ) {

		// console.log('FINISHING');
		
		var formData = {},
			upsell = false,
			errorsFound=false
			attributes={},
			resolutionID=false;


		// console.debug(data, "RAW DATA");

		
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


		// console.debug( formData, "FORM DATA WHEN CLOSING" );


		if ( formData.outcome == "SALE" ) {
			upsell = formData.upsell || false;
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

			this.currentEnquiry.finish( resolutionID, upsell, user, formData.bookingTTV, attributes, 
				this.callback("enquiryClosedSuccess"), 
				this.callback("enquiryClosedFailure")
			);
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
		
		//refresh the stats and enquiries
		if( this.currentViewState == 'edit' ) {
			OpenAjax.hub.publish('tab.load', { tab: 'enquiries' });
		} else {

			Closer.Models.User.findStats({}, this.callback('refreshUserStats'));
			this.refreshEnquiries();
		}

	},

	enquiryClosedFailure: function(){
		// OpenAjax.hub.publish("modal.display", { content: "There was a problem closing this enquiry.  If the issue persists please contact system administration.", callbackEvent:"", modalLoadedEvent:'' });
		OpenAjax.hub.publish('Closer.Message', {
			type:'error',
			message:'There was a problem closing this enquiry.  If the issue persists please contact system administration.'
		});
	},

	"modal.destroy subscribe":function(called, data){

		// A little inefficient and will fire on events that perhaps wont have a .activeRow class
		// Keep an eye on this
		this.removeActiveRow();
		
	},

	/**
	 * Destroy the CKEditor instance and clean up after cmail close
	 * @param  {[type]} attribute [description]
	 * @return {[type]}
	 */
	"emailModal.destroyed subscribe": function(attribute){
		// delete this.currentEnquiry; //## THIS CAUSED ISSUES WITH CLICKING EMAIL TWICE BUT MAY BREAK SOMETHING ELSE BY NOT HAVING IN PLACE
		this.emailSpellingChecked=null;
		this.emailSendPending = {
			status:false,
			data:null
		};
		CKEDITOR.instances.cmailMessage.destroy();
	},

	/**
	 * Quick method to stop sorting links from firing to real urls
	 * @param  {Object} el Dom element where event fired
	 * @param  {Object} ev Event object
	 * @return {null}
	 */
	".sorting a click": function(el, ev){
		ev.preventDefault();
	},

	
	/* End Enquiry Close Functions */

	/* Start Paging Functions */


	drawFancyPaging:function( resultsInfo ){
		var settings = Closer.Controllers.Application.settings.paging,
			pageStart = (resultsInfo.pageNumber - 1) * resultsInfo.pageSize +1,
			pageEnd = pageStart - 1 + resultsInfo.pagedDataSize;

		if ( resultsInfo.totalPages > 1 ) {
			if( resultsInfo.totalPages <= settings.maxLinks ) {
				this.drawPaging( resultsInfo );
				return;
			} else {
				this.element.find('.paging').remove();
				var pagingItems = Closer.Controllers.Application.getPaginationLinks({
					resultsInfo:resultsInfo
				});

				// Draaw the paging
				$("." + this.pageDetails.enquiryListContainer).after( "//closerApp/views/page/partials/widgets/paging_fancy", {
					pagingItems: pagingItems,
					pagingData : resultsInfo,
					pageStart  : pageStart,
					pageEnd    : pageEnd 
				});
			}
		}
	},
	
	drawPaging: function( resultsInfo ) {

		this.element.find(".paging").remove();

		var pageStart = (resultsInfo.pageNumber - 1) * resultsInfo.pageSize +1,
			pageEnd = pageStart - 1 + resultsInfo.pagedDataSize;
			
		$("." + this.pageDetails.listContainer).after( $.View("//closerApp/views/page/partials/widgets/paging_normal", { pagingData: resultsInfo, pageStart: pageStart, pageEnd: pageEnd }) );
	},

	"enquiries.pageData.loaded subscribe": function( event, data ) {
		this.drawPaging( data.metaData );

		// Kill any instances of the EnquiryEditor
		if( this.enquiryNotesEditor ){
			this.enquiryNotesEditor.destroy();
		}
	},

	"enquiries.destroyed subscribe":function(){
		if( this.enquiryNotesEditor ){
			this.enquiryNotesEditor.destroy();
		}
	},

	".paging .pageLink click": function( el, ev ) {
		ev.preventDefault();
		this.refreshEnquiries( el.attr("rel") );
	},

	/* End Paging Functions */

	finished:function() {

	},

	start: function() {
	}






});
