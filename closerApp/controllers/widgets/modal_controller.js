/**
 * @tag controllers, home
 * Displays a table of routes.	 Lets the user 
 * ["Closer.Controllers.Route.prototype.form submit" create], 
 * ["Closer.Controllers.Route.prototype.&#46;edit click" edit],
 * or ["Closer.Controllers.Route.prototype.&#46;destroy click" destroy] routes.
 */
$.Controller.extend('Closer.Controllers.Widgets.Modal',
/* @Static */
{
	currentDialog: null,
	callbackEvent: "",
	callbackElement: null,
	currentErrorWindows: 0,
	modalDestroyedEvent:null,

	setup: function() {
		
	    OpenAjax.hub.subscribe('modal.display', function(event, data) {
	    	Closer.Controllers.Application.app.append($('<div/>').attr('id','modalContainer').closer_widgets_modal({ content:data['content'], callbackEvent:data['callbackEvent'], modalLoadedEvent:data['modalLoadedEvent'], modalDestroyedEvent:data['modalDestroyedEvent']}));
	    });

	    OpenAjax.hub.subscribe('dialog.display', function(event, data) {
	    	Closer.Controllers.Application.app.append($('<div/>').attr('id','modalContainer').closer_widgets_modal({ content:data['message'], callbackEvent:data['callbackEvent']}));
	    });

	    /*OpenAjax.hub.subscribe('dialog.display', function(event, data) {
	    	Closer.Controllers.Application.app.append($('<div/>').attr('id','modalContainer').closer_widgets_modal({ content:data['message'], callbackEvent:data['callbackEvent']}));
	    });*/

	    OpenAjax.hub.subscribe('error.display', function(event, data) {
	    	if ( Closer.Controllers.Widgets.Modal.currentErrorWindows > 0 ) {
				if ( data['error'] == "" ) {
					$(".modalWindow").find("ul").append('<li>Unspecified Error - Please contact your development team for more information</li>');
				} else {
					$(".modalWindow").find("ul").append('<li>' + data['error'] + '</li>');
				}
			} else {
				Closer.Controllers.Application.app.append($('<div/>').attr('id','modalContainer').closer_widgets_modal({ content:data['error'], callbackEvent:data['callbackEvent'], type:"error", callbackElement:data['element']}));
			}
	    });

	    OpenAjax.hub.subscribe('elementNotice.display', function(event, data) {
	    	$(".noticeContainer").remove();

	    	$.each( data['info'], function(element, message) {

	    		// console.debug( message );

				if ( element == "errorsPresent" ) { return true; }
				if ( element == "displayName" ) { element = "timezone"; }

				var $target = $("." + element),
					$el = $('<div/>');
				$('body').append( $el );
				var targetOffset = $target.offset();
				$el.addClass("noticeContainer");
				
				// console.debug($target);
				// console.debug($el);
				// console.debug(targetOffset, "target offset");

				$el.append( "//closerApp/views/components/dialogs/notice_warning", { message: message }, function(){
					this.css({ top: targetOffset.top - $el.height(), left: targetOffset.left + ($target.width() + 5) } );
					this.fadeIn();
					setTimeout(function() {
						// alert('okay go');
						//OpenAjax.hub.publish('notice.destroy');
						$el.fadeOut(500, function(e) { $(e).remove(); });
					}, 4000 );
				});
			});
	    });

	    OpenAjax.hub.subscribe('errorNotice.display', function(event, data) {

				$.View("//closerApp/views/components/dialogs/notice_error", { message: data['message'] }, function(result) {
					data['element'].after(result);
					var element = data['element'].next();
					$(element).offset({ top: data['element'].offset().top, left: data['element'].offset().left + data['element'].width() - 100  } );
					$(element).fadeIn();

					setTimeout(function() {
						$(element).fadeOut(500, function(e) { $(e).remove(); });
					}, 5000 );
				});
	    });
	}

},
/* @Prototype */
{
	init: function(el, params) {
		this.callbackEvent = params['callbackEvent'];
		this.modalLoadedEvent = params['modalLoadedEvent'];
		this.modalDestroyedEvent = params['modalDestroyedEvent'];

		var _this = this;

		if ( params['type'] == 'error' ) {
			Closer.Controllers.Widgets.Modal.currentErrorWindows++;

			if ( $.type(params['content']) === 'undefined' ) {
				params['content'] = "Unspecified Error - Please contact your development team for more information";
			}

			$(el).append('//closerApp/views/components/modal_error', { content: params['content'] }, function() {
			
				OpenAjax.hub.publish('data.loaded');
				$(el).find(".bgShadow").fadeIn(250);
				$(el).find(".modalWindow").fadeIn(500);

			});

		} else {
			$(el).append($.View('//closerApp/views/components/modal_plain'));
			setTimeout(function() {
				$(el).find(".modalWindow").append(params['content']);
				$(el).find(".bgShadow").fadeIn(500, function() {
					OpenAjax.hub.publish( _this.modalLoadedEvent );
				});
				$(el).find(".modalWindow").fadeIn(1000);
			}, 50);
		}
	},

	".bgShadow click": function(el, ev) {
		ev.preventDefault();

		//OpenAjax.hub.publish("modal.destroy");
	},

	".closeWindow click": function( el, ev ) {
		ev.preventDefault();

		OpenAjax.hub.publish("modal.destroy");	
	},


	".saveButton click":function (el, ev) {
		var data = null;
		var formData = null;
		var model = null;

		if ( this.find("form").length > 1 ) {
			formData = new Array();
			$.each(this.find("form"), function( key, value ) {
				formData.push($(value).serializeArray());
			});	
		} else {
			formData = this.find("form").serializeArray();
		}

		if ( el.data('model') != undefined ) {
			data = el.data('model');
			model = true;
		} else {
			model = false;
			data = this.find("form").serializeArray();
		}
		OpenAjax.hub.publish(this.callbackEvent, { data:data, model:model, formData:formData });
	},


	/**
	 * This handles email send button differently to other modals
	 * TODO: refactor all this modal crap.  Modal controller should show and hide modals nothing else!
	 * 
	 * @param  {[type]} el [description]
	 * @param  {[type]} ev [description]
	 * @return {[type]}    [description]
	 */
	".sendEmail click":function (el, ev) {

		// var data = null;
		// var formData = null;
		// var model = null;

		// if ( this.find("form").length > 1 ) {
		// 	formData = new Array();
		// 	$.each(this.find("form"), function( key, value ) {
		// 		formData.push($(value).serializeArray());
		// 	});	
		// } else {
		// 	formData = this.find("form").serializeArray();
		// }

		// if ( el.data('model') != undefined ) {
		// 	data = el.data('model');
		// 	model = true;
		// } else {
		// 	model = false;
		// 	data = this.find("form").serializeArray();
		// }
		// OpenAjax.hub.publish(this.callbackEvent, { data:data, model:model, formData:formData });

		var formData = this.find(".cmailSection :input").serializeArray();
		OpenAjax.hub.publish(this.callbackEvent, { data:formData, element:el });
	},



	"#cancelButton click":function (el, ev) {
		OpenAjax.hub.publish("modal.destroy");
	},

	"modal.destroy subscribe": function(event, data) {
		_this = this;

		// console.log(this.modalDestroyedEvent);
		

		if( this.modalDestroyedEvent ){
			OpenAjax.hub.publish( this.modalDestroyedEvent );
		}

		Closer.Controllers.Widgets.Modal.currentErrorWindows = 0;
		$(this.element).children(".bgShadow").fadeOut();
		$(this.element).children(".modalWindow").fadeOut(function() { $("#modalContainer").remove(); });
	},

	"notice.destroy subscribe": function(event, data) {

	},

	/* Start Enquiry Specific Functions */

	".outcomeBox .options input change": function( el, ev ) {
		var self = this;
		$(".outcomeBox").next(".outcomeDetailsBox").slideUp(300, function(){
			$(this).remove();
		});
		$('.outcomeHotOrNot').slideUp(300, function(){
			$(this).remove();
		})

		if ( el.val() == "SALE" ) {
			$(".outcomeBox").after(
				"//closerApp/views/page/partials/enquiries/finish_sale", 
				{ outcomes: Closer.Models.Resolution.filterResolutionGroups({ group: el.val() } )},
				function(){
					self.element.find('.dollarInput').mask('9?999999999', {placeholder:' '});
				}
			);
		} else { 
			$(".outcomeBox").after(
				"//closerApp/views/page/partials/enquiries/finish_noSale", 
				{ outcomes: Closer.Models.Resolution.filterResolutionGroups({ group: el.val() })}
			);
		}
	},

	showHotOrNot: function(){
		this.element.find('.finishBox form').append('//closerApp/views/page/partials/enquiries/finish_hotOrNot', {});
	},

	".outcomeInput change":function(el, ev){
		if( this.element.find('.outcomeHotOrNot').length < 1 ){
			this.showHotOrNot();
		}
	},

	/**
	 * sets the hidden upsell field to bool value
	 * @param  {object} el element object
	 * @param  {object} ev event object
	 * @return {null}
	 */
	"input[name=outcomeUpsell] change":function(el, ev){
		var upsell = (this.element.find('input[name=outcomeUpsell]:checked').attr('rel') === "UPSELL") ? true : false;

		this.element.find('#upsell').val(upsell);

		console.log(upsell, "upsell");
	},

	".cmailAttachments .addAnotherAttachment click": function( el, ev ) {
		ev.preventDefault();
		Closer.Controllers.Page.Enquiries.cmailCounter++;
		el.parent().before( $.View('//closerApp/views/page/partials/enquiries/cmail/attachment', { number: Closer.Controllers.Page.Enquiries.cmailCounter } ));
	},

	".removeFile click": function( el, ev ) {
		ev.preventDefault();
		el.parent().remove();
	},

	/**
	 * Handles file uploads on file field change
	 * @param  {[type]} el [description]
	 * @param  {[type]} ev [description]
	 * @return {[type]}    [description]
	 */
	".cmailAttachment change": function( el, ev ) {
		if( Closer.Controllers.Application.getBrowserSupport('fileInputChangeEvent') ) {
			Closer.Controllers.Page.Enquiries.uploadAttachment({ element: el.closest('.cmailAttachmentField') });
			el.after("//closerApp/views/page/partials/enquiries/cmail/upload", {});
			el.closest('.cmailAttachmentField form').submit();
		}
	},

	/**
	 * Fallback method utilised by browsers not supporting the file input on change event
	 * @param  {object} el element object
	 * @param  {object} ev event object
	 * @return {null}
	 */
	".cmailAttachment click":function(el, ev) {

		// Will only run for browsers that dont support the native action
		if( !Closer.Controllers.Application.getBrowserSupport('fileInputChangeEvent') ) {
			//Works because if fil dialog opens, timeout does not trigger until dialog closes
			window.setTimeout(function() {
				if( el.val().length > 0 ) {
					Closer.Controllers.Page.Enquiries.uploadAttachment({ element: el.closest('.cmailAttachmentField') });
					el.after("//closerApp/views/page/partials/enquiries/cmail/upload", {});
					el.closest('.cmailAttachmentField form').submit();
					// alert(el.val() + " in ie<8");
				}
			},0);
		}
	}

	/* End Enquiry Specific Functions */

	

	/*

	function(called,passedParams) {
	   passedParams.callbackFunc({
	       firstArg: passedParams.dataParam1,
	       secondArg: passedParams.dataParam2
	   });
	});

	OpenAjax.hub.publish('modal.display',{
 		content: $.View('//closerApp/views/components/partials/route_add'),
 		callback: function(data) {
 			console.log(data);

 		}
 	});

	*/

});
