$.Model.extend('Closer.Models.Domain',
/* @Static */
{
	errorHandler: "error",
	basePath: '/rest/domains',

	findAll: function( params, success, error ){
		if ( Closer.Controllers.Application.settings.liveData ) {
			$.ajax({
				url: Closer.Controllers.Application.settings.dataUrl + this.basePath,
				type: 'get',
				dataType: 'json',
				success: this.callback(['wrapMany','getDefaultDomain',success]),
				error: this.callback([this.errorHandler, error])
			});
		} else {
			$.ajax({
				url: '/domains',
				type: 'get',
				dataType: 'json',
				data: params,
				success: this.callback(['wrapMany',success]),
				error: this.callback([this.errorHandler, error]),
				fixture: "//closerApp/fixtures/domains.json.get" //calculates the fixture path from the url and type.
			});
		}
	},

	getDefaultDomain:function(data){

		// Check to see if cookie exists
		var defaultDomain,
			cookie = Closer.Controllers.Application.settings.cookies.defaultDomain;

		// Check to see if the default domain is set
		if( $.cookie( cookie ) !== null ) {
			defaultDomain = $.cookie( cookie );
			console.log('default domain determined by cookie');
		} else {
			// make a best guess for the domain.  
			// Login Controller will be left to create cookie, once user has successfully logged
			var countryCode = window.location.hostname.match(/^.+?\.([a-z]{2,4})\..*$/i) || 
					Closer.Controllers.Application.settings.defaultDomain.AU,
				countryCode = countryCode[1].toUpperCase();

			// get the default domain by country
			defaultDomain = Closer.Controllers.Application.settings.defaultDomain[ countryCode ];
		}

		// console.log(defaultDomain, 'we think this is the default domain');
				
		$.each(data, function(index, val) {

			// console.log(val.domain + ' :: ' + defaultDomain);


			if( val.domain === defaultDomain ) {

				data[index].defaultDomain = true;
			}
		});

		return data;
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

	getDomain: function() { return this.domain; },
	getDefault:function(){ return this.defaultDomain || false },
	getDomainID:function(){ return this.id },
	getDefaultUpnSuffix: function() { return this.defaultUpnSuffix; }

});