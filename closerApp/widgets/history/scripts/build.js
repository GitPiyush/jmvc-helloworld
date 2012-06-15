//steal/js closer/widgets/history/scripts/compress.js

load("steal/rhino/steal.js");
steal.plugins('steal/build','steal/build/scripts','steal/build/styles',function(){
	steal.build('closerApp/widgets/history/scripts/build.html',{to: 'closerApp/widgets/history'});
});
