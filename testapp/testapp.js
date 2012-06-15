steal(
	'./testapp.css', 			// application CSS file
	'./models/models.js',		// steals all your models
	'./fixtures/fixtures.js',	// sets up fixtures for your models
	'testapp/test/create',
	'testapp/test/list',
	function(){					// configure your application
		
		$('#tests').testapp_test_list();
		$('#create').testapp_test_create();
})