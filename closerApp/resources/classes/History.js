$.Class.extend('Tundra.History',
/* @Static */
{
	instance: null,
	
	setup: function() {
		var self = this;
		OpenAjax.hub.subscribe('Page.Started', function(eventName, controller)
		{
			try {
				var page = $('#domestic-bookings-main').controllers()[0].Class.shortName;
				if (page != 'Availability') { // Don't mess with the availability page
					var flowExecutionKey = $('#flowExecutionKey').val() || 'empty';
					self.getInstance().restoreStateCache(flowExecutionKey);
				}
			} catch(e) {
				// console.log('ERROR: There was an exception trying to restore the data from the page state cache - Exception:', e);
			}
		});
	},
	
	getInstance: function() {
		if (this.instance == null) {
			this.instance = new Tundra.History();
		}
		return this.instance;
	},
	
	get: function(key) {
		return this.getInstance().history.get(key);
	},
	
	addCache: function(flowExecutionKey, html) {
		return this.getInstance().addCache(flowExecutionKey, html);
	}
},
/** Prototype **/
{
	history: {},
	
	initialState: {},
	
	settings: {},
	
	cache: {},
	
	stateCache: {}, // TODO: this implementation needs to be finished.
	
	init: function(options) {
		var self = this,
			settings = Tundra.Models.Settings.getInstance().get('history');
		
		if (settings != 'undefined') {
			this.settings = settings;
		}
		
		YUI().use('history', function(Y) {
			self.initialState = Y.HistoryHash.parseHash();
			self.history = new Y.HistoryHash(self.initialState);
			
			Y.on('history:change', function(event) {
				self.hashChange(event);
			});
		});
	},
	
	hashChange: function(event) {
		try {
			OpenAjax.hub.publish('Tundra.History.HashChange', event);
		} catch(e) {
			OpenAjax.hub.publish('Application.Error',
			{
				type: 'Exception',
				reason: 'Unable to publish the Tundra.History.HashChange event.',
				message: 'The back button has broken, please use the navigation in the page instead of your browsers back/forward buttons.',
				level: 'Warning',
				exception: e
			});
		}
	},
	
	getCurrentStateKey: function() {
		return /(e[0-9]+)/.test(this.get('execution')) ? RegExp.$1 : false;
	},
	
	getCurrentExecutionKey: function() {
		return /e[0-9]+(s[0-9]+)/.test(this.get('execution')) ? RegExp.$1 : false;
	},
	
	// Get the current state cache for the page
	// @Note this is an async function that will wait for when it can find the #flowExecutionKey
	getCurrentStateCache: function() {
		var self = this;
		try {
			var controller = $('#domestic-bookings-main').controllers()[0],
				pageName = controller.Class.shortName,
				currentState = this.getInputs(),
				stateKey = /(e[0-9]+)/.test($('#flowExecutionKey').val()) ? RegExp.$1 : 'empty';
			
			handle = function() {
				if ($.type(self.stateCache[stateKey]) != 'object') {
					self.stateCache[stateKey] = {};
				}
				if (stateKey !== false) {
					self.stateCache[stateKey][pageName] = currentState;
				}
			};
			
			wait = function() {
				stateKey = /(e[0-9]+)/.test($('#flowExecutionKey').val()) ? RegExp.$1 : false;
				if (stateKey === false) {
					setTimeout(function() { wait(); }, 100);
				} else {
					handle();
				}
			};
			
			if (stateKey === false) {
				wait();
			} else {
				handle();
			}
		} catch(e) {
			OpenAjax.hub.publish('Application.Error',
			{
				step: pageName,
				type: 'Page cache has failed with messages',
				reason: 'Exception: ' + e
			});
		}
	},
	
	getInputs: function() {
		var foundInputs = $('input,select'),
			inputs = new Array(),
			cachedAlready = [];
		
		$.each(foundInputs, function()
		{
			var $i = $(this);
			
			if (!$i.hasClass('noCache')) {
				var type = $i.attr('type') || false,
					id = $i.attr('id') || false,
					name = $i.attr('name') || false,
					selector = (name !== false) ? ('[name='+ name.replace(/\./g,"\\\.").replace(/\[/g,"\\\[").replace(/\]/g,"\\\]") +']') : ('#'+id),
					$input = false;
				
				switch($i.attr('type')) {
					case 'radio':
					case 'checkbox':
						$input = $(selector+':checked');
						break;
					default:
						$input = $i;
						break;
				}
			
				if ($input !== false && $input.length == 1 && $.inArray(selector, cachedAlready) == -1) {
					var val = $input.val();
					
					if (val.length > 0) {
						inputs.push({
							selector: selector,
							type: $i.attr('type'),
							val: val
						});
						cachedAlready.push(selector);
					}
				}
			}
		});
		
		return inputs.length > 0 ? inputs : false;
	},
	
	restoreStateCache: function(flowExecutionKey) {
		var self = this,
			stateKey = /(e[0-9]+)/.test(flowExecutionKey) ? RegExp.$1 : 'empty',
			pageName = $('#domestic-bookings-main').controllers()[0].Class.shortName;
		
		if ($.type(this.stateCache[stateKey]) != 'undefined' && $.type(this.stateCache[stateKey][pageName]) != 'undefined') {
			$.each(this.stateCache[stateKey][pageName], function(i, input)
			{
				try {
					var $selector = $(input.selector);
					switch(input.type) {
						case 'radio':
							$.each($selector, function(i, f)
							{
								var $innerField = $(f);
								if ($innerField.val() == input.val) {
									$innerField.trigger('click');
									return false;
								}
							});
							break;
						case 'checkbox':
							$selector.trigger('click');
							break;
						default:
							$selector.val(input.val);
							break;
					}
				} catch(e){
					// console.log('Error trying to restore state cache', e);
				}
			});
		}
	},
	
	ajaxFlow: function(data, newFlow) {
		var newFlow = newFlow || false;
		var self = this;
		
		// Request the current active page controller to save its state in our cache.
		this.getCurrentStateCache();
		
		try {
			var flowExecutionKey = $(data).find('#flowExecutionKey').val(),
				pageName = $(data).find('#topContent').data('page');
			
			if ($.type(flowExecutionKey) != 'undefined' && flowExecutionKey != '' && $.type(pageName) != 'undefined' && pageName != '') {
				self.add({ execution: flowExecutionKey });
				
				if (pageName != 'Payment') { // Do not cache the payment page!
					
					// Check to see if we already have the cache for this html
					var cache = self.checkCache(flowExecutionKey);
					
					if (cache == false || $.type(cache) == 'undefined') {
						self.addCache(flowExecutionKey, data, pageName);
					}
				}
				return true;
			} else {
				// console.log('Error: Unable to find the #flowExecutionKey('+flowExecutionKey+')');
			}
		} catch(e) {
			// console.log('Error: While trying to set history @ SearchController ajax post - Exception:'+ e.toString());
		}
		return false;
	},
	
	/**
		function is here because it is used by the topContents_controller
	*/
	getFlowsByStateKey: function(stateKey) {
		var stateKey = stateKey || false,
			object = false;
		
		if (stateKey !== false) {
			object = $.getObject(stateKey, this.cache);
		}
		
		return object != 'undefined' ? object : false;
	},
	
	checkCache: function(flowExecutionKey) {
		var flowExecutionKey = flowExecutionKey || 'empty',
			stateKey = false,
			flowKey = false,
			object = false;
		
		if (flowExecutionKey != 'empty' && /(e[0-9]+)(s[0-9]+)/.test(flowExecutionKey)) {
			stateKey = RegExp.$1;
			flowKey = RegExp.$2;
		}
		
		if (stateKey !== false) {
			object = $.getObject(stateKey+'.'+flowKey, this.cache);
		} else if (flowExecutionKey === 'empty') {
			object = $.getObject(flowExecutionKey, this.cache);
		}
		
		return object != 'undefined' ? object : false;
	},
	
	addCache: function(flowExecutionKey, html, pageName) {
		var flowExecutionKey = flowExecutionKey || 'empty',
			pageName = pageName || $(html).find('#topContent').data('page'),
			html = html || false,
			stateKey = false,
			flowKey = false,
			cacheAdded = false;
			
		if (flowExecutionKey != 'empty' && /(e[0-9]+)(s[0-9]+)/.test(flowExecutionKey)) {
			stateKey = RegExp.$1;
			flowKey = RegExp.$2;
		}
		
		if (stateKey !== false) {
			// Make sure that the state key is an object
			if ($.type(this.cache[stateKey]) !== 'object') {
				this.cache[stateKey] = {};
			}
			
			// Item needs to be added to the cache
			if ($.type(this.cache[stateKey][flowKey]) !== 'object' && html !== false) {
				cacheAdded = true;
				this.cache[stateKey][flowKey] = {
					controller: pageName,
					html: html
				};
			}
		} else if ($.type(this.cache[flowExecutionKey]) == 'undefined' && html !== false && flowExecutionKey === 'empty') {
			cacheAdded = true;
			this.cache[flowExecutionKey] = {
				controller: pageName,
				html: html
			};
		}
		
		if (cacheAdded === true) {
			try {
				OpenAjax.hub.publish('Tundra.History.cacheUpdated', this);
			} catch(e) {
				OpenAjax.hub.publish('Application.Error',
				{
					type: 'Exception',
					reason: 'There was an exception while firing the cacheUpdated event.',
					exception: e
				});
			}
		}
	},
	
	// Function used to get the empty key cache
	getExecutionEmptyCache: function() {
		if ($.type(this.cache.empty) !== 'undefined') {
			return this.cache.empty;
		}
		
		return false;
	},
		
	get: function(key) {
		return this.history.get(key);
	},
	
	add: function(history) {
		this.history.add(history);
	},
	
	replace: function(history) {
		return this.history.replace(history);
	}
});