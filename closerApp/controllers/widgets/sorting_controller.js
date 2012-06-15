/**
 * @tag controllers, home
 * Displays a table of brands.	 Lets the user 
 * ["Gimp2.Controllers.Brand.prototype.form submit" create], 
 * ["Gimp2.Controllers.Brand.prototype.&#46;edit click" edit],
 * or ["Gimp2.Controllers.Brand.prototype.&#46;destroy click" destroy] brands.
 */
$.Controller.extend('Closer.Controllers.Sorting',
/* @Static */
{
	type: null,
	container: null,
	itemElement: null,
	itemSubElement: null,
	callback: null,

	setup: function() {
		var _this = this;
	    OpenAjax.hub.subscribe('sorting.load', function(event, data) {
	    	$(data['element']).closer_sorting({ callback: data['callback'] });

	    	// console.log(data.element, 'Registered as sort');
	    });
	},

	sortItems: function ( items, sort ) {

	 	$.each( sort, function( key, value ) {
	 		
	 		var direction = "";
	 		var property = value.slice( 0, value.indexOf("Sort") );

	 		if ( value.indexOf("Asc") != -1 ) { direction = "Asc"; } else { direction = "Desc"; }
			switch(property) {
				case "name":
					items.sort(function(a, b) {
						if ( a.getName() > b.getName() ) {
							if ( direction == "Asc" ) { return -1; } else { return 1; }
						} else {
							if ( direction == "Asc" ) { return 1; } else { return -1; }
						}
					});
					break;
				case "description":
					items.sort(function(a, b) {
						if ( a.getDesc() > b.getDesc() ) {
							if ( direction == "Asc" ) { return -1; } else { return 1; }
						} else {
							if ( direction == "Asc" ) { return 1; } else { return -1; }
						}
					});
					break;
				case "active":
					items.sort(function(a, b) {
						if ( a.getIsActive() > b.getIsActive() ) {
							if ( direction == "Asc" ) { return -1; } else { return 1; }
						} else {
							if ( direction == "Asc" ) { return 1; } else { return -1; }
						}
					});
					break;
				case "status":
					items.sort(function(a, b) {
						if ( a.getStatus() > b.getStatus() ) {
							if ( direction == "Asc" ) { return -1; } else { return 1; }
						} else {
							if ( direction == "Asc" ) { return 1; } else { return -1; }
						}
					});
					break;
				case "progress":
					items.sort(function(a, b) {
						if ( a.getStatus() > b.getStatus() ) {
							if ( direction == "Asc" ) { return -1; } else { return 1; }
						} else {
							if ( direction == "Asc" ) { return 1; } else { return -1; }
						}
					});
					break;
				case "age":
					items.sort(function(a, b) {
						if ( a.getAge() > b.getAge() ) {
							if ( direction == "Asc" ) { return -1; } else { return 1; }
						} else {
							if ( direction == "Asc" ) { return 1; } else { return -1; }
						}
					});
					break;
				case "queue":
					items.sort(function(a, b) {
						if ( a.getName() > b.getName() ) {
							if ( direction == "Asc" ) { return -1; } else { return 1; }
						} else {
							if ( direction == "Asc" ) { return 1; } else { return -1; }
						}
					});
					break;
				case "numEnquiries":
					items.sort(function(a, b) {
						if ( a.getNumEnquiries() > b.getNumEnquiries() ) {
							if ( direction == "Asc" ) { return -1; } else { return 1; }
						} else {
							if ( direction == "Asc" ) { return 1; } else { return -1; }
						}
					});
					break;
				case "numAllocated":
					items.sort(function(a, b) {
						if ( a.getNumAllocated() > b.getNumAllocated() ) {
							if ( direction == "Asc" ) { return -1; } else { return 1; }
						} else {
							if ( direction == "Asc" ) { return 1; } else { return -1; }
						}
					});
					break;
				case "numUnallocated":
					items.sort(function(a, b) {
						if ( a.getNumUnallocated() > b.getNumUnallocated() ) {
							if ( direction == "Asc" ) { return -1; } else { return 1; }
						} else {
							if ( direction == "Asc" ) { return 1; } else { return -1; }
						}
					});
					break;
				case "counts":
					items.sort(function(a, b) {
						if ( a.getCounts() > b.getCounts() ) {
							if ( direction == "Asc" ) { return -1; } else { return 1; }
						} else {
							if ( direction == "Asc" ) { return 1; } else { return -1; }
						}
					});
					break;
				case "averageAgeAllocated":
					items.sort(function(a, b) {
						if ( a.getAvgAgeAllocatedRaw() > b.getAvgAgeAllocatedRaw() ) {
							if ( direction == "Asc" ) { return -1; } else { return 1; }
						} else {
							if ( direction == "Asc" ) { return 1; } else { return -1; }
						}
					});
					break;
				case "averageAgeUnallocated":
					items.sort(function(a, b) {
						if ( a.getAvgAgeUnallocatedRaw() > b.getAvgAgeUnallocatedRaw() ) {
							if ( direction == "Asc" ) { return -1; } else { return 1; }
						} else {
							if ( direction == "Asc" ) { return 1; } else { return -1; }
						}
					});
					break;
				case "receivedDate":
					items.sort(function(a, b) {
						if ( a.getAvgAgeUnallocatedRaw() > b.getAvgAgeUnallocatedRaw() ) {
							if ( direction == "Asc" ) { return -1; } else { return 1; }
						} else {
							if ( direction == "Asc" ) { return 1; } else { return -1; }
						}
					});
					break;
				case "consultant":
					items.sort(function(a, b) {
						if ( a.getAvgAgeUnallocatedRaw() > b.getAvgAgeUnallocatedRaw() ) {
							if ( direction == "Asc" ) { return -1; } else { return 1; }
						} else {
							if ( direction == "Asc" ) { return 1; } else { return -1; }
						}
					});
					break;

			}
		});

		return items;
	}
},
/* @Prototype */
{
 
	init: function(el, params){
		
		this.currentSort = new Array('nameSortDesc');
		this.callback = params['callback'];
		
	},
	 
	doSort: function(button) {
	 	if ( !Closer.Controllers.Application.processing ) {

		 	var type = $(button).attr("href");

		 	if ( type == "clearSort" ) {
		 		
		 		this.currentSort = new Array("nameSortDesc");
		 		this.element.children(".sortButton").removeClass("activeAsc");
		 		this.element.children(".sortButton").removeClass("activeDesc");

		 	} else if ( button.hasClass('activeDesc') ) {

		 		button.removeClass('activeDesc');
		 		var typeIndex = $.inArray(type + "Desc", this.currentSort);
	 			this.currentSort.splice(typeIndex, 1);
		 		button.addClass('activeAsc');
		 		this.currentSort.push(type + "Asc");

		 	} else if ( button.hasClass('activeAsc') ) {
		 		
		 		var typeIndex = $.inArray(type + "Asc", this.currentSort);
		 		this.currentSort.splice(typeIndex, 1);
		 		button.removeClass('activeAsc');

		 	} else {

		 		button.addClass('activeDesc');
		 		this.currentSort.push(type + "Desc");

		 	}

		 	OpenAjax.hub.publish( this.callback + '.refresh', { sort:this.currentSort });

		 }
	 },

	/******** Start Sorting Handlers *********/

	".sortButton click": function(el, ev) {
	 	ev.preventDefault();
	 	
	 	// alert('hit');
	 	if ( Closer.Controllers.Page.Login.checkAuth() ) { this.doSort(el); }
	 }
	
	/******** End Sorting Handlers *********/

});
