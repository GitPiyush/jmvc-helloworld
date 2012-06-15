steal("funcunit/qunit", "closerApp/fixtures", "closerApp/models/enquiry.js", function(){
	module("Model: Closer.Models.Enquiry")
	
	test("findAll", function(){
		expect(4);
		stop();
		Closer.Models.Enquiry.findAll({}, function(enquiries){
			ok(enquiries)
	        ok(enquiries.length)
	        ok(enquiries[0].name)
	        ok(enquiries[0].description)
			start();
		});
		
	})
	
	test("create", function(){
		expect(3)
		stop();
		new Closer.Models.Enquiry({name: "dry cleaning", description: "take to street corner"}).save(function(enquiry){
			ok(enquiry);
	        ok(enquiry.id);
	        equals(enquiry.name,"dry cleaning")
	        enquiry.destroy()
			start();
		})
	})
	test("update" , function(){
		expect(2);
		stop();
		new Closer.Models.Enquiry({name: "cook dinner", description: "chicken"}).
	            save(function(enquiry){
	            	equals(enquiry.description,"chicken");
	        		enquiry.update({description: "steak"},function(enquiry){
	        			equals(enquiry.description,"steak");
	        			enquiry.destroy();
						start();
	        		})
	            })
	
	});
	test("destroy", function(){
		expect(1);
		stop();
		new Closer.Models.Enquiry({name: "mow grass", description: "use riding mower"}).
	            destroy(function(enquiry){
	            	ok( true ,"Destroy called" )
					start();
	            })
	})
})