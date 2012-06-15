steal("funcunit/qunit", "testapp/fixtures", "testapp/models/test.js", function(){
	module("Model: Testapp.Models.test")
	
	test("findAll", function(){
		expect(4);
		stop();
		Testapp.Models.test.findAll({}, function(tests){
			ok(tests)
	        ok(tests.length)
	        ok(tests[0].name)
	        ok(tests[0].description)
			start();
		});
		
	})
	
	test("create", function(){
		expect(3)
		stop();
		new Testapp.Models.test({name: "dry cleaning", description: "take to street corner"}).save(function(test){
			ok(test);
	        ok(test.id);
	        equals(test.name,"dry cleaning")
	        test.destroy()
			start();
		})
	})
	test("update" , function(){
		expect(2);
		stop();
		new Testapp.Models.test({name: "cook dinner", description: "chicken"}).
	            save(function(test){
	            	equals(test.description,"chicken");
	        		test.update({description: "steak"},function(test){
	        			equals(test.description,"steak");
	        			test.destroy();
						start();
	        		})
	            })
	
	});
	test("destroy", function(){
		expect(1);
		stop();
		new Testapp.Models.test({name: "mow grass", description: "use riding mower"}).
	            destroy(function(test){
	            	ok( true ,"Destroy called" )
					start();
	            })
	})
})