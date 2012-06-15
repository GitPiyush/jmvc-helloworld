steal('jquery/model', function(){

/**
 * @class Testapp.Models.test
 * @parent index
 * @inherits jQuery.Model
 * Wraps backend test services.  
 */
$.Model('Testapp.Models.test',
/* @Static */
{
	findAll: "/tests.json",
  	findOne : "/tests/{id}.json", 
  	create : "/tests.json",
 	update : "/tests/{id}.json",
  	destroy : "/tests/{id}.json"
},
/* @Prototype */
{});

})