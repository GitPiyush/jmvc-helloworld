// create a new Tabs class
$.Controller.extend('Closer.Controllers.Components.History',
{

	historyWidget: $('#history'),

	setup: function() {
		var self = this;
		/**
		 * Actually we should probably only launch this plugin once logged in
		 * @return {[type]}
		 */
		
		// jQuery(document).ready(function($) {
		// 	self.historyWidget.closer_components_history();
			
		// });
		

		OpenAjax.hub.subscribe('Core.Loaded', function(event, data) {
			try {
				// Handles refreshes
				if ( Closer.Controllers.Page.Login.checkAuth() ) { // Authed, Proceed!
					self.historyWidget.closer_components_history();
				}
			} catch(e) {
				alert('history failed');
				// console.log('ERROR: There was an exception trying to restore the data from the page state cache - Exception:', e);
			}
			
		});

		// Handles login events
		OpenAjax.hub.subscribe('Auth.Success.Ready', function(event, data) {
			self.historyWidget.closer_components_history();
		});
	}

},

/* Prototype */
{
	/**
	 *	@attribute {Object} history
	 *	The YUI History object (reference)
	 */
	historyReady:false,
	history: {},
	
	/**
	 *	@attribute {Object} initialState
	 *	The YUI History initial state of the hashTag at startup time
	 */
	initialState: {},
	
	/**
	 *	@attribute {Object} settings
	 *	An object of settings as defined in settings.json and gotten by using Tundra.Models.Settings
	 */
	settings: {},
	
	/**
	 *	@attribute {Object} cache
	 *	This is where all the cache items are held
	 */
	cache: {},
	
	/**
	 *	@attribute {Object} stateCache
	 *	This object will hold all of the values for a given flowExecutionKey so that
	 *	values entered into forms is automatically remembered between all the pages
	 */
	stateCache: {},
	
	/**
	 *	@constructor
	 *	Creates an instance of Tundra.History
	 *
	 *	@return null
	 */
	init : function(el){

		var self = this;

		YUI().use('history', function(Y) {
			// self.initialState = Y.History.parseHash();
			// self.history = new Y.History(self.initialState);

			//Set
			self.history = new Y.History();

			window.customHistory = self.history;

			Y.on('history:change', function(event) {

					self.hashChange(event);
			});

			self.historyReady = true;
			OpenAjax.hub.publish('Closer.History.Ready');
		});
	},


	get: function(){

		return this.history.get();
	},

	/**
	 * Add a new state of replace an existing one in the history object
	 * Firstly sanitizes data first
	 * @param  {[type]} historyObj [description]
	 * @param  {[type]} custom     [description]
	 * @param  {[type]} merge      [description]
	 * @return {[type]}
	 */
	add: function( historyObj, extraOptions, merge, replace ){

		if( !this.historyReady ) {
			OpenAjax.hub.publish('Closer.History.NotReady');
			return false;
		}

		// YUI loads the history lib externally and it is not al
		var ignore = historyObj.ignore || false;
		if( ignore ){
			OpenAjax.hub.publish('History.State.Ignored', historyObj);
			return false;
		}

		// Make sure we have at least a tab to play with
		if( $.type(historyObj) !== 'object' || historyObj.historyType === undefined ){
			OpenAjax.hub.publish('error.display', { message: "Could not add to history states" });
			return false
		}

		//if tab is a jQuery object then clean for use in history

		var merge = merge || true,
			replace = replace || false,
			extraOptions = extraOptions || false,
			settings={};

		if( $.type(extraOptions) === 'object' ) {

			$.extend(settings, extraOptions, {merge:merge});
		}
		else{
			$.extend(settings, {merge:merge});
		}

		// add or replace a state in the history object
		// 
		method = (replace) ? 'replace' : 'add';

		// merge the history object into a defaults object to clear any previously set information
		// var history = $.extend({
		// 	tab:null,
		// 	ignore:null,
		// 	historyType:null
		// }, historyObj);
		this.history['add']( historyObj, settings );
	},


	/**
	 * Gets the state of the page and atte
	 * @return {[type]}
	 */
	restoreState: function(){
		var state = this.get();

		// console.debug(state, 'STATE TO BE RESTORED');

		if( !$.isEmptyObject( state ) ){

			state = $.extend(state, {ignore:true});

			switch( state.historyType ){
				case "tab.change":
					OpenAjax.hub.publish("tab.load", state);
					break;
				case "enquiry.view":
					OpenAjax.hub.publish("Closer.History.EnquiryView", state);
					break;
				case "queue.edit":
					OpenAjax.hub.publish("Closer.History.QueueEdit", state);
					break;
			}
		}
		else
		{
			// console.debug('State ignored - state is empty!');
		}
	},

	/**
	*  The hashChange event handler, which fires the "Closer.History.HashChange" OpenAjax event
	*
	*  @param {Object} event the event as passed by YUI
	*  @return null
	*/
	hashChange: function(event) {
		try {
			OpenAjax.hub.publish('Closer.History.HashChange', event);
		} catch(e) {
			OpenAjax.hub.publish('Application.Error',
			{
				type: 'Exception',
				reason: 'Unable to publish the Closer.History.HashChange event.',
				message: 'The back button has been disabled for this page, please use the navigation options in the page if available.',
				level: 'Warning',
				exception: e
			});
		}
	},

	/**
	 * Will now listen for changes to the history but will ignore "add" 
	 * @param  {[type]} eventName [description]
	 * @param  {[type]} event     [description]
	 * @return {[type]}
	 */
	"Closer.History.HashChange subscribe":function( eventName, event ){

		var ignoredStates = ['add', 'replace'];

		if ( $.inArray(event.src, ignoredStates) > -1 ) {
			return false;
		}

		this.restoreState();
	},


	"tab.load subscribe":function(called, data){


		// Sanitize the data from the loaded tab
		if( data.tab !== undefined ){
			if ( $.type(data.tab) !== "string" ) {
				data.tab = data.tab.data('internalName');
			}

			data.historyType = "tab.change";



			//map this data to the newStates
			data.ignore = data.ignore || false; //add ignore flag if present
			this.add(data);
		}


	},

	"Closer.History.Add subscribe":function(eventName, data){

		this.add( data );
	},

	/**
	 * History is ready after the first tab has loaded so add to history now its ready
	 * This should only ever be called after a page refresh, 
	 * so we only want to add to the history if the history object is currently blank
	 * @param  {[type]} called [description]
	 * @param  {[type]} data   [description]
	 * @return {[type]}
	 */
	"Closer.History.Ready subscribe":function (called,data) {
		if( $.isEmptyObject(this.get()) ){
			this.add(Closer.Controllers.Components.Tabs.getInstance().currentState, {} , false, true);
		}
	}






});