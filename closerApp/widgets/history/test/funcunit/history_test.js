module("history test", { 
	setup: function(){
		S.open("//closerApp/widgets/history/history.html");
	}
});

test("Copy Test", function(){
	equals(S("h1").text(), "Welcome to JavaScriptMVC 3.0!","welcome text");
});