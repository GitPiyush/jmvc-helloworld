//js closer/scripts/doc.js

load('steal/rhino/steal.js');
steal.plugins("documentjs").then(function(){
	// DocumentJS('closerApp/closerApp.html');
	DocumentJS('closerApp/scripts/build.html');
});