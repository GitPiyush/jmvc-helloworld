steal("funcunit", function(){
	module("closer test", { 
		setup: function(){
			S.open("//closerApp/closer.html");
		}
	});
	
	test("Copy Test", function(){
		equals(S("h1").text(), "Welcome to JavaScriptMVC 3.2!","welcome text");
	});
})