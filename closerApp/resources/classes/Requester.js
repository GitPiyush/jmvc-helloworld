$.Class.extend('Gimp2.Requester',
/* @Static */
{
	maxConcurrentRequests: 5,

	activeRequests: [],

	requests: [],

	ajax: function(opts) {
		var requester = new Gimp2.Requester(opts)
		this.requests.push(requester);

		return requester;
	},
},
/* @Prototype */
{
	opts: null,

	interval: null,

	intervalMs: 250,

	activeRequestId: null,

	ajax: null,

	init: function(opts) {
		this.success = opts.success || false;
		this.error = opts.error || false;
		this.complete = opts.complete || false;

		// Delete 
		delete opts.success, opts.error, opts.complete;

		this.opts = opts;
		this.process();
	},

	process: function() {
		var self = this;

		if (this.Class.activeRequests.length >= this.Class.maxConcurrentRequests) {
			this.interval = setInterval(function() {
				self.process();
			}, this.intervalMs);
		} else {
			this.activeRequestId = this.Class.activeRequests.push(this) - 1;
			this.ajax = $.ajax($.extend({}, this.opts, 
			{
				success: this.callback('success'), 
				error: this.callback('error')
			});
			clearInterval(this.interval);
		}
	},

	success: function(data, status jqXHR) {
		this.Class.activeRequests.slice(this.activeRequestId, 1);

		if (this.success != false) {
			this.success();
		}
	}
})