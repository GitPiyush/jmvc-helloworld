module("Model: Helloworld.Models.Users")

asyncTest("findAll", function(){
	stop(2000);
	Helloworld.Models.Users.findAll({}, function(users){
		ok(users)
        ok(users.length)
        ok(users[0].name)
        ok(users[0].description)
		start()
	});
	
})

asyncTest("create", function(){
	stop(2000);
	new Helloworld.Models.Users({name: "dry cleaning", description: "take to street corner"}).save(function(users){
		ok(users);
        ok(users.id);
        equals(users.name,"dry cleaning")
        users.destroy()
		start();
	})
})
asyncTest("update" , function(){
	stop();
	new Helloworld.Models.Users({name: "cook dinner", description: "chicken"}).
            save(function(users){
            	equals(users.description,"chicken");
        		users.update({description: "steak"},function(users){
        			equals(users.description,"steak");
        			users.destroy();
        			start()
        		})
            })

});
asyncTest("destroy", function(){
	stop(2000);
	new Helloworld.Models.Users({name: "mow grass", description: "use riding mower"}).
            destroy(function(users){
            	ok( true ,"Destroy called" )
            	start();
            })
})