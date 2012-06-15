/**
 * @tag controllers, home
 * Displays a table of brands.	 Lets the user 
 * ["Closer.Controllers.Brand.prototype.form submit" create], 
 * ["Closer.Controllers.Brand.prototype.&#46;edit click" edit],
 * or ["Closer.Controllers.Brand.prototype.&#46;destroy click" destroy] brands.
 */
$.Controller.extend('Closer.Controllers.Loading',
/* @Static */
{
	loadingVisible: false,
	
	setup: function() {
	    $(document).ready(function() { $("#loading").closer_loading(); });
	}
},
/* @Prototype */
{
 /**
 * When the page loads, gets all brands to be displayed.
 */
 init: function(el, params){
 	this.element.show(); 
 },

 "tab.loading subscribe": function(event, data) {
 	this.loadingVisible = true;
 	this.element.show();
 },

 "tab.changed subscribe": function(event, data) {
 	this.loadingVisible = true;
 	this.element.show();
 },

 "data.loading subscribe": function(event, data) {
 	this.loadingVisible = true;
 	this.element.show();
 },

 "tab.loaded subscribe": function(event, data) {
 	_this = this;
 	this.element.fadeOut(250, function() { this.loadingVisible = false; });
 },

 "data.loaded subscribe": function(event, data) {
 	_this = this;
 	this.element.fadeOut(250, function() { this.loadingVisible = false; });
 },

 "loading.destroy subscribe": function(event, data) {
 	_this = this;
 	this.element.fadeOut(250, function() { this.loadingVisible = false; Closer.Controllers.Application.processing = false; });
 },

 "item.loading subscribe": function( event, data ) {
 	data['element'].before( $.View("//closerApp/views/utility/route_loading") );
	data['element'].fadeTo(1000, "0.6");
	data['element'].prev(".routeLoading").show();
 },

 "item.loaded subscribe": function( event, data ) {
 	data['element'].prev(".routeLoading").remove();
	data['element'].fadeTo(250, "1");
 },

 "item.error subscribe": function( event, data ) {
 	data['element'].prev(".routeLoading").remove();
	data['element'].fadeTo(250, "1");
	OpenAjax.hub.publish('errorNotice.display', { element:data['element'], message:"Error" });
 },

 "status.display subscribe": function( event, data ) {
 	$("#statusBar").html(data['message']);
 },

 "list.loading subscribe": function( event, data ) {
 	data['element'].before( $.View("//closerApp/views/components/utility/list_loading") );
 	var loadingElement = data['element'].prev(".listLoading");
 	if ( data['element'].outerHeight() == 0 ) {
 		loadingElement.height( "100px" );
 	} else {
 		loadingElement.height( data['element'].outerHeight() );
 	}

 	loadingElement.width( data['element'].outerWidth() );
 	data['element'].hide();
 },

 "list.loaded subscribe": function( event, data ) {
 	data['element'].prev(".listLoading").remove();
 	data['element'].fadeIn(1000);
 }

});