/**
 * @tag controllers, home
 * Displays a table of brands.	 Lets the user 
 * ["Gimp2.Controllers.Brand.prototype.form submit" create], 
 * ["Gimp2.Controllers.Brand.prototype.&#46;edit click" edit],
 * or ["Gimp2.Controllers.Brand.prototype.&#46;destroy click" destroy] brands.
 */
$.Controller.extend('Closer.Controllers.Filter',
/* @Static */
{
	type: null,
	container: null,
	itemElement: null,
	itemSubElement: null,

	setup: function() {
		var self = this;
		OpenAjax.hub.subscribe('filter.load', function(event, data) {

			data['after'].after( '//closerApp/views/page/partials/filter_' + data['filterDetails'].type, { pageData: data['pageDetails'], filterData: data['filterDetails'] }, function(){
				OpenAjax.hub.publish('Closer.Filter.Ready');
				$('.filters').find('.autoclear').autoclear();
			})
			data['after'].next(".filters").closer_filter({ filterData: data['filterDetails'] });
		});
	}
},
/* @Prototype */
{
	/**
	* When the page loads, gets all brands to be displayed.
	*/
	init: function(el, params){
		
		this.type = params['filterData'].type;
		this.container = $(params['filterData'].container);
		this.itemElement = params['filterData'].itemElement;
		this.itemSubElement = params['filterData'].itemSubElement;
	},

	/******** Begin Filter Handlers *********/
	".filters .applyTextFilter click": function (el, ev) {
		ev.preventDefault();

		var self = this,
			textFilter = $(this.element).find(".textFilter").val(),
			regEx = new RegExp(textFilter, 'i');

		OpenAjax.hub.publish("data.loading");
		// el.append('//closerApp/views/components/loading.ejs', {className:'filterManageLoader'})
		// 	.attr('disabled', true);


		if ( textFilter == "" ) { this.clearFilter(); }

		//This could do with some optimising, probably a bit inefficient for filtering large grids
		//Perhaps instead attache a filter plugin to each row that will have a filter method
		//we can then run $(this.container + ' .className').filter('term'); and each row will filter async
		$.each($(this.container).find(this.itemElement), function(key, value) {
			var valueFound = false;

			$(value).find(self.itemSubElement).each(function(key, text) {
				if ( regEx.test($(text).text()) ) {
					valueFound = true;
					return false;
				} else {
					valueFound = false;
				}
			});

			if ( valueFound ) {
				$(value).fadeIn();
			} else {
				$(value).fadeOut();
			}
		});

		// el.attr('disabled', false).find('.filterManageLoader').remove();
		OpenAjax.hub.publish('data.loaded');
	},

	".textFilter keypress":function( el, ev ) {
		var code = (ev.keyCode ? ev.keyCode : ev.which);
		if( code===13 ){
			this.element.find('.applyTextFilter').trigger('click');
		}
	},

	".filters .clearTextFilter click": function (el, ev) {
		ev.preventDefault();
		this.clearFilter();
	},

	// ".filters .textFilter focus": function (el, ev) {

	// 	if ( el.val() == "Enter Text" ) {
	// 		el.val("");
	// 	}
	// },

	".filters .filterKeyword keydown": function (el, ev) {
		if ( ev.keyCode == 13) {
			$(this.element).find(".applyTextFilter").click()
		}
	},

	/******** End Filter Handlers *********/

	/* Start Filter Methods */

	clearFilter: function() {

		this.element.find(".textFilter").val("").trigger('blur');
		this.container.find(this.itemElement).show();

	}

	/* End Filter Methods */



});