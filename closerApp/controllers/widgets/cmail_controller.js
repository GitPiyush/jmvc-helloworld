/**
 * @tag controllers, home
 */
$.Controller.extend('Closer.Controllers.Cmail',
/* @Static */
{

	setup: function(){
		var self = this;
		OpenAjax.hub.subscribe('cmail.load', function(event, data) {

			
			data.element.closer_cmail({ currentEnquiry: data.currentEnquiry });
		});
	}
},
/* @Prototype */
{

	destroy:function(){}

});