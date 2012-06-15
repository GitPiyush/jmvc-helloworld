// the semi-colon before function invocation is a safety net against concatenated 
// scripts and/or other plugins which may not be closed properly.
;(function ( $, window, document, undefined ) {

	// undefined is used here as the undefined global variable in ECMAScript 3 is
	// mutable (ie. it can be changed by someone else). undefined isn't really being
	// passed in so we can ensure the value of it is truly undefined. In ES5, undefined
	// can no longer be modified.

	// window and document are passed through as local variables rather than globals
	// as this (slightly) quickens the resolution process and can be more efficiently
	// minified (especially when both are regularly referenced in your plugin).

	// Create the defaults once
	var pluginName = 'autoclear',
		defaults = {
			activeClass:'autoclearActive'
		};

	// The actual plugin constructor
	function Plugin( element, options ) {
		this.element = element;
		this.$element = $(element);
		// jQuery has an extend method which merges the contents of two or 
		// more objects, storing the result in the first object. The first object
		// is generally empty as we don't want to alter the default options for
		// future instances of the plugin
		this.options = $.extend( {}, defaults, options) ;

		this._defaults = defaults;
		this._name = pluginName;

		this.init();
	}

	Plugin.prototype.init = function () {
		var self = this;
		this.autoclearVal = this.$element.val();

		// attach event handlers
		this.$element
		.addClass( this.options.activeClass )
		.bind({
			'focus':$.proxy(self.clear, self),
			'blur':$.proxy(self.restore, self)
		});

	};

	Plugin.prototype.clear = function() {
		if( this.$element.val() === this.autoclearVal ){
			this.$element.val('').removeClass( this.options.activeClass );
		}
	};

	Plugin.prototype.restore = function() {
		if( this.$element.val() === '' ){
			this.$element.val( this.autoclearVal ).addClass( this.options.activeClass );
		}
	};



	// A really lightweight plugin wrapper around the constructor, 
	// preventing against multiple instantiations
	$.fn[pluginName] = function ( options ) {
		return this.each(function () {
			if (!$.data(this, 'plugin_' + pluginName)) {
				$.data(this, 'plugin_' + pluginName, new Plugin( this, options ));
			}
		});
	}

})( jQuery, window, document );