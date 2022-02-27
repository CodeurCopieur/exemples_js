const scrollToY = (options) => {
	/*
	  ## description
	  Scroll to a y position

	  ## requires
	  * nothing

	  ## parameters
	  options object
	  * options.el - required - node or document to scroll
	  * options.offset - required - number, final scroll to position
	  * options.duration - optional - ms, defaults to 250
	  * options.easing - optional - "linear" (default) | "easeIn" | "easeOut" | "easeInOut"
	  * options.onComplete - optional - function to run on complete

	  ## returns
	  * nothing

	  ## example usage:
	  ```js
	  A17.Helpers.scroll_to_y({
		el: document,
		offset: 1000,
		duration: 250,
		easing: "linear",
		onComplete: function(){
		  console.log("complete!");
		}
	  });
	  ```
	*/

	var settings = {
		el: document,
		offset: 0,
		duration: 250,
		easing: "linear"
	};

	var start = Date.now();
	var from = 0;
	var is_document = false;

	var easingEquations = {
		// Easing functions taken from: https://gist.github.com/gre/1650294
		// -
		// no easing, no acceleration
		linear: function(t) {
			return t;
		},
		// accelerating from zero velocity
		easeIn: function(t) {
			return t * t * t;
		},
		// decelerating to zero velocity
		easeOut: function(t) {
			return (--t) * t * t + 1;
		},
		// acceleration until halfway, then deceleration
		easeInOut: function(t) {
			return t < .5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
		}
	};

	for (var def in options) {
		if (typeof options[def] !== 'undefined') {
			settings[def] = options[def];
		}
	}

	if (settings.el === document) {
		is_document = true;
		settings.el = document.documentElement.scrollTop ? document.documentElement : document.body;
	}

	from = settings.el.scrollTop;

	if (from === settings.offset) {
		return; // Prevent scrolling to the offset point if already there
	}

	function min(a, b) {
		return a < b ? a : b;
	}

	function scroll() {
		if (is_document && from === 0) {
			// eugh Firefox! (https://miketaylr.com/posts/2014/11/document-body-scrollTop.html)
			document.documentElement.scrollTop = 1;
			document.body.scrollTop = 1;
			from = 1;
			settings.el = document.documentElement.scrollTop ? document.documentElement : document.body;
			requestAnimationFrame(scroll);
		} else {
			var currentTime = Date.now();
			var time = min(1, ((currentTime - start) / settings.duration));
			var easedT = easingEquations[settings.easing](time);

			settings.el.scrollTop = (easedT * (settings.offset - from)) + from;

			if (time < 1) {
				requestAnimationFrame(scroll);
			} else {
				if ((typeof settings.onComplete).toLowerCase() === "function") {
					settings.onComplete.call(this);
				}
			}
		}
	}

	requestAnimationFrame(scroll);
};

export default scrollToY;