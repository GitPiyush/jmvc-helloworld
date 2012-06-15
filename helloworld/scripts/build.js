//steal/js helloworld/scripts/compress.js

load("steal/rhino/steal.js");
steal.plugins('steal/build','steal/build/scripts','steal/build/styles',function(){
	steal.build('helloworld/scripts/build.html',{to: 'helloworld'});
});
