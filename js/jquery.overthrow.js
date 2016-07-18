/*
	Overthrow plugin
	v0.0.3
	Mike Harding
	
	A jQuery plugin to open a very simple modal using content from within the page or loaded via ajax.

	For usage see http://code.sneak.co.nz/overthrow/
*/

;(function($) {

	// Setup and utilities
	var namespace = 'overthrow';
	var logError = typeof console === 'undefined' ? function() {} : function( message ) { console.error( message ); };
	
	// Add custom easing
	$.easing.easeOutQuart = function (x, t, b, c, d) {
		return -c * ((t=t/d-1)*t*t*t - 1) + b;
	};
	
	$.support.transition = (function(){
		var thisBody = document.body || document.documentElement,
			thisStyle = thisBody.style,
			support = thisStyle.transition !== undefined || thisStyle.WebkitTransition !== undefined || thisStyle.MozTransition !== undefined || thisStyle.MsTransition !== undefined || thisStyle.OTransition !== undefined;
		return support;
	})();
	
	var Overthrow = function(element, options) {
		this.$el = $( element );
		this.options = $.extend( true, {}, this.defaults, options );
		this.container = '<div class="overthrow"><div class="overthrow-shield"></div><div class="overthrow-shim"></div><div class="overthrow-wrapper"><div class="overthrow-outer"><div class="overthrow-inner"><div class="overthrow-content"></div><a href="#" class="overthrow-close">Close</a></div></div></div></div>';
		this.hasTransitions = $.support.transition;
		this.transitionDuration = 200;
		this._init();
	};
	
	Overthrow.prototype = {
		defaults: {
			customClass: null,
			afterLoad: null,
			disableForTouch: false
		},
		
		_init: function() {
			var me = this;
			
			me.$window = $(window);
			me.$document = $(document);
			me.$body = $('body');
			me.touch = me._touchEnabled();
			
			me.$container = $(me.container);
			me.$content = me.$container.find('.overthrow-content');
			me.$close = me.$container.find('.overthrow-close');
			
			if ( me.options.customClass == null ) {
				me.options.customClass = me.$el.data('overthrow-class');
			}
			
			me.options.target = me.$el.attr('href');
			
			if ( me.hasTransitions ) {
				$('html').addClass('overthrow-transitions');
			}
			
			me._bindings();
		},
		
		_bindings: function() {
			var me = this;
			
			me.$el.on('click.' + namespace, function(ev) {
				if ( me.options.disableForTouch && me.touch ) {
					return;
				} else {
					ev.preventDefault();

					if ( me.options.customClass ) {
						me.$container.addClass(me.options.customClass);
					}

					me.checkScrollbar();
					me.setScrollbar();
					me.$body.addClass('overthrow-open');

					if ( me.options.target.substring(0,1) === '#' || me.options.target.substring(0,1) === '.' ) {
						return me.loadInline();
					} else {
						return me.loadAjax();
					}
				}
			});
		},
		
		loadInline: function() {
			var me = this;
			me.$content.html($('' + me.options.target).html());

			me.showOverthrow();
		},
		
		loadAjax: function() {
			var me = this;
			
			$.ajax({
				url: me.options.target,
				dataType: "html",
				success: function(data, status, request) {
					me.$content.html(data);

					me.showOverthrow();
				},
				error: function(request, status, error) {
					alert("Error: " + error);
					me.closeOverthrow();
				}
			});
		},
		
		showOverthrow: function() {
			var me = this;

			me.$body.append(me.$container);
			me.$body.addClass('overthrow-enable');

			me.$container.on("click", function(ev) {
				if ( $(ev.target).is( me.$close ) ) {
					// Clicked close button, so close
					ev.preventDefault();
					me.closeOverthrow();
				} else if ( $(ev.target).closest( me.$content ).length ) {
					// Clicked in content area, so ignore
				} else if ( $(ev.target).closest( me.$container ).length ) {
					// Clicked outside of content, so close
					me.closeOverthrow();
				}
			});
			
			if ( me.hasTransitions ) {
				setTimeout(function() {
					me.$body.addClass('overthrow-trans-in');
				}, 10);
				
				setTimeout(function() {
					me.$close.addClass('overthrow-close-active');
				}, me.options.duration);
			} else {
				me.$body.addClass('overthrow-show');
				me.$close.addClass('overthrow-close-active');
			}

			// Escape
			me.$document.on('keyup', function ( e ) {
				if (e.which === 27) {
					me.closeOverthrow();
				}
			});

			if( me.options.afterLoad ) {
				me.options.afterLoad(me);
			}

			me.$container.trigger("ajaxload");
		},
		
		/* Scrollbar functions below taken & modified from twitter bootstrap */
		checkScrollbar: function() {
			var me = this;
			
			var fullWindowWidth = window.innerWidth;
			
			if (!fullWindowWidth) { // workaround for missing window.innerWidth in IE8
				var documentElementRect = document.documentElement.getBoundingClientRect();
				fullWindowWidth = documentElementRect.right - Math.abs(documentElementRect.left);
			}
			
			me.bodyIsOverflowing = document.body.clientWidth < fullWindowWidth;
			me.scrollbarWidth = me.measureScrollbar();
		},
		
		setScrollbar: function() {
			var me = this;
			
			var bodyPad = parseInt((me.$body.css('padding-right') || 0), 10);
			me.originalBodyPad = document.body.style.paddingRight || '';
			
			if (me.bodyIsOverflowing) {
				me.$body.css('padding-right', bodyPad + me.scrollbarWidth);
			}
		},

		resetScrollbar: function() {
			var me = this;
			
			me.$body.css('padding-right', me.originalBodyPad);
		},

		measureScrollbar: function() { // thx walsh
			var me = this;
			
			var scrollDiv = document.createElement('div');
			scrollDiv.className = 'overflow-scrollbar-measure';
			me.$body.append(scrollDiv);
			
			var scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
			me.$body[0].removeChild(scrollDiv);
			
			return scrollbarWidth;
	    },
		
		_touchEnabled: function() {
			 return (('ontouchstart' in window) || (navigator.MaxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0));
		},
		
		option: function(opts) {
			if ( $.isPlainObject( opts ) ) {
				this.options = $.extend( true, this.options, opts );
			}
		},
		
		closeOverthrow: function() {
			var me = this;
			
			if ( me.hasTransitions ) {
				me.$body.removeClass('overthrow-trans-in').addClass('overthrow-trans-out');
				
				setTimeout(function() {
					me.$body.removeClass('overthrow-trans-out');
					me.$close.removeClass('overthrow-close-active');
					me.$content.html("");
					me.$body.addClass('overthrow-hide');
					setTimeout(function() {
						me.$body.removeClass('overthrow-enable');
						me.$body.removeClass('overthrow-hide');
						me.$body.removeClass('overthrow-open');
						me.resetScrollbar();
						me.$container.remove();
					}, me.transitionDuration);
				}, me.transitionDuration);
			} else {
				me.$close.removeClass('overthrow-close-active');
				me.$body.removeClass('overthrow-show');
				me.$content.html("");
				me.$body.addClass('overthrow-hide');
				me.$body.removeClass('overthrow-enable');
				me.$body.removeClass('overthrow-hide');
				me.$body.removeClass('overthrow-open');
				me.resetScrollbar();
				me.$container.remove();
			}
		}
	};
	
	$.fn[namespace] = function( options ) {
	
		if ( typeof options === 'string' ) {
			// call plugin method when first argument is a string
			// get arguments for method
			var args = Array.prototype.slice.call( arguments, 1 );

			for ( var i=0, len = this.length; i < len; i++ ) {
				var elem = this[i];
				var instance = $.data( elem, namespace );
				if ( !instance ) {
					logError( "cannot call methods on " + namespace + " prior to initialization; " +
					"attempted to call '" + options + "'" );
					continue;
				}
				if ( !$.isFunction( instance[options] ) || options.charAt(0) === '_' ) {
					logError( "no such method '" + options + "' for " + namespace + " instance" );
					continue;
				}

				// trigger method with arguments
				var returnValue = instance[ options ].apply( instance, args );

				// break look and return first value if provided
				if ( returnValue !== undefined ) {
					return returnValue;
				}
			}
			// return this if no return value
			return this;
		} else {
			return this.each( function() {
				var instance = $.data( this, namespace );
				if ( instance ) {
					// apply options & init
					instance.option( options || {} );
					instance._init();
				} else {
					// initialize new instance
					instance = new Overthrow( this, options );
					$.data( this, namespace, instance );
				}
			});
		}
	};
	
})(jQuery);