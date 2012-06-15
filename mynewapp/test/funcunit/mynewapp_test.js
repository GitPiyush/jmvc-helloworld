module("mynewapp test", { 
	setup: function(){
		S.open("//mynewapp/mynewapp.html");
	}
});

test("Copy Test", function(){
	equals(S("h1").text(), "Welcome to JavaScriptMVC 3.0!","welcome text");
});