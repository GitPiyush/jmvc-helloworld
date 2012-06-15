//steal/js gimp2/scripts/compress.js

load("steal/rhino/steal.js");
steal.plugins('steal/build','steal/build/scripts','steal/build/styles',function(){
	steal.build('closerApp/scripts/build.html',{to: 'closerApp'});
});