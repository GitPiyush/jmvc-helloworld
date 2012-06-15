/**
 * @tag controllers, home
 */
$.Controller.extend('Closer.Controllers.Page.Login',
/* @Static */
{
	pageDetails: {
		name: "Login",
		alias: "login",
		component: "security",
		filterClass: "",
		listContainer: ""
	},

	setup: function() {
		var self = this;
		
		// Login needs to work with Core.Loaded, everything else can wait for Auth.Success.Ready
	    OpenAjax.hub.subscribe('Core.Loaded', function( ev, data ) {

	    	// alert('how is he');
	    	$('#loginTab').closer_page_login({ pageDetails: self.pageDetails, isAuth: data.isAuth });
	    });
	},

	checkAuth: function() {
		if ( Closer.Controllers.Application.settings.liveData ) {
			var self = this;
			$.ajax({
				url: Closer.Controllers.Application.settings.dataUrl + '/rest/users/me',
				type: 'get',
				dataType: 'json',
				async: false,
				statusCode: {
					401: function(data, status, xhr) { self.isAuth = false; },
					200: function(data, status, xhr) { 
						self.isAuth = true; 
						//var me = Closer.Models.Users.findMe({ async: false });

						// Closer.Controllers.Application.currentRole = data.role.name;
						// Closer.Controllers.Application.setupApplication();
					}
				},
				error: function(xhr, status, error) { self.isAuth = false; }
			});

			// Publish that we are no longer logged in
			if( !this.isAuth ){
				OpenAjax.hub.publish('Auth.Failure');
			}

			return this.isAuth;
		} else {

			Closer.Controllers.Application.currentRole = 'ADMIN';
			this.isAuth = true;
			return this.isAuth;
		}
	},

	checkPermission: function( item ) {
		//var user = Closer.Models.User.findMe

		if ( Closer.Controllers.Application.settings.permissionList[Closer.Controllers.Application.currentRole][item] == undefined ) {
			// Show error for missing permission set
			//OpenAjax.hub.publish("modal.display" { content:})
		}

		if ( Closer.Controllers.Application.settings.permissionList[Closer.Controllers.Application.currentRole][item] ) {
			return true;
		} else {
			// Possibly show not authorised message?
			return false;
		}
	},

	error: function() {
		OpenAjax.hub.publish('error.display', { message: "Unauthorised - Please contact your development team if you think you have received this message in misstake" });
	}
},
/* @Prototype */
{
	loggedIn:false,

	init: function(el, params) {
		this.pageDetails = params.pageDetails;
		this.setupTooltips();
		// this.setupLogout();
		// 
		
	},


	showLogout:function(){

	},

	error: function( data ) {
	},

	setupTooltips: function(){
		this.element.find('.tooltipTrigger').tooltip({ position:'center right' });
	},



	"loginTab.Focus subscribe": function(event, data) {

		var self = this;

		this.element.html("");
		// this.element.append('//closerApp/views/page/partials/pageHeader', { data: this.pageDetails }, $.fn['null']);
		this.element.append('//closerApp/views/page/login', { data: this.pageDetails }, function() {
			Closer.Models.Domain.findAll({}, self.callback('listDomains'));
			OpenAjax.hub.publish("tab.loaded");



			//clear the tabs until after login
			$('#Nav ul').closer_components_tabs('destroyTabs');

			//setup the tabs
			self.setupTooltips();
		});

	},

	/**
	 * Sorts an array of object
	 * @param  {[type]} arr [description]
	 * @param  {[type]} key [description]
	 * @return {[type]}     [description]
	 */
	sortArrayObjects: function(arr, key) {
		arr.sort(function(a,b){
			var nameA=a[key].toLowerCase(),
				nameB=b[key].toLowerCase();

			if (nameA < nameB) {
				return -1;
			}

			if (nameA > nameB) {
				return 1
			}

			return 0;
		});
	},

	listDomains: function( domains ) {

		var self = this;

		// Sort the domains
		this.sortArrayObjects(domains, 'domain');

		// console.log( domains, "domains in controller" );

		this.element.find("#domainField").html("");
		this.element.find("#domainField").append('//closerApp/views/page/partials/login/domainOptions', {
				data: domains
			},
			function(){
				self.loginHintSetup();
			});
			
	},

	getDefaultDomain:function(){
		// check for cookie
	},


	setDefaultDomain:function(){

	},

	doLogin: function( currentPage ) {
		
		// Get Details
		var data = {
			username : this.element.find("#usernameField").val().toLowerCase(),
			password : this.element.find("#passwordField").val(),
			domain   : this.element.find("#domainField").val()
		};

		// Send off login call
		var self = this;
		$.ajax({
			url: Closer.Controllers.Application.settings.dataUrl + "/rest/login",
			type: 'post',
			data: data,
			dataType:'text json',
			async: false,
			contentType: "application/x-www-form-urlencoded",
			statusCode: {
				278: function(data, status, xhr) { self.isLoggedIn = false; self.loginErrorMessage = data;  },
				200: function(data, status, xhr) {

					switch(data.status) {
						case 200:
							self.isLoggedIn = true;
							break;
						default:
							self.isLoggedIn = false;
							break;
					}
				}
			},
			error: function(xhr, status, error) { alert('error'); self.error(xhr); }
		});


		// If successfull get session id redirect to previous page
		if ( this.isLoggedIn ) {

			// var me = Closer.Models.User.findMe({ async: false });
			// Closer.Controllers.Application.currentRole = me.role.name;


			// TODO: - deprecate this call in favour of Auth.Success called in the @CheckAuth method
			// OpenAjax.hub.publish( 'user.login.ready', {user:me} );

			// Closer.Controllers.Components.Tabs.drawMenu();

			// console.log('OpenAjax.hub.publish("tab.load", { tab: '+currentPage+' });', 'page call');
			// OpenAjax.hub.publish("tab.load", { tab: currentPage });
			// 
			// 
			
			
			// will be caught and should fire SetupApplication 
			this.loggedIn = true;
			OpenAjax.hub.publish('Auth.Success');

			return true;

		} else { // If fail show message and return
			OpenAjax.hub.publish("modal.display", { content: $.View('//closerApp/views/page/partials/login/error'),callbackEvent: "none", modalLoadedEvent: "none" });

			return false;
		}

	},
	/* Start Buttons Events */

	".loginButton click": function(el, ev) {
		this.doLogin("enquiries");
	},

	/**
	 * Listens for Auth.Failure events and logs out the application
	 * @return {[type]} [description]
	 */
	"Auth.Failure subscribe":function(){
		if(this.loggedIn){
			this.logged=false;
			Closer.Controllers.Application.logout();
		}

		return;
	},

	"keydown": function(el, ev) {
		if ( ev.keyCode == 13 ) {
			this.doLogin("enquiries");	
		}
	},

	toggleLoginHint:function( element ){

		var onDomains = ['au.fcl.internal', 'fcl.internal'];
			domain = element.val(),
			toggle = ($.inArray( domain, onDomains ) > -1) ? 'slideDown' : 'slideUp';
		$('.loginHint')[toggle]();
	},

	loginHintSetup:function(){
		this.toggleLoginHint( $('select[name=domainLogin]') );
	},

	"select[name=domainLogin] change":function( element, data ){
		this.toggleLoginHint( element );
	}



	/* End Button Events */
});