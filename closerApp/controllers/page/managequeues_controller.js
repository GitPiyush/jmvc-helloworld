/**
 * @tag controllers, home
 */
$.Controller.extend('Closer.Controllers.Page.Managequeues',
/* @Static */
{
	/**
	 * Initial vars
	 * @type {Object}
	 */
	pageDetails: {
		name: "Manage Queues",
		alias: "manageQueues",
		component: "Queues",
		filterClass: ".queue",
		listContainer: "manageQueueListing",
		enquiryListContainer: "enquiriesList"
	},

	/**
	 * Bootstrap creates instance of controller on a DOM element
	 * @return {[type]}
	 */
	setup: function() {
		var self = this;
		
	    OpenAjax.hub.subscribe('Auth.Success.Ready', function() {
	    	$('#manageQueuesTab').closer_page_managequeues({ pageDetails: self.pageDetails });
	    });
	},

	/**
	 * Sets up the autocomplete on the passed object using the queue data
	 * @param  {[type]} element [description]
	 * @param  {[type]} storage [description]
	 * @return {[type]}
	 */
	assignQueueAutocomplete: function( element, storage ) {
		
		Closer.Controllers.Application.setupAutocomplete( element, Closer.Controllers.Application.queueData, Closer.Controllers.Application.queueList, storage, null );
	}
},
/* @Prototype */
{

	currentQueue:null,
	currentQueueStats:null,
	pageDetails:null,

	init: function(el, params) {	
		this.pageDetails = params.pageDetails;
	},

	"manageQueuesTab.Focus subscribe": function(event, data) {
		this.listQueues();
	},

	"manageQueues.refresh subscribe": function(event, data) {
		OpenAjax.hub.publish("data.loading");
		this.refreshQueues();
	},

	refreshQueues: function( refreshButtonEl ) {

		var refreshButtonEl = refreshButtonEl || false;
		if( refreshButtonEl !== false ) {
			console.log(refreshButtonEl);
			refreshButtonEl.attr('disabled', false).find('.refreshADLoading').remove();
		}

		OpenAjax.hub.publish("list.loading", { element: $("." + this.pageDetails.listContainer) });
		Closer.Models.Queue.findAuthed({}, this.callback('refreshQueueList'));	
	},

	listQueues: function (  ) {
		var self = this;

		if( $.type(this.currentPage) !== 'undefined' ) {
			delete this.currentPage;
		}

		this.element.html("");
		this.element.append('//closerApp/views/page/partials/pageHeader', { data: this.pageDetails });
		this.element.append('//closerApp/views/page/manageQueues_main', { data: this.pageDetails }, function() {
			self.refreshQueues();

			var filterDetails = {
				type: "list",
				container: self.element.find("." + self.pageDetails.listContainer),
				itemElement: self.pageDetails.filterClass,
				itemSubElement: ".dataCol"
			}

			OpenAjax.hub.publish("sorting.load", { element: self.element.find(".sorting") , callback: self.pageDetails.alias } );
			OpenAjax.hub.publish("filter.load", { after:$(self.element).find("h1:first"), pageDetails:self.pageDetails, filterDetails: filterDetails }, function(){
				// self.element.find('.autoclear').autoclear();
			});
		});	
	},

	refreshQueueList: function ( queues ) {

		var self = this,
		sort = this.element.find(".sorting").controllers()[0].currentSort;
		
		if ( sort.length != 0 ) {
			queues = Closer.Controllers.Sorting.sortItems( queues, sort );
		}

		OpenAjax.hub.publish("list.loaded", { element: $("." + this.pageDetails.listContainer) });

		this.element.children("." + this.pageDetails.listContainer).html("");
		this.element.children("." + this.pageDetails.listContainer).append('//closerApp/views/page/partials/manageQueues/listingQueue', { data: queues }, function() { 
			OpenAjax.hub.publish("data.loaded"); 

			if( !self.element.find('.textFilter').first().hasClass('autoclearActive') ){
				// Trigger the filter
				self.element.find('.applyTextFilter').trigger('click');
			}

		});
	},

	refreshEnquiryList: function( page ) {

		OpenAjax.hub.publish("list.loading", { element: $("." + this.pageDetails.enquiryListContainer) });

		if ( this.currentPage === undefined ) {
			this.currentPage = page || 1;
		} else if ( page !== undefined ) {
			this.currentPage = page;
		}

		Closer.Models.Enquiry.findQueued({
			queue: this.currentQueue.id, 
			pageNum: this.currentPage 
		}, this.callback('drawEnquiryList'));
	},

	drawEnquiryList: function ( enquiries ) {

		var self = this;

		OpenAjax.hub.publish("list.loaded", { element: $("." + this.pageDetails.enquiryListContainer) });

		this.element.find(".enquiriesList tbody").html("");

		if ( enquiries.length == 0 ) {
			this.element.find(".enquiriesList tbody").append('<tr><td colspan="4"><h2 style="text-align:center;">No Enquirires Found</h2></td></tr>');
			OpenAjax.hub.publish("data.loaded");
		} else {
			this.element.find(".enquiriesList tbody").append('//closerApp/views/page/partials/manageQueues/listingEnquiry', { 
					data: enquiries 
				}, function() {
					self.element.find('.enquiriesList tbody tr:even').addClass('even');
					OpenAjax.hub.publish("data.loaded"); 
				}
			);
		}
	},

	".refreshCloserQueues click": function( el, ev ) {
		ev.preventDefault();
		el.attr('disabled', true)
			.append('//closerApp/views/components/loading.ejs', {className:'refreshADLoading'});
		Closer.Models.Queue.refreshAD( {}, this.callback("refreshQueues", el) );
		// this.refreshQueues();
	},

	".queue .buttons .edit click": function(el, ev) {
		ev.preventDefault();

		this.editQueue( el.parent().parent().models()[0] );

	},

	".queue dblclick": function(el, ev) {
		ev.preventDefault();
		this.editQueue( el.models()[0] );
	},

	editQueue: function ( queue ) {
		var self = this;

		var historyObj = $.extend({}, {
			historyType:'queue.edit',
			id:queue.getID(),
			ignore:queue.ignore || false,
			// gimpEmailId:enquiry.gimpEmailId,
			title:'Closer - Queue edit'
		});

		// Publish the history state
		OpenAjax.hub.publish('Closer.History.Add', historyObj);

		this.currentQueue = queue;

		this.element.html("");
		this.element.prepend('//closerApp/views/page/partials/enquiries/backTo_link', {linkText: 'Back to manage queues'});
		this.element.append('//closerApp/views/page/partials/pageHeader', 
			{ data: 
				{ name: "Edit Queue (" + queue.getName() + ")" } 
			});
		this.element.append('//closerApp/views/page/partials/manageQueues/manageQueues_edit', 
			{ data: queue }, 
			function() {

			self.element.find('input[name=enquiryMoveCount]').mask('9?999999999', {placeholder:' '});

			// Find all Enquiries in this Queue
			self.refreshEnquiryList();
			//self.Class.assignQueueAutocomplete( $("#enquiryMoveQueueList"), self.element.find(".moveButton") );

		});
	},

	".backToLink click":function(el,ev){
		ev.preventDefault();
		// console.log('STOPPED DEFAULT LNK ACTION');
		window.history.go(-1);
	},

	".editButtons .saveButton click": function (el, ev) {
		ev.preventDefault();

		var queueData = el.parent().prev(".editContainer").children("form").serializeArray();
		var newQueueData = {};

		$.each(queueData, function(key, value) {
	 		newQueueData[value.name] = value.value;
	 	});

		if ( Closer.Controllers.Application.validateFields( newQueueData ) ) {
			var model = el.models()[0];

			model.setDesc( newQueueData.description );
			model.setIsActive( newQueueData.active );

			model.save();

		} else {
			
		}
	},

	".highPriorityEnquiry click": function( el, ev ) {
		ev.preventDefault();

		var $enquiryEl = el.closest('.manageEnquiry'),
			enquiry = $enquiryEl.model(),
			newPriority = ( enquiry.priority===1 ) ? 0:1,
			self = this;

		// Set the priority and attach callback
		enquiry.setUnallocatedPriority(newPriority, function(){ 
			OpenAjax.hub.publish('Closer.Message', {
				type:'notice',
				message:'Enquiry priority changed'
			});
			window.setTimeout(function(){ self.refreshEnquiryList.call(self) }, 400);
			
		});


	},

	".removeEnquiry click": function( el, ev ) {
		ev.preventDefault();
		var enquiry = el.parent().parent().models()[0],
		self = this;

		enquiry.terminateEarly( this.enquiryRemoved.call(this), function(){ self.error.call(this, "There was an error removing the enquiry.") } );

	},

	/**
	 * Success callback passed to terminateEarly model method
	 * @return {null}
	 */
	enquiryRemoved: function(){
		var self = this;
		OpenAjax.hub.publish("enquiry.terminated");
		OpenAjax.hub.publish("Closer.Message", {
			type:'notice',
			message: 'Message removed!'
		});
		window.setTimeout(function(){ self.refreshEnquiryList.call(self) }, 400);
	},

	/**
	 * Deprecated functionality
	 * @param  {object} el element passed with event
	 * @param  {object} ev event object passed with event
	 * @return {null}    
	 */
	// ".moveButton click": function( el, ev ) {
	// 	Closer.Models.Enquiry.findQueued({ queue: this.currentQueue.id, pageNum: 0 }, this.callback('moveEnquiries'));
	// },
	// 
	

	".moveButton click": function( el, ev ) {
		ev.preventDefault();
		this.moveBulkEnquiries(el);
	},

	/**
	 * Moves n enquiries from current queue to source queue
	 * @return {[type]} [description]
	 */
	moveBulkEnquiries: function(el){
		//Just an extra bit of safety in case button was pressed before queue enquiries have loaded
		if( $.type(this.currentQueueStats) === 'null' ) {
			OpenAjax.hub.publish('Closer.Message', {
				type:'notice',
				message:'Please wait for queue to update before trying to move enquiries'
			});

			return false;
		}

		//Show loading graphic and disable button until done
		el.append('//closerApp/views/components/loading.ejs', {className:'bulkMoveEnquiriesLoader'})
			.attr('disabled', true);

		var moveCount  = parseInt(this.element.find("input[name=enquiryMoveCount]").val(),10),
			$destinationQueueSelect = this.element.find("select[name=enquiryMoveQueueList]"),
			destinationQueueId = $destinationQueueSelect.val(),
			destinationQueueName = $destinationQueueSelect.find(':selected').text(),
			sourceQueue = this.currentQueue,
			sourceQueueStats = this.currentQueueStats,
			errorsFound=0,
			errorMessage='',
			self = this;

		// console.log( { queue:sourceQueue, stats:sourceQueueStats } );

		if ( moveCount < 1 ){
			errorsFound=1;
			errorMessage='You must enter the number of enquiries to move';

		} else if( sourceQueueStats.totalDataSize < moveCount ) {
			errorsFound=1;
			errorMessage='You cannot move more than ' + sourceQueueStats.totalDataSize + ' enquiries in this queue';
		}

		if( errorsFound ) {

			OpenAjax.hub.publish('Closer.Message', {
				type:'error',
				message: errorMessage
			});

			return false;

		} else {

			// "destinationQueueId" : 1964020,
			// "sourceQueueId" : 404356,
			// "numberOfEnquiriesToMove" : 1
			OpenAjax.hub.publish('Closer.Message', {
				type:'notice',
				message:'Moving enquiries... This may take a minute.'
			});

			sourceQueue.moveBulkEnquiries({
				destinationQueueId     : destinationQueueId,
				numberOfEnquiriesToMove: moveCount
			},

			//Success callback
			function(){
				el.attr('disabled', false).find('.bulkMoveEnquiriesLoader').remove(); //Remove the loading component
				self.moveEnquiriesSuccess.call(self, moveCount, destinationQueueName);
			},

			//Fail callback
			function(){
				OpenAjax.hub.publish('Closer.Message', {
					type:'error',
					message: 'There was a problem moving your enquiries.  If the problem persists please contact system administrator.'
				});
			});
		}
	},

	
	/**
	 * DEPRECATED but kept for future feature, to select individual enquiries to move
	 * @param  {object} enquiries Enquiries object
	 * @return {bool}           Only if queues are no ready for move
	 */
	moveEnquiries: function( enquiries ) {

		var moveCount  = this.element.find("input[name=enquiryMoveCount]").val(),
			$newQueueSelect = this.element.find("select[name=enquiryMoveQueueList]"),
			newQueueId = $newQueueSelect.val(),
			newQueueName = $newQueueSelect.find(':selected').text(),
			self = this;

			// console.debug({
			// 	moveCount:moveCount,
			// 	newQueueId:newQueueId
			// }, "move Enquiries vars");
			// return;

		if ( enquiries.length == 0 ) {

			OpenAjax.hub.publish('Closer.Message', {
				type:'notice',
				message:'No Enquiries to move'
			});
			
			// OpenAjax.hub.publish("modal.display", { content: "No Enquiries to move", callbackEvent: "none", modalLoadedEvent: "none" });

		} else if ( enquiries.length < moveCount ) {

			OpenAjax.hub.publish('Closer.Message', {
				type:'notice',
				message:'You cannot move more enquiries that are currently in this list.'
			});

			// OpenAjax.hub.publish("modal.display", { content: "You cannot move more enquiries that are currently in this list.", callbackEvent: "none", modalLoadedEvent: "none" });

		} else {

			// OpenAjax.hub.publish("data.loading");
			var newEnquiryList = enquiries.splice(0, moveCount),
				len = newEnquiryList.length;

			for(i=0;i<len;i++){
				var enquiry = newEnquiryList[i];
				enquiry.id = enquiry.gimpEmailId;
					
				if( i < len-1 ){

					enquiry.setNewQueue( newQueueId );
				}
				else{
					
					enquiry.setNewQueue( newQueueId, this.moveEnquiriesSuccess.call(this, moveCount, newQueueName) );
				}
			}
		}

	},

	moveEnquiriesSuccess:function(moveCount, newQueueName) {
		OpenAjax.hub.publish('Closer.Message', {
			type:'success',
			message:'Successfully moved ' + moveCount + ' enquiries to <em>' + newQueueName + '</em> queue'
		});
		this.refreshEnquiryList();
	},



	/**
	 * Allows loading of an enquiry view from outside via a history call
	 * @param  {[type]} eventName  [description]
	 * @param  {[type]} historyObj [description]
	 * @return {[type]}
	 */
	"Closer.History.QueueEdit subscribe":function(eventName, historyObj){
		var currentState = Closer.Controllers.Components.Tabs.getInstance().currentState,
			self = this;
		if( currentState.tab !== "manageQueues" ){
			OpenAjax.hub.publish('tab.load', {
				tab:'manageQueues',
				historyType:'tab.change',
				ignore:true, 
				callback:function(){

					Closer.Models.Queue.findOne( $.extend(historyObj, {ignore:true}), self.callback('editQueue') );
				}
			});
		}
		else{
			Closer.Models.Queue.findOne( $.extend(historyObj, {ignore:true}), this.callback('editQueue') );
		}

	},

	/* Start Paging Functions */
	/**
	 * DEPRECATED in favour of drawFancyPaging, however may be called if total pages are <=5
	 * @param  {[type]} resultsInfo [description]
	 * @return {[type]}             [description]
	 */
	drawPaging: function( resultsInfo ) {


		this.element.find(".paging").remove();

		var pageStart = (resultsInfo.pageNumber - 1) * resultsInfo.pageSize +1,
			pageEnd = pageStart - 1 + resultsInfo.pagedDataSize;

		if ( resultsInfo.totalPages > 1 ) {
			$("." + this.pageDetails.enquiryListContainer).after( "//closerApp/views/page/partials/widgets/paging_normal", {
				pagingData: resultsInfo,
				pageStart : pageStart,
				pageEnd   : pageEnd 
			} );
		}

	},


	drawFancyPaging:function( resultsInfo ) {
		// console.debug(resultsInfo, "resultsInfo");


		var settings = Closer.Controllers.Application.settings.paging,
			pageStart = (resultsInfo.pageNumber - 1) * resultsInfo.pageSize +1,
			pageEnd = pageStart - 1 + resultsInfo.pagedDataSize;

		if ( resultsInfo.totalPages > 1 ) {

			if( resultsInfo.totalPages <= settings.maxLinks ) {
				this.drawPaging( resultsInfo );
				return;
			}

			// Otherwise use fancy pagination
			else {
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

	"manage.pageData.loaded subscribe": function( event, data ) {
		// Set the queue stats accessible to prototype scope
		this.currentQueueStats = data.metaData;
		this.drawFancyPaging( data.metaData );
		// this.drawPaging( data.metaData );
	},

	".paging .pageLink click": function( el, ev ) {
		ev.preventDefault();
		this.currentQueueStats=null;
		this.refreshEnquiryList( el.attr("rel") );
	},

	"enquiry.terminated": function( event, data ) {
		this.refreshEnquiryList();
	},

	error: function( message ){
		OpenAjax.hub.publish('Closer.Message', {
			type:'error',
			message:message + " Please contact the system administrator",
			sticky:true
		});
	}

	/* End Paging Functions */

	
});
