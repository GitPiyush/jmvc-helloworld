steal.plugins(
	'jquery/controller',			// a widget factory
	'jquery/controller/subscribe',	// subscribe to OpenAjax.hub
	'jquery/controller/history',	// The inbuilt history object for JMVC, required even if we are using YUI() history

	'jquery/view/ejs',				// client side templates
	'jquery/controller/view',		// lookup views with the controller's name
	'jquery/model',					// Ajax wrappers
	// 'jquery/model/associations',	// Model Associations
	// 'jquery/dom/fixture',			// simulated Ajax requests
	'jquery/dom/cookie',			// Cookie plugin
	'jquery/dom/form_params',		// form data helper
	'jquery/event',					// JSMVC Event plugin,
	'jquery/model/service',
	'jquery/model/service/json_rest'
	)

.then(function(){
	// Fix mthod to pass an empty function
	if( $.type(window.console) === 'undefined' ) {
		// alert('console not available');
		window.console = {
			log:function(){},
			warn:function(){},
			debug:function(){},
			dir:function(){},
			error: function(){}
		};
	}
	$.fn['null'] = function(){};
})

.resources(
	// 'fancybox/fancybox/jquery.easing-1.3.pack',
	// 'fancybox/fancybox/jquery.fancybox-1.3.4.pack',
	'jquery-ui-1.8.16.custom.min.js',
	'jquery.maskedinput-1.3.js',
	'jquery.base64.js',
	'jquery.upload.js',
	// 'ckeditor/ckeditor.js',
	'jquery.tools.min.js',
	// 'jquery.jqtransform.js',
	'jquery.autoclear.js',
	'jquery.notice.js',
	'yui-min.js'
	)

.models(
	'domain',
	'enquiry',
	// 'resolutions',
	'queue',
	'user',
	'state',
	'resolution',
	'email'
)

.views(
	'//closerApp/views/components/dialogs/notice_error.ejs',
	'//closerApp/views/components/dialogs/notice_warning.ejs',
	'//closerApp/views/components/utility/list_loading.ejs',

	'//closerApp/views/components/dialog_plain.ejs',
	'//closerApp/views/components/loading.ejs',
	'//closerApp/views/components/menu_item.ejs',
	'//closerApp/views/components/modal_error.ejs',
	'//closerApp/views/components/modal_plain.ejs',
	'//closerApp/views/components/userInfo.ejs',

	'//closerApp/views/page/consultantSetup_main.ejs',
	'//closerApp/views/page/enquiries_main.ejs',
	'//closerApp/views/page/login.ejs',
	'//closerApp/views/page/manageQueues_main.ejs',
	'//closerApp/views/page/queueReport_main.ejs',
	'//closerApp/views/page/search_main.ejs',
	'//closerApp/views/page/partials/domainOptions.ejs',
	'//closerApp/views/page/partials/filter_list.ejs',
	'//closerApp/views/page/partials/listingQueue.ejs',
	'//closerApp/views/page/partials/pageHeader.ejs',

	'//closerApp/views/page/partials/enquiries/backTo_link.ejs',
	'//closerApp/views/page/partials/enquiries/editEnquiry.ejs',
	'//closerApp/views/page/partials/enquiries/emailEnquiry.ejs',
	'//closerApp/views/page/partials/enquiries/finish_outer.ejs',
	'//closerApp/views/page/partials/enquiries/finish_hotOrNot.ejs',
	'//closerApp/views/page/partials/enquiries/finish_noSale.ejs',
	'//closerApp/views/page/partials/enquiries/finish_sale.ejs',
	'//closerApp/views/page/partials/enquiries/getEnquiries.ejs',
	'//closerApp/views/page/partials/enquiries/listEmail.ejs',
	'//closerApp/views/page/partials/enquiries/listingEnquiry.ejs',
	'//closerApp/views/page/partials/enquiries/listingQueue.ejs',
	'//closerApp/views/page/partials/enquiries/modal_closer.ejs',
	'//closerApp/views/page/partials/enquiries/permittedTransitions.ejs',
	'//closerApp/views/page/partials/enquiries/reassign.ejs',
	'//closerApp/views/page/partials/enquiries/reassign_inner.ejs',
	'//closerApp/views/page/partials/enquiries/cmail/attachment.ejs',
	'//closerApp/views/page/partials/enquiries/cmail/attachment_od.ejs',
	'//closerApp/views/page/partials/enquiries/cmail/cmail.ejs',
	'//closerApp/views/page/partials/enquiries/cmail/upload.ejs',


	'//closerApp/views/page/partials/login/domainOptions.ejs',
	'//closerApp/views/page/partials/login/error.ejs',
	'//closerApp/views/page/partials/login/noEmail.ejs',

	'//closerApp/views/page/partials/manageQueues/listingEnquiry.ejs',
	'//closerApp/views/page/partials/manageQueues/listingQueue.ejs',
	'//closerApp/views/page/partials/manageQueues/manageQueues_edit.ejs',

	'//closerApp/views/page/partials/search/searchTruncatedMsg.ejs',

	
	'//closerApp/views/page/partials/widgets/paging_fancy.ejs',
	'//closerApp/views/page/partials/widgets/paging_normal.ejs'
	)

.css(
	'css/jquery-ui-1.8.17.custom',
	// 'css/jqtransform/jqtransform',
	'css/jquery.notice'
	)	// loads styles

.controllers( 
	'page/login',
	'application',
	'widgets/loading',
	'components/history',
	'components/tabs',
	'widgets/modal',
	// 'widgets/cmail',
	'widgets/filter',
	'widgets/sorting',
	'widgets/reassign',
	'page/consultant',
	'page/queuereport',
	'page/managequeues',
	'page/search',
	'page/enquiries'

).then(function() {
		try {
			if ($.type(window.closerCompileAndGo) == 'undefined') {
				// Let the application know that its ready to go
				$(document).ready(function() { $("#Outer").closer_application({ }); });
			}
		} catch(e) {
			if (typeof(console) == 'object' && typeof(console.log) == 'function') {
				//TODO: need to implement better error handling here
				// console.log('Error while trying to load settings.json - Exception: ', e);
			}
		}
	});