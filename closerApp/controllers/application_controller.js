/**
 */

$.Controller('Closer.Controllers.Application',
/* @Static */
{
	app: $('#Outer'),
	settings: null,

	queues: null,
	queueList: null,

	countries: null,
	countryList: null,

	validationRules: null,
	processing: false,
	isAuth: false,
	currentRole: "",
	defaultPage:"enquiries",

	validationStringRequired: " is Required, Please!",
	validationPatterns:{
		email: /^\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}\b$/i
		// email:/(\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,6})/
	},
	
	editorToolbar:[
			{ name: 'editing', items : [ 'SpellCheck' ] },
			{ name: 'basicstyles', items : [ 'Bold','Italic','Underline','Strike','-','RemoveFormat' ] },
			{ name: 'paragraph', items : [ 'NumberedList','BulletedList','-','Outdent','Indent','-','Blockquote','-','JustifyLeft','JustifyCenter','JustifyRight','JustifyBlock','-','BidiLtr','BidiRtl' ] },
			{ name: 'links', items : [ 'Link','Unlink','Anchor' ] },
			{ name: 'styles', items : [ 'Format','Font','FontSize' ] },
			{ name: 'colors', items : [ 'TextColor'] }
	],

	setup:function () {

		var self = this;

		// window.closerCompileAndGo = 'ramalamadingdong';

		// This stops the applicaition being run at compile time
		if ($.type(window.closerCompileAndGo) !== 'undefined') {
			return;
		}

		// Get the settings JSON
		$.ajax({
			url: "/closerApp/data/settings.json",
			dataType: 'json',
			cache: false,
			async: false,
			success: function(data) {
				self.settings = data;
				if ( window.location.hostname.indexOf("stage") !== -1 ) {
					self.settings.dataUrl = self.settings.stageUrl;
				} else if ( window.location.hostname.indexOf("local") !== -1 ) { 
					self.settings.dataUrl = self.settings.devUrl;
				} else {
					self.settings.dataUrl = self.settings.prodUrl;
				}
			},
			error: function(data) {
				// Throw error and kill execution
				OpenAjax.hub.publish('error.display', { message: "Error Loading Setttings json" });
			}
		});

		// Get the validation JSON
		$.ajax({
			url: "/closerApp/data/validation.json",
			dataType: 'json',
			cache: false,
			async: false,
			success: function(data) {
				self.validationRules = data;
			},
			error: function(data) {
				// Throw error and kill execution
				OpenAjax.hub.publish('error.display', { message: "Error loading Validation json" });
			}
		});

		var ajaxSetupObj = { contentType: "application/json" };

		if(this.getBrowserSupport('nonCachedAjaxGET') === false){
			ajaxSetupObj = $.extend(ajaxSetupObj, {cache:false});
		}

		$.ajaxSetup(ajaxSetupObj);

		//{
		//	,
			
		//	//beforeSend: function(xhr, settings) {
		//	//	xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
		//	//},
		//	//xhrFields: { 'withCredentials': true }
		//}


		//if not logged in then run logout


		//if ( Closer.Controllers.Page.Login.checkAuth() ) {
		//	this.setupApplication();
		//}

		//OpenAjax.hub.subscribe('Auth.Success', function(called, data){
		//	self.setupApplication();
		//});
	},
	
	setupApplication:function( params, success, error ){

			var currentPage = params.currentPage || this.defaultPage;

			// Calling updateMe gets the ME model and stores against the application
			var user = this.updateMe();
			this.currentRole = user.getRole();
			
			// set the users domain in a `default` cookie
			$.cookie(Closer.Controllers.Application.settings.cookies.defaultDomain, 
				this.getDomain(),
				{
					path:'/',
					expires:365
				});


			// Call any system notifications that may be set
			this.systemNotifications();

			Closer.Models.User.findAll({country: this.getDomainFeatures('countryCode') }, this.callback("setUsers"), this.callback("error") );
			Closer.Models.Queue.findAuthed({}, this.callback("setQueues"), this.callback("error") );

			//check for an email address
			this.checkMailAddress();

			OpenAjax.hub.publish("Auth.Success.Ready");
			Closer.Controllers.Components.Tabs.drawMenu();
			OpenAjax.hub.publish("tab.load", { tab: currentPage });

			success.call();
	},

	/**
	 * This is currently where all temporary system notifications are stored and called from
	 * @return {null}
	 */
	systemNotifications:function(){

		// Tell UK IE users their browser is not supported! - NOW SUPPORTED
		// if( $.browser.msie && this.getDomain() === 'uk.fcl.internal' ){
		// 	OpenAjax.hub.publish('Closer.Message', {
		// 		type:'error',
		// 		sticky:true,
		// 		message:'This browser is not currently supported. Please use Mozilla FireFox or Google chrome.  Thank you for your understanding.'
		// 	});
		// }
		/* End alert */
		

		// Queue managers alert to start using the au.fcl.domain name from 13/06/2012
		// Months in JS go from 0-11
		// @alert-period 08/06/2012 - 13/06/2012 23:59:59
		var noticeStartDate = new Date(2012,5,8, 0,0,0).getTime(),
			noticeEndDate   = new Date(2012,5,13, 23,59,59).getTime(),
			now             = new Date().getTime();

		if( ( now >= noticeStartDate && now <= noticeEndDate ) &&
			this.currentRole === "QUEUE_MANAGER" && 
			this.getDomain() === "fcl.internal" ) {

			OpenAjax.hub.publish('Closer.Message', {
				type    : 'notice',
				sticky  : 'true',
				message : 'From Wednesday 13 June, Closer queue managers will need to login using the domain <strong>AU.FCL.INTERNAL</strong> please make sure you select this from the dropdown menu on the login page.'
			});
		}
		/* End alert */
	},


	error: function( msg ) {
		var message = msg || "Server Error";
		OpenAjax.hub.publish('modal.display', { content: "tester::"+message, callbackEvent:"null", modalLoadedEvent:"null" });
	},

	applicationMessage: function( params ){

		if( $.inArray(params.type, ["error","success","notice"]) === -1 || $.type(params.message) === "undefined" ) {
			this.error('Application Message Error, please contact system administrator');
			return;
		}

		var sticky = params.sticky || false;

		$.noticeAdd({
			text: params.message,
			stay: sticky,
			type: params.type
		});
	},

	/**
	* [checkMailAddress description]
	* @return {null} 
	*/
	checkMailAddress:function(){

		var email = this.getMe().getEmail() || "";

		if( !email.match(this.validationPatterns.email) ){

			var noEmailTemplate = $.View('//closerApp/views/page/partials/login/noEmail', {});
			OpenAjax.hub.publish("modal.display", { 
				content: noEmailTemplate, 
				callbackEvent: "none", 
				modalLoadedEvent: "none" 
			});

			window.setTimeout(function(){
				OpenAjax.hub.publish('modal.destroy');
				OpenAjax.hub.publish('tab.load', {tab: 'consultantSetup'});

			}, 4000);

			return false;
		}
		else {
			return true;
		}
	},

	logout: function() {

		var self = this;

		$.ajax({
			url: Closer.Controllers.Application.settings.dataUrl + "/rest/logout",
			async: false,
			success: function(data) {

				OpenAjax.hub.publish("tab.load", { tab: "login" });
				OpenAjax.hub.publish("user.logout.ready");

			},
			error: function(data) {
				// console.log(data, "no worky");
			}
		});
	},

	updateMe:function(){
		var me = Closer.Models.User.findMe({ async: false });
		this.setMe(me);
		return this.getMe();
	},

	/**
	* Set the ME object on the top level of the application so it can be retrieved easily without additional calls to the API
	* @param {Object} me Adds the ME model object
	*/
	setMe: function(me){
		this.app.model(me);
	},

	/**
	* Retrieves the me model instance of ME on the application element
	* @return {Object} Returns the User ME model
	*/
	getMe:function(){
		return this.app.model();
	},

	getDomain: function(){
		return this.getMe().getDomain();
	},

	getDomainFeatures: function(){
		var domain = this.getDomain(),
			result;
		if( arguments.length > 0 ){
			result = this.settings.domainFeatures[ domain ][ arguments[0] ];
		}
		else{
			result = this.settings.domainFeatures[ domain ];
		}
		return result;
	},

	/**
	 * Returns the email method based on domain and browser suppo
	 * @return {string} cmail|gmail|outlook
	 */
	getEmailMethod: function(){

		if( this.getBrowserSupport('cmail') ) {
			return this.getDomainFeatures('email');
		} else {
			return this.getDomainFeatures('emailFallback');
		}
	},

	/**
	 * Helper method to return a more usable browser object including name property
	 * and real mozilla version numbers
	 * @return {Object} contains name, version: major/build properties
	 */
	getBrowser:function(){
		var b = $.extend(true, {}, $.browser),
			browser;

		browser = $.extend({}, {
			version : {
				build:b.version,
				major:parseInt(b.version, 10)
			}
		});
		
		delete b.version;

		$.each(b, function(k,v){
		    if( v === true ){ browser.name = k; }
		});

		// translate mozilla useragent as older version do not report publicised version #s.
		var mozilla = {
			"1.8"  : "2",
			"1.9"  : "3",
			"1.9.1": "3.5",
			"1.9.2": "3.6",
			"2"    : "4"
		};

		// Get the real mozilla version - >5 reports correct version
		if( browser.name === "mozilla" && browser.version.major < 5 ) {
			var realVersionNum = mozilla[ browser.version.build.substr(0,5) ] ||
					mozilla[ browser.version.build.substr(0,3) ] ||
					mozilla[ browser.version.build.substr(0,1) ];

			browser.version = $.extend(browser.version, {
				major: parseInt(realVersionNum, 10),
				build: realVersionNum
			});

		} else if( browser.name === 'msie' && browser.version.major === 7 &&
			$.type(window.document.compatMode) !== 'undefined' && 
			$.type(window.document.documentMode) !== 'undefined' ) {
			// Check if this is really IE7 or IE8 in browser compat mode
			if( window.document.documentMode === 8 && window.document.compatMode === 'CSS1Compat' ) {
				var realVersionNum = window.document.documentMode;
				browser.version={
					build:String(realVersionNum),
					major:parseInt(realVersionNum, 10)
				};
				// browser['ver']['build'] = 33;
				// browser['ver']['major'] = 23;

				// browser = $.extend(true, {}, browser, {
				// 	ver:{
				// 		build:13,
				// 		major:44
				// 	}
				// });
			}
		}

		// console.log(browser, "corrected browser string");
		return browser;
	},

	/**
	 * provides a Bool response for the individual feature requested or 
	 * if no feature argument passed returns support object for browser.name
	 * @return {bool} returns browser support bool
	 */
	getBrowserSupport:function( feature ){

		var browser = this.getBrowser();
			feature = ( $.type(feature) === 'string' ) ? feature : false;

		if( !feature ) {
			return this.settings.featureSupport[browser.name];
		} else {
			// Work out if this feature is supported or will need to fallback
			var featureSupport = this.settings.featureSupport[browser.name][feature],
				featureSupportType = $.type(featureSupport);

			if( featureSupportType === 'undefined' ) {
				OpenAjax.hub.publish('Closer.Message', {
					type: 'error',
					message: 'System error - support not defined for `' + feature + '`'
				});
			}

			else if( featureSupportType === 'boolean' ){
				return featureSupport;
			}
			
			// need to check the browser version against the supported version
			else if( featureSupportType === 'number' ){
				// console.log(browser.ver.build, "browser build");
				// console.log(featureSupport, "feature support num");
				// 
				// return true;
				var browserBuild = browser.version.build.substr(0,3) || browser.version.build.substr(0,1);
				return browserBuild >= featureSupport;
			}

			else {
				return false;
			}
		}
	},

	setUsers: function(users) {

		// console.log(users, "USERS");
		this.userData = users;
		var newUserList = [];

		$.each(users, function(key, value) {
			// console.log(value, 'User');
			newUserList.push({label:value.name+' (' + value.principalName + ')', value:key }); 
		});

		this.userList = newUserList;
	},

	setQueues: function(queues) {
		this.queueData = queues;
		var newQueueList = [];

		$.each(queues, function(key, value) {
			newQueueList.push({label:value.name, value:key });
		});

		this.queueList = newQueueList;
	},


	buildMessage: function( message, brand ) {
		var messageTemplate = null,
		varmessageTemplateName = null;

		brand = brand || "none";

		if ( this.settings.templates[brand] === undefined ) {
			messageTemplateName = this.settings.templates["default"];
		} else {
			messageTemplateName = this.settings.templates[brand];
		}

		return $.View( '//closerApp/views/page/emailTemplates/' + messageTemplateName, { message: message });
	},


	// START HELPER METHODS

	validateFields: function( fields ) {

		var self = this,
			validationErrors = {},
			validationErrorsPresent = false,
			rules = self.validationRules[0];

		// Loop through fields and match to validation rules
		$.each(fields, function(key, value) {

			
			//validationErrors[key] = new Array();

			//var emailVal = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+(?:[A-Z][a-z]{2}|[A-Z][a-z]{3}|cls||co|nz|au|ae|com|org|net|edu|gov|mil|biz|info|mobi|name|aero|asia|jobs|museum)\b/;
			var emailVal = self.validationPatterns.email,
				looseEmailVal = /^[a-z0-9_@\.]+$/i,
				timeVal = /^(([0-1]?[0-9])|([2][0-3])):([0-5]?[0-9])(:([0-5]?[0-9]))?$/,
				numeric = /\d+/,
				dateVal = /[0-9]{1}-[JAN]|[FEB]|[MAR]|[APR]|[MAY]|[JUN]|[JUL]|[AUG]|[SEP]|[OCT]|[NOV]|[DEC]|[jan]|[feb]|[mar]|[apr]|[may]|[jun]|[jul]|[aug]|[sep]|[oct]|[nov]|[dec]-[0-9]{3}/,
				textVal = /^[\w\d\s\.&,'"`\(\)\$-]+$/i; //JSHINT complains - unescaped dash here

			if ( rules[key] === undefined ) { return; }
			if ( key === "propertyId" ) { return; }

			if ( rules[key].linkedField !== "none" ) {
				if ( rules[key].type === "postcode" ) {
					var linkedRule = rules[key].linkedField,
						linkedRuleFullName = rules[linkedRule].fullName;
					switch( rules[key].linkType ) {
						case "less":
							if ( parseInt(value,10) > parseInt(fields[linkedRule],10) ) {
								validationErrors[key] = rules[key].fullName + " needs to be less than " + linkedRuleFullName;
								validationErrorsPresent = true;
							}
							break;
						case "more":
							if ( parseInt(value,10) < parseInt(fields[linkedRule],10) ) {
								validationErrors[key] = rules[key].fullName + " needs to be less than " + linkedRuleFullName;
								validationErrorsPresent = true;
							}
							break;
						}
				} else if ( rules[key].type === "date" ) {
					switch( rules[key].linkType ) {
						case "less":
							
							break;
						case "more":
							
							break;
					}
				}
			}

			switch (rules[key].type) {
				case "text":
					// console.debug(value.match(textVal),'Validationg as text');
					if ( $.type(value.match(textVal)) === "null" && value !== "" ) {
						validationErrors[key] = rules[key].fullName + " can only be plain text";
						validationErrorsPresent = true;
					}
					break;
				case "email":

					if ( $.type(value.match(emailVal)) === "null" && value !== "" ) {
						validationErrors[key] = rules[key].fullName + " needs to be in the format joe@joe.com";
						validationErrorsPresent = true;
					}
					break;
				case "looseemail":
					if ( $.type(value.match(looseEmailVal)) === "null" && value !== "" ) {
						validationErrors[key] = rules[key].fullName + " Should contain only valid email characters";
						validationErrorsPresent = true;
					}
					break;
				case "number":
					if ( $.type(value.match(/^\d+$/)) === "null" && value !== "" ) {
						validationErrors[key] = rules[key].fullName + " can only be digits";
						validationErrorsPresent = true;
					}
					break;
				case "postcode":
					if ( $.type(value.match(/^\d+$/)) === "null" && value !== "" ) {
						validationErrors[key] = rules[key].fullName + " needs to be in the format xxxx";
						validationErrorsPresent = true;
					}
					break;
				case "date":
					if ( $.type(value.match(dateVal)) === "null" && value !== "" ) {
						validationErrors[key] = rules[key].fullName + " needs to be in the format dd-MMM-yyyy";
						validationErrorsPresent = true;
					}
					break;
				case "time":
					if ( $.type(value.match(timeVal)) === "null" && value !== "" ) {
						validationErrors[key] = rules[key].fullName + " must be in 24 format. eg/ 09:00";
						validationErrorsPresent = true;
					}
					break;
				case "timeZone":
					if ( $("#timezoneId").val() === "" ) {
						validationErrors[key] = "Please Select a Timezone";
						validationErrorsPresent = true;
					}
					break;
				case "parameterValue":
					if ( fields.operator === "WITHIN" ) {
						if ( $.type(value.match(/^\d+$/)) === "null" && value !== "" ) {
							validationErrors[key] = rules[key].fullName + " can only be digits";
							validationErrorsPresent = true;
						}
					} else {
						if ( $.type(value.match(dateVal)) === "null" && value !== "" ) {
							validationErrors[key] = rules[key].fullName + " needs to be in the format dd-MMM-yyyy";
							validationErrorsPresent = true;
						}
					}
					break;
				case "price":
					if ( $.type(value.match(/^\d+$/)) === "null" && value !== "" ) {
						validationErrors[key] = "Price can only be digits";
						validationErrorsPresent = true;
					}
					break;
			}

			if ( rules[key].required && value === "" ) {
				if ( key === "parameterValue" ) {
					if ( fields.operator === "WITHIN" ) {
						validationErrors[key] = rules[key].days.fullName + self.validationStringRequired;
						validationErrorsPresent = true;

					} else {
						validationErrors[key] = rules[key].date.fullName + self.validationStringRequired;
						validationErrorsPresent = true;
					}
				} else {
					validationErrors[key] = rules[key].fullName + self.validationStringRequired;
					validationErrorsPresent = true;
				}
			}
		});

		// If errors populate return data and send to validation display dialog or show tabs.
		if ( validationErrorsPresent ) {
			// window.validationErrors = 

			if ( $.type(fields.propertyId) !== "undefined" ) {
				var validationErrorsList = {};
				$.each(validationErrors, function(key, value) {
					validationErrorsList[key + fields.propertyId] = value;
				});
				OpenAjax.hub.publish("elementNotice.display", { info: validationErrorsList });
				return true;
			}
			OpenAjax.hub.publish("elementNotice.display", { info: validationErrors });
			return false;
		} else { 
			return true;
		}
	},

	setupAutocomplete: function( element, data, list, storage, callbackEvent, maxItems ) {
		maxItems = maxItems || 15;
		$(element).autocomplete({
			source: function(request, response){
				var results = $.ui.autocomplete.filter(list, request.term);
				response(results.slice(0, maxItems));
			}, 
			minLength: 2, 
			autofocus: true, 
			select: function(ev, el) {  
				ev.preventDefault();
				storage.data("model", data[el.item.value]);
			}, 
			focus: function(ev, el) {
				ev.preventDefault();

				// Clear off any bracketed content
				var label = el.item.label.replace( /\s\(.+\)$/, "" );
				$(ev.target).val(label);
			}
		});
	},

	base64Encode: function( data ) {
		//if error use this data: "arg=" + encodeURIComponent(arg) 
		var base64Data = $.base64.encode(data);

		return data;
	},

	addAutoclear: function( $stack ){

		//$stack.each(function(i, item){
		//	console.debug(item, 'ramalamadingdong');
		//});
	},

	getPaginationLinks:function( params ){


		var settings = this.settings.paging,
			pageStart = (params.resultsInfo.pageNumber - 1) * params.resultsInfo.pageSize +1,
			pageEnd = pageStart - 1 + params.resultsInfo.pagedDataSize;

		// Calculate range
		var pagingItems=[];

		// first page button
		if( params.resultsInfo.pageNumber > 1 ) {
			pagingItems.push({ text: settings.firstText, rel:1 });
		}

		// prev button
		if ( params.resultsInfo.pageNumber > 1 ) {
			pagingItems.push({ text: settings.prevText, rel:params.resultsInfo.pageNumber-1 });
		}

		// calculate range logic
		var numPages = params.resultsInfo.totalPages,
			numPagesCounter = numPages,
			pages=[];
		while(numPagesCounter) {
			pages.push(numPagesCounter);
			numPagesCounter--;
		}
		pages.reverse();

		if( params.resultsInfo.pageNumber < settings.maxLinks ){
			pages = pages.slice(0, settings.maxLinks);
		} else if( params.resultsInfo.pageNumber+settings.maxLinks > numPages ) {
			pages = pages.slice(numPages-settings.maxLinks, numPages);
		} else {
			var half_low = Math.ceil(settings.maxLinks/2),
				half_high = Math.floor(settings.maxLinks/2);
			pages = pages.slice(params.resultsInfo.pageNumber-half_low, params.resultsInfo.pageNumber+half_high);
		}

		$.each(pages, function(k,v){
			pagingItems.push({ text: v, rel: v });
		});

		// next button
		if( params.resultsInfo.pageNumber < params.resultsInfo.totalPages ) {
			pagingItems.push({ text: settings.nextText, rel: params.resultsInfo.pageNumber+1  });
		}

		// last button
		if( params.resultsInfo.pageNumber < params.resultsInfo.totalPages ) {
		// if( params.resultsInfo.pageNumber < (( params.resultsInfo.totalPages - settings.maxLinks )+1)) {
			pagingItems.push({ text: settings.lastText, rel:numPages });
		}

		return pagingItems;
	}

	
	
},
/* @Prototype */
{

	init: function(element, pageName) {

		var isAuth = Closer.Controllers.Page.Login.checkAuth();
		OpenAjax.hub.publish("Core.Loaded", {isAuth: isAuth});

		// console.debug(isAuth, "AUTHERD???");
		if ( isAuth ) { // Authed, Proceed!
			this.Class.setupApplication({}, this.callback('setupUserInformation'), this.callback('error'));
		} else {
			// this.logout();
			this.showLogin();
		}

		//else { // Not authed! oh no! redirect to login page!
		// }
	},

	logout:function(){
		this.Class.logout();
	},

	showLogin:function(){

		console.log('@showLogin');
		OpenAjax.hub.publish("tab.load", { tab: "login" });
		OpenAjax.hub.publish("user.logout.ready");
	},

	/**
	* Handle application loading after login!
	* @return {null}
	*/
	"Auth.Success subscribe":function(){
		this.Class.setupApplication({}, this.callback('setupUserInformation'));
	},



	/**
	* Handles application logged in actions
	* @return {null}
	*/
	//"Auth.Success subscribe":function(){

	//OpenAjax.hub.publish("tab.load", { tab: "enquiries", ignore:true });

	//},

	// TODO: - this should simply call the logout method, perhaps should be defined in login controller
	"Auth.Failure subscribe":function(){
		// alert('rubbishED');

		// this.togglePrivateInfo(false);
		// OpenAjax.hub.publish("tab.load", { tab: "login", ignore:true });
		// this.Class.logout();
	},

	setupUserInformation: function(){
		this.setUserData();
		this.togglePrivateInfo(true);
	},

	togglePrivateInfo: function( isAuth ){
		// window.myeleme = this.element;
		if( isAuth ){
			this.element.find('#logoutLink').fadeIn();
			this.element.find('#userInfo').fadeIn();

		} else {
			// console.log(this.element.find('#logoutLink'), 'fade this out');
			this.element.find('#logoutLink').fadeOut();
			this.element.find('#userInfo').fadeOut();

		}
	},

	"#logoutLink click": function( el, ev ) {
		ev.preventDefault();
		Closer.Controllers.Application.logout();
	},

	/**
	* Called to make page full screen height
	* @return {[type]}
	*/
	pageAdjustHeight: function(){

		var windowY = $(window).height(),
			bodyY = $('#Body .body').height(),
			headerY = $('#Header').height(),
			YOffset = 50;

		if( (bodyY+headerY+YOffset) < windowY ){
			$('#Body .body').height( windowY - headerY - YOffset );
		}
	},

	"tab.loaded subscribe": function(called, data){
		//this.pageAdjustHeight();
	},

	/**
	* Retrieves the me model instance of ME on the application element
	* @return {[type]} [description]
	*/
	getMe:function(){ return this.Class.getMe(); },
	updateMe:function(){ return this.Class.updateMe(); },

	"user.logout.ready subscribe": function(called, data){
		this.togglePrivateInfo(false);
	},

	setUserData: function(){

		var me = this.getMe();

		$('#userInfo').html('');
		$('#userInfo').html('//closerApp/views/components/userInfo', {user: me});
	},

	"Closer.Message subscribe":function (called, data) {
		this.Class.applicationMessage( data );
	},

	error: function(err){
		this.Class.error(err);
	}


});
