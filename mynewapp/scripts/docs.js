//js mynewapp/scripts/doc.js

load('steal/rhino/steal.js');
steal.plugins("documentjs").then(function(){
	DocumentJS('mynewapp/mynewapp.html');
});