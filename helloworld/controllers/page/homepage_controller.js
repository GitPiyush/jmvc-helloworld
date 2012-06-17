/**
 * @class Helloworld.Controllers.Page.Homepage
 */
$.Controller('Helloworld.Controllers.Page.Homepage',
/* @Static */
{
	defaults : {
		container:'.formcontainer'
	},

	setup:function(){
		var self = this;
		OpenAjax.hub.subscribe('Helloworld.Application.Ready', function(data){
			console.log(self.defaults.container);
			$(self.defaults.container).helloworld_page_homepage({});
		});
	}
},
/* @Prototype */
{
	users:null,
	init : function(){
		// Stuff to do when inialised
		console.log('Home page initialising');
		this.setupForm();
		this.getUsers();
	},

	/**
	 * Setup the find user form
	 * @return {null}
	 */
	setupForm:function(){
		// Insert our template
		this.element.html('//helloworld/views/user_form', {
			form : {
				title:'Get ready!!!',
				userField:'check username',
				sendButton:'get details'
			}
		});
	},

	/**
	 * get the users from the backend
	 */
	getUsers:function(){
		Helloworld.Models.User.findAll({}, this.callback('setUsers'), this.callback('error'));
	},

	setUsers:function( users ){
		this.users = users;
		console.log(users);
	},




	"button click":function( el, ev ){
		ev.preventDefault();

		alert('Clicked button!');
	},

	error:function(){}


});