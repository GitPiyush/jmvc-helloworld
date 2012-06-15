/**
 * @tag controllers, home
 */
$.Controller.extend('Closer.Controllers.Page.Queuereport',
/* @Static */
{
	pageDetails: {
		name: "Queue Report",
		alias: "queueReport",
		component: "Queues",
		filterClass: ".queue",
		listContainer: "queueReportListing"
	},

	setup: function() {
		var self = this;
	    OpenAjax.hub.subscribe('Auth.Success.Ready', function() {
	    	$('#queueReportTab').closer_page_queuereport({ pageDetails: self.pageDetails });
	    });
	}
},
/* @Prototype */
{

	init: function(el, params) {
		
		this.pageDetails = params.pageDetails;
	},

	"queueReportTab.Focus subscribe": function(event, data) {
		var self = this;

		this.element.html("");
		this.element.append('//closerApp/views/page/partials/pageHeader', { data: this.pageDetails });
		this.element.append('//closerApp/views/page/queueReport_main', { data: this.pageDetails }, function() {
			Closer.Models.Queue.findAllReport({}, self.callback('refreshQueues'));

			var filterDetails = {
				type: "list",
				container: self.element.find("." + self.pageDetails.listContainer),
				itemElement: self.pageDetails.filterClass,
				itemSubElement: ".dataCol"
			}


			OpenAjax.hub.publish("sorting.load", { element: self.element.find(".sorting") , callback: self.pageDetails.alias } );

			OpenAjax.hub.subscribe('Closer.Filter.Ready', function(){
				self.element.find('.autoclear').autoclear();
			})

			OpenAjax.hub.publish("filter.load", { after:$(self.element).find("h1:first"), pageDetails:self.pageDetails, filterDetails: filterDetails });
		});
	},

	"queueReport.refresh subscribe": function(event, data) {

		OpenAjax.hub.publish("data.loading");

		Closer.Models.Queue.findAllReport({}, this.callback('refreshQueues'));
			
	},

	refreshQueues: function ( queues ) {

		var self = this,
		sort = this.element.find(".sorting").controller().currentSort;

		if ( sort.length != 0 ) {
			queues = Closer.Controllers.Sorting.sortItems( queues, sort );
		}

		this.element.children(".queueReportListing").html("");
		this.element.children(".queueReportListing").append('//closerApp/views/page/partials/listingQueue', { data: queues }, function() { 
			OpenAjax.hub.publish("data.loaded");
			

			if( !self.element.find('.textFilter').first().hasClass('autoclearActive') ){
				// Trigger the filter
				self.element.find('.applyTextFilter').trigger('click');
			}
		});
	}

	
});