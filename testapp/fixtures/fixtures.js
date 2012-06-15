// map fixtures for this application

steal("jquery/dom/fixture", function(){
	
	$.fixture.make("test", 5, function(i, test){
		var descriptions = ["grill fish", "make ice", "cut onions"]
		return {
			name: "test "+i,
			description: $.fixture.rand( descriptions , 1)[0]
		}
	})
})