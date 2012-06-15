//js closerApp/widgets/history/scripts/doc.js

load('steal/rhino/steal.js');
steal.plugins("documentjs").then(function(){
	DocumentJS('closerApp/widgets/history/history.html');
});