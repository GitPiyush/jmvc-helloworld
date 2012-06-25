/**
 * @tag models, home
 * Wraps backend users services.  Enables 
 * [Helloworld.Models.Users.static.findAll retrieving],
 * [Helloworld.Models.Users.static.update updating],
 * [Helloworld.Models.Users.static.destroy destroying], and
 * [Helloworld.Models.Users.static.create creating] users.
 */
$.Model.extend('Helloworld.Models.User',
/* @Static */
{
	/**
 	 * Retrieves users data from your backend services.
 	 * @param {Object} params params that might refine your results.
 	 * @param {Function} success a callback function that returns wrapped users objects.
 	 * @param {Function} error a callback function for an error in the ajax request.
 	 */
	findAll: function( params, success, error ){
		$.ajax({
			url: '/users',
			type: 'get',
			dataType: 'json',
			data: params,
			success: this.callback(['wrapMany',success]),
			error: error,
			fixture: "//helloworld/fixtures/users.json.get" //calculates the fixture path from the url and type.
		});
	},

	findOne: function( params, success, error ){
		$.ajax({
			url: '/helloworld/fixtures/users.php',
			type: 'get',
			dataType: 'json',
			data: params,
			success: this.callback(['wrap',success]),
			error: error,
		});
	},

	/**
	 * Updates a users's data.
	 * @param {String} id A unique id representing your users.
	 * @param {Object} attrs Data to update your users with.
	 * @param {Function} success a callback function that indicates a successful update.
 	 * @param {Function} error a callback that should be called with an object of errors.
     */
	update: function( id, attrs, success, error ){
		$.ajax({
			url: '/users/'+id,
			type: 'put',
			dataType: 'json',
			data: attrs,
			success: success,
			error: error,
			fixture: "-restUpdate" //uses $.fixture.restUpdate for response.
		});
	},
	/**
 	 * Destroys a users's data.
 	 * @param {String} id A unique id representing your users.
	 * @param {Function} success a callback function that indicates a successful destroy.
 	 * @param {Function} error a callback that should be called with an object of errors.
	 */
	destroy: function( id, success, error ){
		$.ajax({
			url: '/users/'+id,
			type: 'delete',
			dataType: 'json',
			success: success,
			error: error,
			fixture: "-restDestroy" // uses $.fixture.restDestroy for response.
		});
	},
	/**
	 * Creates a users.
	 * @param {Object} attrs A users's attributes.
	 * @param {Function} success a callback function that indicates a successful create.  The data that comes back must have an ID property.
	 * @param {Function} error a callback that should be called with an object of errors.
	 */
	create: function( attrs, success, error ){
		$.ajax({
			url: '/users',
			type: 'post',
			dataType: 'json',
			success: success,
			error: error,
			data: attrs,
			fixture: "-restCreate" //uses $.fixture.restCreate for response.
		});
	}
},
/* @Prototype */
{
	getName: function() { return this.name; },
	getDesc: function() { return this.description; },
	getID  : function() { return this.id }
});