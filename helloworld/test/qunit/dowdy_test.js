module("Model: Helloworld.Models.Dowdy")

asyncTest("findAll", function(){
	stop(2000);
	Helloworld.Models.Dowdy.findAll({}, function(dowdies){
		ok(dowdies)
        ok(dowdies.length)
        ok(dowdies[0].name)
        ok(dowdies[0].description)
		start()
	});
	
})

asyncTest("create", function(){
	stop(2000);
	new Helloworld.Models.Dowdy({name: "dry cleaning", description: "take to street corner"}).save(function(dowdy){
		ok(dowdy);
        ok(dowdy.id);
        equals(dowdy.name,"dry cleaning")
        dowdy.destroy()
		start();
	})
})
asyncTest("update" , function(){
	stop();
	new Helloworld.Models.Dowdy({name: "cook dinner", description: "chicken"}).
            save(function(dowdy){
            	equals(dowdy.description,"chicken");
        		dowdy.update({description: "steak"},function(dowdy){
        			equals(dowdy.description,"steak");
        			dowdy.destroy();
        			start()
        		})
            })

});
asyncTest("destroy", function(){
	stop(2000);
	new Helloworld.Models.Dowdy({name: "mow grass", description: "use riding mower"}).
            destroy(function(dowdy){
            	ok( true ,"Destroy called" )
            	start();
            })
})