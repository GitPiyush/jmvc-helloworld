//steal/js mynewapp/scripts/compress.js

load("steal/rhino/steal.js");
steal.plugins('steal/build','steal/build/scripts','steal/build/styles',function(){
	steal.build('mynewapp/scripts/build.html',{to: 'mynewapp'});
});
