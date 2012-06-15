// map fixtures for this application

steal("jquery/dom/fixture", function(){
	
	$.fixture.make("enquiry", 5, function(i, enquiry){
		var descriptions = ["grill fish", "make ice", "cut onions"]
		return {
			name: "enquiry "+i,
			description: $.fixture.rand( descriptions , 1)[0]
		}
	})
})