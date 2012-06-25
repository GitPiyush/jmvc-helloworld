/**
 * @class Helloworld.Controllers.Page.Homepage
 */
$.Controller('Helloworld.Controllers.Page.Homepage',
/* @Static */
{
	defaults : {
		container:'.homepage'
	},

	setup:function(){
		var self = this;

		// Wait to be told the application is ready!
		OpenAjax.hub.subscribe('Helloworld.Application.Ready', function(data){
			console.log("APPLICATION IS READY");
			$('.homepage').helloworld_page_homepage();
		});
	}
},
/* @Prototype */
{
	users:null,

	// Setup the homepage
	init : function(){
		// Stuff to do when inialised
		console.log('Home page initialising');
		this.setupForm();
		this.getUsers();
	},

	// Setup the find user form
	setupForm:function(){
		// Insert our template
		this.element.find('.formcontainer').html('//helloworld/views/user_form', {
			form : {
				title:'Our users find form!',
				userField:'check username here',
				sendButton:'get dowdy'
			}
		});
	},

	// get the users from the backend
	getUsers:function(){
		Helloworld.Models.User.findAll({}, this.callback('setUsers'), this.callback('error'));
	},

	// Displays a list users
	setUsers:function( users ){
		this.users = users;
		this.element.find('.userlist').html('//helloworld/views/user_list', {users:users});
	},

	// Shows the user details view
	showDetails:function( user ){
		this.element.find('.userdetails').html('//helloworld/views/user_details', {singleUser:user});
	},

	// Handles the for submits
	"button click":function( el, ev ){
		ev.preventDefault();

		// Get the user name
		var user = {};
		user.name = this.element.find('input[name=user_input]').val();

		// use the model to find and pass to the showDetails callback
		Helloworld.Models.User.findOne( user, this.callback('showDetails'), this.callback('error'));
	},

	// An error example
	"a.ohno click":function( el, ev ){
		ev.preventDefault();

		OpenAjax.hub.publish('Helloworld.Message', {
			type    :'error',
			message :'Oh no its all happening again!'
		})
	},

	// One way to make the user links work
	".userlist a click":function( el, ev ){
		ev.preventDefault();

		this.element.find('input[name=user_input]').val( el.text() );
		this.element.find('button').click();
	},
	
	// Lets try a better way

	// Error messages go here
	error:function(){
		OpenAjax.hub.publish('Helloworld.Message', {
			type    :'error',
			message :'Oh no something went wrong!'
		});

	}


});