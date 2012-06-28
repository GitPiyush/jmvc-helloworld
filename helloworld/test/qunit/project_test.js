module("Model: Helloworld.Models.Project")

asyncTest("findAll", function(){
	stop(2000);
	Helloworld.Models.Project.findAll({}, function(projects){
		ok(projects)
        ok(projects.length)
        ok(projects[0].name)
        ok(projects[0].description)
		start()
	});
	
})

asyncTest("create", function(){
	stop(2000);
	new Helloworld.Models.Project({name: "dry cleaning", description: "take to street corner"}).save(function(project){
		ok(project);
        ok(project.id);
        equals(project.name,"dry cleaning")
        project.destroy()
		start();
	})
})
asyncTest("update" , function(){
	stop();
	new Helloworld.Models.Project({name: "cook dinner", description: "chicken"}).
            save(function(project){
            	equals(project.description,"chicken");
        		project.update({description: "steak"},function(project){
        			equals(project.description,"steak");
        			project.destroy();
        			start()
        		})
            })

});
asyncTest("destroy", function(){
	stop(2000);
	new Helloworld.Models.Project({name: "mow grass", description: "use riding mower"}).
            destroy(function(project){
            	ok( true ,"Destroy called" )
            	start();
            })
})