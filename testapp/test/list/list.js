steal( 'jquery/controller',
	   'jquery/view/ejs',
	   'jquery/controller/view',
	   'testapp/models' )
.then( './views/init.ejs', 
       './views/test.ejs', 
       function($){

/**
 * @class testapp.test.List
 * @parent index
 * @inherits jQuery.Controller
 * Lists tests and lets you destroy them.
 */
$.Controller('testapp.test.List',
/** @Static */
{
	defaults : {}
},
/** @Prototype */
{
	init : function(){
		this.element.html(this.view('init',testapp.Models.test.findAll()) )
	},
	'.destroy click': function( el ){
		if(confirm("Are you sure you want to destroy?")){
			el.closest('.test').model().destroy();
		}
	},
	"{testapp.Models.test} destroyed" : function(test, ev, test) {
		test.elements(this.element).remove();
	},
	"{testapp.Models.test} created" : function(test, ev, test){
		this.element.append(this.view('init', [test]))
	},
	"{testapp.Models.test} updated" : function(test, ev, test){
		test.elements(this.element)
		      .html(this.view('test', test) );
	}
});

});