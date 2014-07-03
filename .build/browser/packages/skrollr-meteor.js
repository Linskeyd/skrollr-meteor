(function () {

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/skrollr-meteor/skrollr.js                                                                                  //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
/*!                                                                                                                    // 1
 * skrollr core                                                                                                        // 2
 *                                                                                                                     // 3
 * Alexander Prinzhorn - https://github.com/Prinzhorn/skrollr                                                          // 4
 *                                                                                                                     // 5
 * Free to use under terms of MIT license                                                                              // 6
 */                                                                                                                    // 7
(function(window, document, undefined) {                                                                               // 8
	'use strict';                                                                                                         // 9
                                                                                                                       // 10
	/*                                                                                                                    // 11
	 * Global api.                                                                                                        // 12
	 */                                                                                                                   // 13
	var skrollr = {                                                                                                       // 14
		get: function() {                                                                                                    // 15
			return _instance;                                                                                                   // 16
		},                                                                                                                   // 17
		//Main entry point.                                                                                                  // 18
		init: function(options) {                                                                                            // 19
			return _instance || new Skrollr(options);                                                                           // 20
		},                                                                                                                   // 21
		VERSION: '0.6.26'                                                                                                    // 22
	};                                                                                                                    // 23
                                                                                                                       // 24
	//Minify optimization.                                                                                                // 25
	var hasProp = Object.prototype.hasOwnProperty;                                                                        // 26
	var Math = window.Math;                                                                                               // 27
	var getStyle = window.getComputedStyle;                                                                               // 28
                                                                                                                       // 29
	//They will be filled when skrollr gets initialized.                                                                  // 30
	var documentElement;                                                                                                  // 31
	var body;                                                                                                             // 32
                                                                                                                       // 33
	var EVENT_TOUCHSTART = 'touchstart';                                                                                  // 34
	var EVENT_TOUCHMOVE = 'touchmove';                                                                                    // 35
	var EVENT_TOUCHCANCEL = 'touchcancel';                                                                                // 36
	var EVENT_TOUCHEND = 'touchend';                                                                                      // 37
                                                                                                                       // 38
	var SKROLLABLE_CLASS = 'skrollable';                                                                                  // 39
	var SKROLLABLE_BEFORE_CLASS = SKROLLABLE_CLASS + '-before';                                                           // 40
	var SKROLLABLE_BETWEEN_CLASS = SKROLLABLE_CLASS + '-between';                                                         // 41
	var SKROLLABLE_AFTER_CLASS = SKROLLABLE_CLASS + '-after';                                                             // 42
                                                                                                                       // 43
	var SKROLLR_CLASS = 'skrollr';                                                                                        // 44
	var NO_SKROLLR_CLASS = 'no-' + SKROLLR_CLASS;                                                                         // 45
	var SKROLLR_DESKTOP_CLASS = SKROLLR_CLASS + '-desktop';                                                               // 46
	var SKROLLR_MOBILE_CLASS = SKROLLR_CLASS + '-mobile';                                                                 // 47
                                                                                                                       // 48
	var DEFAULT_EASING = 'linear';                                                                                        // 49
	var DEFAULT_DURATION = 1000;//ms                                                                                      // 50
	var DEFAULT_MOBILE_DECELERATION = 0.004;//pixel/ms²                                                                   // 51
                                                                                                                       // 52
	var DEFAULT_SMOOTH_SCROLLING_DURATION = 200;//ms                                                                      // 53
                                                                                                                       // 54
	var ANCHOR_START = 'start';                                                                                           // 55
	var ANCHOR_END = 'end';                                                                                               // 56
	var ANCHOR_CENTER = 'center';                                                                                         // 57
	var ANCHOR_BOTTOM = 'bottom';                                                                                         // 58
                                                                                                                       // 59
	//The property which will be added to the DOM element to hold the ID of the skrollable.                               // 60
	var SKROLLABLE_ID_DOM_PROPERTY = '___skrollable_id';                                                                  // 61
                                                                                                                       // 62
	var rxTouchIgnoreTags = /^(?:input|textarea|button|select)$/i;                                                        // 63
                                                                                                                       // 64
	var rxTrim = /^\s+|\s+$/g;                                                                                            // 65
                                                                                                                       // 66
	//Find all data-attributes. data-[_constant]-[offset]-[anchor]-[anchor].                                              // 67
	var rxKeyframeAttribute = /^data(?:-(_\w+))?(?:-?(-?\d*\.?\d+p?))?(?:-?(start|end|top|center|bottom))?(?:-?(top|center|bottom))?$/;
                                                                                                                       // 69
	var rxPropValue = /\s*(@?[\w\-\[\]]+)\s*:\s*(.+?)\s*(?:;|$)/gi;                                                       // 70
                                                                                                                       // 71
	//Easing function names follow the property in square brackets.                                                       // 72
	var rxPropEasing = /^(@?[a-z\-]+)\[(\w+)\]$/;                                                                         // 73
                                                                                                                       // 74
	var rxCamelCase = /-([a-z0-9_])/g;                                                                                    // 75
	var rxCamelCaseFn = function(str, letter) {                                                                           // 76
		return letter.toUpperCase();                                                                                         // 77
	};                                                                                                                    // 78
                                                                                                                       // 79
	//Numeric values with optional sign.                                                                                  // 80
	var rxNumericValue = /[\-+]?[\d]*\.?[\d]+/g;                                                                          // 81
                                                                                                                       // 82
	//Used to replace occurences of {?} with a number.                                                                    // 83
	var rxInterpolateString = /\{\?\}/g;                                                                                  // 84
                                                                                                                       // 85
	//Finds rgb(a) colors, which don't use the percentage notation.                                                       // 86
	var rxRGBAIntegerColor = /rgba?\(\s*-?\d+\s*,\s*-?\d+\s*,\s*-?\d+/g;                                                  // 87
                                                                                                                       // 88
	//Finds all gradients.                                                                                                // 89
	var rxGradient = /[a-z\-]+-gradient/g;                                                                                // 90
                                                                                                                       // 91
	//Vendor prefix. Will be set once skrollr gets initialized.                                                           // 92
	var theCSSPrefix = '';                                                                                                // 93
	var theDashedCSSPrefix = '';                                                                                          // 94
                                                                                                                       // 95
	//Will be called once (when skrollr gets initialized).                                                                // 96
	var detectCSSPrefix = function() {                                                                                    // 97
		//Only relevant prefixes. May be extended.                                                                           // 98
		//Could be dangerous if there will ever be a CSS property which actually starts with "ms". Don't hope so.            // 99
		var rxPrefixes = /^(?:O|Moz|webkit|ms)|(?:-(?:o|moz|webkit|ms)-)/;                                                   // 100
                                                                                                                       // 101
		//Detect prefix for current browser by finding the first property using a prefix.                                    // 102
		if(!getStyle) {                                                                                                      // 103
			return;                                                                                                             // 104
		}                                                                                                                    // 105
                                                                                                                       // 106
		var style = getStyle(body, null);                                                                                    // 107
                                                                                                                       // 108
		for(var k in style) {                                                                                                // 109
			//We check the key and if the key is a number, we check the value as well, because safari's getComputedStyle returns some weird array-like thingy.
			theCSSPrefix = (k.match(rxPrefixes) || (+k == k && style[k].match(rxPrefixes)));                                    // 111
                                                                                                                       // 112
			if(theCSSPrefix) {                                                                                                  // 113
				break;                                                                                                             // 114
			}                                                                                                                   // 115
		}                                                                                                                    // 116
                                                                                                                       // 117
		//Did we even detect a prefix?                                                                                       // 118
		if(!theCSSPrefix) {                                                                                                  // 119
			theCSSPrefix = theDashedCSSPrefix = '';                                                                             // 120
                                                                                                                       // 121
			return;                                                                                                             // 122
		}                                                                                                                    // 123
                                                                                                                       // 124
		theCSSPrefix = theCSSPrefix[0];                                                                                      // 125
                                                                                                                       // 126
		//We could have detected either a dashed prefix or this camelCaseish-inconsistent stuff.                             // 127
		if(theCSSPrefix.slice(0,1) === '-') {                                                                                // 128
			theDashedCSSPrefix = theCSSPrefix;                                                                                  // 129
                                                                                                                       // 130
			//There's no logic behind these. Need a look up.                                                                    // 131
			theCSSPrefix = ({                                                                                                   // 132
				'-webkit-': 'webkit',                                                                                              // 133
				'-moz-': 'Moz',                                                                                                    // 134
				'-ms-': 'ms',                                                                                                      // 135
				'-o-': 'O'                                                                                                         // 136
			})[theCSSPrefix];                                                                                                   // 137
		} else {                                                                                                             // 138
			theDashedCSSPrefix = '-' + theCSSPrefix.toLowerCase() + '-';                                                        // 139
		}                                                                                                                    // 140
	};                                                                                                                    // 141
                                                                                                                       // 142
	var polyfillRAF = function() {                                                                                        // 143
		var requestAnimFrame = window.requestAnimationFrame || window[theCSSPrefix.toLowerCase() + 'RequestAnimationFrame']; // 144
                                                                                                                       // 145
		var lastTime = _now();                                                                                               // 146
                                                                                                                       // 147
		if(_isMobile || !requestAnimFrame) {                                                                                 // 148
			requestAnimFrame = function(callback) {                                                                             // 149
				//How long did it take to render?                                                                                  // 150
				var deltaTime = _now() - lastTime;                                                                                 // 151
				var delay = Math.max(0, 1000 / 60 - deltaTime);                                                                    // 152
                                                                                                                       // 153
				return window.setTimeout(function() {                                                                              // 154
					lastTime = _now();                                                                                                // 155
					callback();                                                                                                       // 156
				}, delay);                                                                                                         // 157
			};                                                                                                                  // 158
		}                                                                                                                    // 159
                                                                                                                       // 160
		return requestAnimFrame;                                                                                             // 161
	};                                                                                                                    // 162
                                                                                                                       // 163
	var polyfillCAF = function() {                                                                                        // 164
		var cancelAnimFrame = window.cancelAnimationFrame || window[theCSSPrefix.toLowerCase() + 'CancelAnimationFrame'];    // 165
                                                                                                                       // 166
		if(_isMobile || !cancelAnimFrame) {                                                                                  // 167
			cancelAnimFrame = function(timeout) {                                                                               // 168
				return window.clearTimeout(timeout);                                                                               // 169
			};                                                                                                                  // 170
		}                                                                                                                    // 171
                                                                                                                       // 172
		return cancelAnimFrame;                                                                                              // 173
	};                                                                                                                    // 174
                                                                                                                       // 175
	//Built-in easing functions.                                                                                          // 176
	var easings = {                                                                                                       // 177
		begin: function() {                                                                                                  // 178
			return 0;                                                                                                           // 179
		},                                                                                                                   // 180
		end: function() {                                                                                                    // 181
			return 1;                                                                                                           // 182
		},                                                                                                                   // 183
		linear: function(p) {                                                                                                // 184
			return p;                                                                                                           // 185
		},                                                                                                                   // 186
		quadratic: function(p) {                                                                                             // 187
			return p * p;                                                                                                       // 188
		},                                                                                                                   // 189
		cubic: function(p) {                                                                                                 // 190
			return p * p * p;                                                                                                   // 191
		},                                                                                                                   // 192
		swing: function(p) {                                                                                                 // 193
			return (-Math.cos(p * Math.PI) / 2) + 0.5;                                                                          // 194
		},                                                                                                                   // 195
		sqrt: function(p) {                                                                                                  // 196
			return Math.sqrt(p);                                                                                                // 197
		},                                                                                                                   // 198
		outCubic: function(p) {                                                                                              // 199
			return (Math.pow((p - 1), 3) + 1);                                                                                  // 200
		},                                                                                                                   // 201
		//see https://www.desmos.com/calculator/tbr20s8vd2 for how I did this                                                // 202
		bounce: function(p) {                                                                                                // 203
			var a;                                                                                                              // 204
                                                                                                                       // 205
			if(p <= 0.5083) {                                                                                                   // 206
				a = 3;                                                                                                             // 207
			} else if(p <= 0.8489) {                                                                                            // 208
				a = 9;                                                                                                             // 209
			} else if(p <= 0.96208) {                                                                                           // 210
				a = 27;                                                                                                            // 211
			} else if(p <= 0.99981) {                                                                                           // 212
				a = 91;                                                                                                            // 213
			} else {                                                                                                            // 214
				return 1;                                                                                                          // 215
			}                                                                                                                   // 216
                                                                                                                       // 217
			return 1 - Math.abs(3 * Math.cos(p * a * 1.028) / a);                                                               // 218
		}                                                                                                                    // 219
	};                                                                                                                    // 220
                                                                                                                       // 221
	/**                                                                                                                   // 222
	 * Constructor.                                                                                                       // 223
	 */                                                                                                                   // 224
	function Skrollr(options) {                                                                                           // 225
		documentElement = document.documentElement;                                                                          // 226
		body = document.body;                                                                                                // 227
                                                                                                                       // 228
		detectCSSPrefix();                                                                                                   // 229
                                                                                                                       // 230
		_instance = this;                                                                                                    // 231
                                                                                                                       // 232
		options = options || {};                                                                                             // 233
                                                                                                                       // 234
		_constants = options.constants || {};                                                                                // 235
                                                                                                                       // 236
		//We allow defining custom easings or overwrite existing.                                                            // 237
		if(options.easing) {                                                                                                 // 238
			for(var e in options.easing) {                                                                                      // 239
				easings[e] = options.easing[e];                                                                                    // 240
			}                                                                                                                   // 241
		}                                                                                                                    // 242
                                                                                                                       // 243
		_edgeStrategy = options.edgeStrategy || 'set';                                                                       // 244
                                                                                                                       // 245
		_listeners = {                                                                                                       // 246
			//Function to be called right before rendering.                                                                     // 247
			beforerender: options.beforerender,                                                                                 // 248
                                                                                                                       // 249
			//Function to be called right after finishing rendering.                                                            // 250
			render: options.render,                                                                                             // 251
                                                                                                                       // 252
			//Function to be called whenever an element with the `data-emit-events` attribute passes a keyframe.                // 253
			keyframe: options.keyframe                                                                                          // 254
		};                                                                                                                   // 255
                                                                                                                       // 256
		//forceHeight is true by default                                                                                     // 257
		_forceHeight = options.forceHeight !== false;                                                                        // 258
                                                                                                                       // 259
		if(_forceHeight) {                                                                                                   // 260
			_scale = options.scale || 1;                                                                                        // 261
		}                                                                                                                    // 262
                                                                                                                       // 263
		_mobileDeceleration = options.mobileDeceleration || DEFAULT_MOBILE_DECELERATION;                                     // 264
                                                                                                                       // 265
		_smoothScrollingEnabled = options.smoothScrolling !== false;                                                         // 266
		_smoothScrollingDuration = options.smoothScrollingDuration || DEFAULT_SMOOTH_SCROLLING_DURATION;                     // 267
                                                                                                                       // 268
		//Dummy object. Will be overwritten in the _render method when smooth scrolling is calculated.                       // 269
		_smoothScrolling = {                                                                                                 // 270
			targetTop: _instance.getScrollTop()                                                                                 // 271
		};                                                                                                                   // 272
                                                                                                                       // 273
		//A custom check function may be passed.                                                                             // 274
		_isMobile = ((options.mobileCheck || function() {                                                                    // 275
			return (/Android|iPhone|iPad|iPod|BlackBerry/i).test(navigator.userAgent || navigator.vendor || window.opera);      // 276
		})());                                                                                                               // 277
                                                                                                                       // 278
		if(_isMobile) {                                                                                                      // 279
			_skrollrBody = document.getElementById('skrollr-body');                                                             // 280
                                                                                                                       // 281
			//Detect 3d transform if there's a skrollr-body (only needed for #skrollr-body).                                    // 282
			if(_skrollrBody) {                                                                                                  // 283
				_detect3DTransforms();                                                                                             // 284
			}                                                                                                                   // 285
                                                                                                                       // 286
			_initMobile();                                                                                                      // 287
			_updateClass(documentElement, [SKROLLR_CLASS, SKROLLR_MOBILE_CLASS], [NO_SKROLLR_CLASS]);                           // 288
		} else {                                                                                                             // 289
			_updateClass(documentElement, [SKROLLR_CLASS, SKROLLR_DESKTOP_CLASS], [NO_SKROLLR_CLASS]);                          // 290
		}                                                                                                                    // 291
                                                                                                                       // 292
		//Triggers parsing of elements and a first reflow.                                                                   // 293
		_instance.refresh();                                                                                                 // 294
                                                                                                                       // 295
		_addEvent(window, 'resize orientationchange', function() {                                                           // 296
			var width = documentElement.clientWidth;                                                                            // 297
			var height = documentElement.clientHeight;                                                                          // 298
                                                                                                                       // 299
			//Only reflow if the size actually changed (#271).                                                                  // 300
			if(height !== _lastViewportHeight || width !== _lastViewportWidth) {                                                // 301
				_lastViewportHeight = height;                                                                                      // 302
				_lastViewportWidth = width;                                                                                        // 303
                                                                                                                       // 304
				_requestReflow = true;                                                                                             // 305
			}                                                                                                                   // 306
		});                                                                                                                  // 307
                                                                                                                       // 308
		var requestAnimFrame = polyfillRAF();                                                                                // 309
                                                                                                                       // 310
		//Let's go.                                                                                                          // 311
		(function animloop(){                                                                                                // 312
			_render();                                                                                                          // 313
			_animFrame = requestAnimFrame(animloop);                                                                            // 314
		}());                                                                                                                // 315
                                                                                                                       // 316
		return _instance;                                                                                                    // 317
	}                                                                                                                     // 318
                                                                                                                       // 319
	/**                                                                                                                   // 320
	 * (Re)parses some or all elements.                                                                                   // 321
	 */                                                                                                                   // 322
	Skrollr.prototype.refresh = function(elements) {                                                                      // 323
		var elementIndex;                                                                                                    // 324
		var elementsLength;                                                                                                  // 325
		var ignoreID = false;                                                                                                // 326
                                                                                                                       // 327
		//Completely reparse anything without argument.                                                                      // 328
		if(elements === undefined) {                                                                                         // 329
			//Ignore that some elements may already have a skrollable ID.                                                       // 330
			ignoreID = true;                                                                                                    // 331
                                                                                                                       // 332
			_skrollables = [];                                                                                                  // 333
			_skrollableIdCounter = 0;                                                                                           // 334
                                                                                                                       // 335
			elements = document.getElementsByTagName('*');                                                                      // 336
		} else if(elements.length === undefined) {                                                                           // 337
			//We also accept a single element as parameter.                                                                     // 338
			elements = [elements];                                                                                              // 339
		}                                                                                                                    // 340
                                                                                                                       // 341
		elementIndex = 0;                                                                                                    // 342
		elementsLength = elements.length;                                                                                    // 343
                                                                                                                       // 344
		for(; elementIndex < elementsLength; elementIndex++) {                                                               // 345
			var el = elements[elementIndex];                                                                                    // 346
			var anchorTarget = el;                                                                                              // 347
			var keyFrames = [];                                                                                                 // 348
                                                                                                                       // 349
			//If this particular element should be smooth scrolled.                                                             // 350
			var smoothScrollThis = _smoothScrollingEnabled;                                                                     // 351
                                                                                                                       // 352
			//The edge strategy for this particular element.                                                                    // 353
			var edgeStrategy = _edgeStrategy;                                                                                   // 354
                                                                                                                       // 355
			//If this particular element should emit keyframe events.                                                           // 356
			var emitEvents = false;                                                                                             // 357
                                                                                                                       // 358
			//If we're reseting the counter, remove any old element ids that may be hanging around.                             // 359
			if(ignoreID && SKROLLABLE_ID_DOM_PROPERTY in el) {                                                                  // 360
				delete el[SKROLLABLE_ID_DOM_PROPERTY];                                                                             // 361
			}                                                                                                                   // 362
                                                                                                                       // 363
			if(!el.attributes) {                                                                                                // 364
				continue;                                                                                                          // 365
			}                                                                                                                   // 366
                                                                                                                       // 367
			//Iterate over all attributes and search for key frame attributes.                                                  // 368
			var attributeIndex = 0;                                                                                             // 369
			var attributesLength = el.attributes.length;                                                                        // 370
                                                                                                                       // 371
			for (; attributeIndex < attributesLength; attributeIndex++) {                                                       // 372
				var attr = el.attributes[attributeIndex];                                                                          // 373
                                                                                                                       // 374
				if(attr.name === 'data-anchor-target') {                                                                           // 375
					anchorTarget = document.querySelector(attr.value);                                                                // 376
                                                                                                                       // 377
					if(anchorTarget === null) {                                                                                       // 378
						throw 'Unable to find anchor target "' + attr.value + '"';                                                       // 379
					}                                                                                                                 // 380
                                                                                                                       // 381
					continue;                                                                                                         // 382
				}                                                                                                                  // 383
                                                                                                                       // 384
				//Global smooth scrolling can be overridden by the element attribute.                                              // 385
				if(attr.name === 'data-smooth-scrolling') {                                                                        // 386
					smoothScrollThis = attr.value !== 'off';                                                                          // 387
                                                                                                                       // 388
					continue;                                                                                                         // 389
				}                                                                                                                  // 390
                                                                                                                       // 391
				//Global edge strategy can be overridden by the element attribute.                                                 // 392
				if(attr.name === 'data-edge-strategy') {                                                                           // 393
					edgeStrategy = attr.value;                                                                                        // 394
                                                                                                                       // 395
					continue;                                                                                                         // 396
				}                                                                                                                  // 397
                                                                                                                       // 398
				//Is this element tagged with the `data-emit-events` attribute?                                                    // 399
				if(attr.name === 'data-emit-events') {                                                                             // 400
					emitEvents = true;                                                                                                // 401
                                                                                                                       // 402
					continue;                                                                                                         // 403
				}                                                                                                                  // 404
                                                                                                                       // 405
				var match = attr.name.match(rxKeyframeAttribute);                                                                  // 406
                                                                                                                       // 407
				if(match === null) {                                                                                               // 408
					continue;                                                                                                         // 409
				}                                                                                                                  // 410
                                                                                                                       // 411
				var kf = {                                                                                                         // 412
					props: attr.value,                                                                                                // 413
					//Point back to the element as well.                                                                              // 414
					element: el,                                                                                                      // 415
					//The name of the event which this keyframe will fire, if emitEvents is                                           // 416
					eventType: attr.name.replace(rxCamelCase, rxCamelCaseFn)                                                          // 417
				};                                                                                                                 // 418
                                                                                                                       // 419
				keyFrames.push(kf);                                                                                                // 420
                                                                                                                       // 421
				var constant = match[1];                                                                                           // 422
                                                                                                                       // 423
				if(constant) {                                                                                                     // 424
					//Strip the underscore prefix.                                                                                    // 425
					kf.constant = constant.substr(1);                                                                                 // 426
				}                                                                                                                  // 427
                                                                                                                       // 428
				//Get the key frame offset.                                                                                        // 429
				var offset = match[2];                                                                                             // 430
                                                                                                                       // 431
				//Is it a percentage offset?                                                                                       // 432
				if(/p$/.test(offset)) {                                                                                            // 433
					kf.isPercentage = true;                                                                                           // 434
					kf.offset = (offset.slice(0, -1) | 0) / 100;                                                                      // 435
				} else {                                                                                                           // 436
					kf.offset = (offset | 0);                                                                                         // 437
				}                                                                                                                  // 438
                                                                                                                       // 439
				var anchor1 = match[3];                                                                                            // 440
                                                                                                                       // 441
				//If second anchor is not set, the first will be taken for both.                                                   // 442
				var anchor2 = match[4] || anchor1;                                                                                 // 443
                                                                                                                       // 444
				//"absolute" (or "classic") mode, where numbers mean absolute scroll offset.                                       // 445
				if(!anchor1 || anchor1 === ANCHOR_START || anchor1 === ANCHOR_END) {                                               // 446
					kf.mode = 'absolute';                                                                                             // 447
                                                                                                                       // 448
					//data-end needs to be calculated after all key frames are known.                                                 // 449
					if(anchor1 === ANCHOR_END) {                                                                                      // 450
						kf.isEnd = true;                                                                                                 // 451
					} else if(!kf.isPercentage) {                                                                                     // 452
						//For data-start we can already set the key frame w/o calculations.                                              // 453
						//#59: "scale" options should only affect absolute mode.                                                         // 454
						kf.offset = kf.offset * _scale;                                                                                  // 455
					}                                                                                                                 // 456
				}                                                                                                                  // 457
				//"relative" mode, where numbers are relative to anchors.                                                          // 458
				else {                                                                                                             // 459
					kf.mode = 'relative';                                                                                             // 460
					kf.anchors = [anchor1, anchor2];                                                                                  // 461
				}                                                                                                                  // 462
			}                                                                                                                   // 463
                                                                                                                       // 464
			//Does this element have key frames?                                                                                // 465
			if(!keyFrames.length) {                                                                                             // 466
				continue;                                                                                                          // 467
			}                                                                                                                   // 468
                                                                                                                       // 469
			//Will hold the original style and class attributes before we controlled the element (see #80).                     // 470
			var styleAttr, classAttr;                                                                                           // 471
                                                                                                                       // 472
			var id;                                                                                                             // 473
                                                                                                                       // 474
			if(!ignoreID && SKROLLABLE_ID_DOM_PROPERTY in el) {                                                                 // 475
				//We already have this element under control. Grab the corresponding skrollable id.                                // 476
				id = el[SKROLLABLE_ID_DOM_PROPERTY];                                                                               // 477
				styleAttr = _skrollables[id].styleAttr;                                                                            // 478
				classAttr = _skrollables[id].classAttr;                                                                            // 479
			} else {                                                                                                            // 480
				//It's an unknown element. Asign it a new skrollable id.                                                           // 481
				id = (el[SKROLLABLE_ID_DOM_PROPERTY] = _skrollableIdCounter++);                                                    // 482
				styleAttr = el.style.cssText;                                                                                      // 483
				classAttr = _getClass(el);                                                                                         // 484
			}                                                                                                                   // 485
                                                                                                                       // 486
			_skrollables[id] = {                                                                                                // 487
				element: el,                                                                                                       // 488
				styleAttr: styleAttr,                                                                                              // 489
				classAttr: classAttr,                                                                                              // 490
				anchorTarget: anchorTarget,                                                                                        // 491
				keyFrames: keyFrames,                                                                                              // 492
				smoothScrolling: smoothScrollThis,                                                                                 // 493
				edgeStrategy: edgeStrategy,                                                                                        // 494
				emitEvents: emitEvents,                                                                                            // 495
				lastFrameIndex: -1                                                                                                 // 496
			};                                                                                                                  // 497
                                                                                                                       // 498
			_updateClass(el, [SKROLLABLE_CLASS], []);                                                                           // 499
		}                                                                                                                    // 500
                                                                                                                       // 501
		//Reflow for the first time.                                                                                         // 502
		_reflow();                                                                                                           // 503
                                                                                                                       // 504
		//Now that we got all key frame numbers right, actually parse the properties.                                        // 505
		elementIndex = 0;                                                                                                    // 506
		elementsLength = elements.length;                                                                                    // 507
                                                                                                                       // 508
		for(; elementIndex < elementsLength; elementIndex++) {                                                               // 509
			var sk = _skrollables[elements[elementIndex][SKROLLABLE_ID_DOM_PROPERTY]];                                          // 510
                                                                                                                       // 511
			if(sk === undefined) {                                                                                              // 512
				continue;                                                                                                          // 513
			}                                                                                                                   // 514
                                                                                                                       // 515
			//Parse the property string to objects                                                                              // 516
			_parseProps(sk);                                                                                                    // 517
                                                                                                                       // 518
			//Fill key frames with missing properties from left and right                                                       // 519
			_fillProps(sk);                                                                                                     // 520
		}                                                                                                                    // 521
                                                                                                                       // 522
		return _instance;                                                                                                    // 523
	};                                                                                                                    // 524
                                                                                                                       // 525
	/**                                                                                                                   // 526
	 * Transform "relative" mode to "absolute" mode.                                                                      // 527
	 * That is, calculate anchor position and offset of element.                                                          // 528
	 */                                                                                                                   // 529
	Skrollr.prototype.relativeToAbsolute = function(element, viewportAnchor, elementAnchor) {                             // 530
		var viewportHeight = documentElement.clientHeight;                                                                   // 531
		var box = element.getBoundingClientRect();                                                                           // 532
		var absolute = box.top;                                                                                              // 533
                                                                                                                       // 534
		//#100: IE doesn't supply "height" with getBoundingClientRect.                                                       // 535
		var boxHeight = box.bottom - box.top;                                                                                // 536
                                                                                                                       // 537
		if(viewportAnchor === ANCHOR_BOTTOM) {                                                                               // 538
			absolute -= viewportHeight;                                                                                         // 539
		} else if(viewportAnchor === ANCHOR_CENTER) {                                                                        // 540
			absolute -= viewportHeight / 2;                                                                                     // 541
		}                                                                                                                    // 542
                                                                                                                       // 543
		if(elementAnchor === ANCHOR_BOTTOM) {                                                                                // 544
			absolute += boxHeight;                                                                                              // 545
		} else if(elementAnchor === ANCHOR_CENTER) {                                                                         // 546
			absolute += boxHeight / 2;                                                                                          // 547
		}                                                                                                                    // 548
                                                                                                                       // 549
		//Compensate scrolling since getBoundingClientRect is relative to viewport.                                          // 550
		absolute += _instance.getScrollTop();                                                                                // 551
                                                                                                                       // 552
		return (absolute + 0.5) | 0;                                                                                         // 553
	};                                                                                                                    // 554
                                                                                                                       // 555
	/**                                                                                                                   // 556
	 * Animates scroll top to new position.                                                                               // 557
	 */                                                                                                                   // 558
	Skrollr.prototype.animateTo = function(top, options) {                                                                // 559
		options = options || {};                                                                                             // 560
                                                                                                                       // 561
		var now = _now();                                                                                                    // 562
		var scrollTop = _instance.getScrollTop();                                                                            // 563
                                                                                                                       // 564
		//Setting this to a new value will automatically cause the current animation to stop, if any.                        // 565
		_scrollAnimation = {                                                                                                 // 566
			startTop: scrollTop,                                                                                                // 567
			topDiff: top - scrollTop,                                                                                           // 568
			targetTop: top,                                                                                                     // 569
			duration: options.duration || DEFAULT_DURATION,                                                                     // 570
			startTime: now,                                                                                                     // 571
			endTime: now + (options.duration || DEFAULT_DURATION),                                                              // 572
			easing: easings[options.easing || DEFAULT_EASING],                                                                  // 573
			done: options.done                                                                                                  // 574
		};                                                                                                                   // 575
                                                                                                                       // 576
		//Don't queue the animation if there's nothing to animate.                                                           // 577
		if(!_scrollAnimation.topDiff) {                                                                                      // 578
			if(_scrollAnimation.done) {                                                                                         // 579
				_scrollAnimation.done.call(_instance, false);                                                                      // 580
			}                                                                                                                   // 581
                                                                                                                       // 582
			_scrollAnimation = undefined;                                                                                       // 583
		}                                                                                                                    // 584
                                                                                                                       // 585
		return _instance;                                                                                                    // 586
	};                                                                                                                    // 587
                                                                                                                       // 588
	/**                                                                                                                   // 589
	 * Stops animateTo animation.                                                                                         // 590
	 */                                                                                                                   // 591
	Skrollr.prototype.stopAnimateTo = function() {                                                                        // 592
		if(_scrollAnimation && _scrollAnimation.done) {                                                                      // 593
			_scrollAnimation.done.call(_instance, true);                                                                        // 594
		}                                                                                                                    // 595
                                                                                                                       // 596
		_scrollAnimation = undefined;                                                                                        // 597
	};                                                                                                                    // 598
                                                                                                                       // 599
	/**                                                                                                                   // 600
	 * Returns if an animation caused by animateTo is currently running.                                                  // 601
	 */                                                                                                                   // 602
	Skrollr.prototype.isAnimatingTo = function() {                                                                        // 603
		return !!_scrollAnimation;                                                                                           // 604
	};                                                                                                                    // 605
                                                                                                                       // 606
	Skrollr.prototype.isMobile = function() {                                                                             // 607
		return _isMobile;                                                                                                    // 608
	};                                                                                                                    // 609
                                                                                                                       // 610
	Skrollr.prototype.setScrollTop = function(top, force) {                                                               // 611
		_forceRender = (force === true);                                                                                     // 612
                                                                                                                       // 613
		if(_isMobile) {                                                                                                      // 614
			_mobileOffset = Math.min(Math.max(top, 0), _maxKeyFrame);                                                           // 615
		} else {                                                                                                             // 616
			window.scrollTo(0, top);                                                                                            // 617
		}                                                                                                                    // 618
                                                                                                                       // 619
		return _instance;                                                                                                    // 620
	};                                                                                                                    // 621
                                                                                                                       // 622
	Skrollr.prototype.getScrollTop = function() {                                                                         // 623
		if(_isMobile) {                                                                                                      // 624
			return _mobileOffset;                                                                                               // 625
		} else {                                                                                                             // 626
			return window.pageYOffset || documentElement.scrollTop || body.scrollTop || 0;                                      // 627
		}                                                                                                                    // 628
	};                                                                                                                    // 629
                                                                                                                       // 630
	Skrollr.prototype.getMaxScrollTop = function() {                                                                      // 631
		return _maxKeyFrame;                                                                                                 // 632
	};                                                                                                                    // 633
                                                                                                                       // 634
	Skrollr.prototype.on = function(name, fn) {                                                                           // 635
		_listeners[name] = fn;                                                                                               // 636
                                                                                                                       // 637
		return _instance;                                                                                                    // 638
	};                                                                                                                    // 639
                                                                                                                       // 640
	Skrollr.prototype.off = function(name) {                                                                              // 641
		delete _listeners[name];                                                                                             // 642
                                                                                                                       // 643
		return _instance;                                                                                                    // 644
	};                                                                                                                    // 645
                                                                                                                       // 646
	Skrollr.prototype.destroy = function() {                                                                              // 647
		var cancelAnimFrame = polyfillCAF();                                                                                 // 648
		cancelAnimFrame(_animFrame);                                                                                         // 649
		_removeAllEvents();                                                                                                  // 650
                                                                                                                       // 651
		_updateClass(documentElement, [NO_SKROLLR_CLASS], [SKROLLR_CLASS, SKROLLR_DESKTOP_CLASS, SKROLLR_MOBILE_CLASS]);     // 652
                                                                                                                       // 653
		var skrollableIndex = 0;                                                                                             // 654
		var skrollablesLength = _skrollables.length;                                                                         // 655
                                                                                                                       // 656
		for(; skrollableIndex < skrollablesLength; skrollableIndex++) {                                                      // 657
			_reset(_skrollables[skrollableIndex].element);                                                                      // 658
		}                                                                                                                    // 659
                                                                                                                       // 660
		documentElement.style.overflow = body.style.overflow = '';                                                           // 661
		documentElement.style.height = body.style.height = '';                                                               // 662
                                                                                                                       // 663
		if(_skrollrBody) {                                                                                                   // 664
			skrollr.setStyle(_skrollrBody, 'transform', 'none');                                                                // 665
		}                                                                                                                    // 666
                                                                                                                       // 667
		_instance = undefined;                                                                                               // 668
		_skrollrBody = undefined;                                                                                            // 669
		_listeners = undefined;                                                                                              // 670
		_forceHeight = undefined;                                                                                            // 671
		_maxKeyFrame = 0;                                                                                                    // 672
		_scale = 1;                                                                                                          // 673
		_constants = undefined;                                                                                              // 674
		_mobileDeceleration = undefined;                                                                                     // 675
		_direction = 'down';                                                                                                 // 676
		_lastTop = -1;                                                                                                       // 677
		_lastViewportWidth = 0;                                                                                              // 678
		_lastViewportHeight = 0;                                                                                             // 679
		_requestReflow = false;                                                                                              // 680
		_scrollAnimation = undefined;                                                                                        // 681
		_smoothScrollingEnabled = undefined;                                                                                 // 682
		_smoothScrollingDuration = undefined;                                                                                // 683
		_smoothScrolling = undefined;                                                                                        // 684
		_forceRender = undefined;                                                                                            // 685
		_skrollableIdCounter = 0;                                                                                            // 686
		_edgeStrategy = undefined;                                                                                           // 687
		_isMobile = false;                                                                                                   // 688
		_mobileOffset = 0;                                                                                                   // 689
		_translateZ = undefined;                                                                                             // 690
	};                                                                                                                    // 691
                                                                                                                       // 692
	/*                                                                                                                    // 693
		Private methods.                                                                                                     // 694
	*/                                                                                                                    // 695
                                                                                                                       // 696
	var _initMobile = function() {                                                                                        // 697
		var initialElement;                                                                                                  // 698
		var initialTouchY;                                                                                                   // 699
		var initialTouchX;                                                                                                   // 700
		var currentElement;                                                                                                  // 701
		var currentTouchY;                                                                                                   // 702
		var currentTouchX;                                                                                                   // 703
		var lastTouchY;                                                                                                      // 704
		var deltaY;                                                                                                          // 705
                                                                                                                       // 706
		var initialTouchTime;                                                                                                // 707
		var currentTouchTime;                                                                                                // 708
		var lastTouchTime;                                                                                                   // 709
		var deltaTime;                                                                                                       // 710
                                                                                                                       // 711
		_addEvent(documentElement, [EVENT_TOUCHSTART, EVENT_TOUCHMOVE, EVENT_TOUCHCANCEL, EVENT_TOUCHEND].join(' '), function(e) {
			var touch = e.changedTouches[0];                                                                                    // 713
                                                                                                                       // 714
			currentElement = e.target;                                                                                          // 715
                                                                                                                       // 716
			//We don't want text nodes.                                                                                         // 717
			while(currentElement.nodeType === 3) {                                                                              // 718
				currentElement = currentElement.parentNode;                                                                        // 719
			}                                                                                                                   // 720
                                                                                                                       // 721
			currentTouchY = touch.clientY;                                                                                      // 722
			currentTouchX = touch.clientX;                                                                                      // 723
			currentTouchTime = e.timeStamp;                                                                                     // 724
                                                                                                                       // 725
			if(!rxTouchIgnoreTags.test(currentElement.tagName)) {                                                               // 726
				e.preventDefault();                                                                                                // 727
			}                                                                                                                   // 728
                                                                                                                       // 729
			switch(e.type) {                                                                                                    // 730
				case EVENT_TOUCHSTART:                                                                                             // 731
					//The last element we tapped on.                                                                                  // 732
					if(initialElement) {                                                                                              // 733
						initialElement.blur();                                                                                           // 734
					}                                                                                                                 // 735
                                                                                                                       // 736
					_instance.stopAnimateTo();                                                                                        // 737
                                                                                                                       // 738
					initialElement = currentElement;                                                                                  // 739
                                                                                                                       // 740
					initialTouchY = lastTouchY = currentTouchY;                                                                       // 741
					initialTouchX = currentTouchX;                                                                                    // 742
					initialTouchTime = currentTouchTime;                                                                              // 743
                                                                                                                       // 744
					break;                                                                                                            // 745
				case EVENT_TOUCHMOVE:                                                                                              // 746
					//Prevent default event on touchIgnore elements in case they don't have focus yet.                                // 747
					if(rxTouchIgnoreTags.test(currentElement.tagName) && document.activeElement !== currentElement) {                 // 748
						e.preventDefault();                                                                                              // 749
					}                                                                                                                 // 750
                                                                                                                       // 751
					deltaY = currentTouchY - lastTouchY;                                                                              // 752
					deltaTime = currentTouchTime - lastTouchTime;                                                                     // 753
                                                                                                                       // 754
					_instance.setScrollTop(_mobileOffset - deltaY, true);                                                             // 755
                                                                                                                       // 756
					lastTouchY = currentTouchY;                                                                                       // 757
					lastTouchTime = currentTouchTime;                                                                                 // 758
					break;                                                                                                            // 759
				default:                                                                                                           // 760
				case EVENT_TOUCHCANCEL:                                                                                            // 761
				case EVENT_TOUCHEND:                                                                                               // 762
					var distanceY = initialTouchY - currentTouchY;                                                                    // 763
					var distanceX = initialTouchX - currentTouchX;                                                                    // 764
					var distance2 = distanceX * distanceX + distanceY * distanceY;                                                    // 765
                                                                                                                       // 766
					//Check if it was more like a tap (moved less than 7px).                                                          // 767
					if(distance2 < 49) {                                                                                              // 768
						if(!rxTouchIgnoreTags.test(initialElement.tagName)) {                                                            // 769
							initialElement.focus();                                                                                         // 770
                                                                                                                       // 771
							//It was a tap, click the element.                                                                              // 772
							var clickEvent = document.createEvent('MouseEvents');                                                           // 773
							clickEvent.initMouseEvent('click', true, true, e.view, 1, touch.screenX, touch.screenY, touch.clientX, touch.clientY, e.ctrlKey, e.altKey, e.shiftKey, e.metaKey, 0, null);
							initialElement.dispatchEvent(clickEvent);                                                                       // 775
						}                                                                                                                // 776
                                                                                                                       // 777
						return;                                                                                                          // 778
					}                                                                                                                 // 779
                                                                                                                       // 780
					initialElement = undefined;                                                                                       // 781
                                                                                                                       // 782
					var speed = deltaY / deltaTime;                                                                                   // 783
                                                                                                                       // 784
					//Cap speed at 3 pixel/ms.                                                                                        // 785
					speed = Math.max(Math.min(speed, 3), -3);                                                                         // 786
                                                                                                                       // 787
					var duration = Math.abs(speed / _mobileDeceleration);                                                             // 788
					var targetOffset = speed * duration + 0.5 * _mobileDeceleration * duration * duration;                            // 789
					var targetTop = _instance.getScrollTop() - targetOffset;                                                          // 790
                                                                                                                       // 791
					//Relative duration change for when scrolling above bounds.                                                       // 792
					var targetRatio = 0;                                                                                              // 793
                                                                                                                       // 794
					//Change duration proportionally when scrolling would leave bounds.                                               // 795
					if(targetTop > _maxKeyFrame) {                                                                                    // 796
						targetRatio = (_maxKeyFrame - targetTop) / targetOffset;                                                         // 797
                                                                                                                       // 798
						targetTop = _maxKeyFrame;                                                                                        // 799
					} else if(targetTop < 0) {                                                                                        // 800
						targetRatio = -targetTop / targetOffset;                                                                         // 801
                                                                                                                       // 802
						targetTop = 0;                                                                                                   // 803
					}                                                                                                                 // 804
                                                                                                                       // 805
					duration = duration * (1 - targetRatio);                                                                          // 806
                                                                                                                       // 807
					_instance.animateTo((targetTop + 0.5) | 0, {easing: 'outCubic', duration: duration});                             // 808
					break;                                                                                                            // 809
			}                                                                                                                   // 810
		});                                                                                                                  // 811
                                                                                                                       // 812
		//Just in case there has already been some native scrolling, reset it.                                               // 813
		window.scrollTo(0, 0);                                                                                               // 814
		documentElement.style.overflow = body.style.overflow = 'hidden';                                                     // 815
	};                                                                                                                    // 816
                                                                                                                       // 817
	/**                                                                                                                   // 818
	 * Updates key frames which depend on others / need to be updated on resize.                                          // 819
	 * That is "end" in "absolute" mode and all key frames in "relative" mode.                                            // 820
	 * Also handles constants, because they may change on resize.                                                         // 821
	 */                                                                                                                   // 822
	var _updateDependentKeyFrames = function() {                                                                          // 823
		var viewportHeight = documentElement.clientHeight;                                                                   // 824
		var processedConstants = _processConstants();                                                                        // 825
		var skrollable;                                                                                                      // 826
		var element;                                                                                                         // 827
		var anchorTarget;                                                                                                    // 828
		var keyFrames;                                                                                                       // 829
		var keyFrameIndex;                                                                                                   // 830
		var keyFramesLength;                                                                                                 // 831
		var kf;                                                                                                              // 832
		var skrollableIndex;                                                                                                 // 833
		var skrollablesLength;                                                                                               // 834
		var offset;                                                                                                          // 835
		var constantValue;                                                                                                   // 836
                                                                                                                       // 837
		//First process all relative-mode elements and find the max key frame.                                               // 838
		skrollableIndex = 0;                                                                                                 // 839
		skrollablesLength = _skrollables.length;                                                                             // 840
                                                                                                                       // 841
		for(; skrollableIndex < skrollablesLength; skrollableIndex++) {                                                      // 842
			skrollable = _skrollables[skrollableIndex];                                                                         // 843
			element = skrollable.element;                                                                                       // 844
			anchorTarget = skrollable.anchorTarget;                                                                             // 845
			keyFrames = skrollable.keyFrames;                                                                                   // 846
                                                                                                                       // 847
			keyFrameIndex = 0;                                                                                                  // 848
			keyFramesLength = keyFrames.length;                                                                                 // 849
                                                                                                                       // 850
			for(; keyFrameIndex < keyFramesLength; keyFrameIndex++) {                                                           // 851
				kf = keyFrames[keyFrameIndex];                                                                                     // 852
                                                                                                                       // 853
				offset = kf.offset;                                                                                                // 854
				constantValue = processedConstants[kf.constant] || 0;                                                              // 855
                                                                                                                       // 856
				kf.frame = offset;                                                                                                 // 857
                                                                                                                       // 858
				if(kf.isPercentage) {                                                                                              // 859
					//Convert the offset to percentage of the viewport height.                                                        // 860
					offset = offset * viewportHeight;                                                                                 // 861
                                                                                                                       // 862
					//Absolute + percentage mode.                                                                                     // 863
					kf.frame = offset;                                                                                                // 864
				}                                                                                                                  // 865
                                                                                                                       // 866
				if(kf.mode === 'relative') {                                                                                       // 867
					_reset(element);                                                                                                  // 868
                                                                                                                       // 869
					kf.frame = _instance.relativeToAbsolute(anchorTarget, kf.anchors[0], kf.anchors[1]) - offset;                     // 870
                                                                                                                       // 871
					_reset(element, true);                                                                                            // 872
				}                                                                                                                  // 873
                                                                                                                       // 874
				kf.frame += constantValue;                                                                                         // 875
                                                                                                                       // 876
				//Only search for max key frame when forceHeight is enabled.                                                       // 877
				if(_forceHeight) {                                                                                                 // 878
					//Find the max key frame, but don't use one of the data-end ones for comparison.                                  // 879
					if(!kf.isEnd && kf.frame > _maxKeyFrame) {                                                                        // 880
						_maxKeyFrame = kf.frame;                                                                                         // 881
					}                                                                                                                 // 882
				}                                                                                                                  // 883
			}                                                                                                                   // 884
		}                                                                                                                    // 885
                                                                                                                       // 886
		//#133: The document can be larger than the maxKeyFrame we found.                                                    // 887
		_maxKeyFrame = Math.max(_maxKeyFrame, _getDocumentHeight());                                                         // 888
                                                                                                                       // 889
		//Now process all data-end keyframes.                                                                                // 890
		skrollableIndex = 0;                                                                                                 // 891
		skrollablesLength = _skrollables.length;                                                                             // 892
                                                                                                                       // 893
		for(; skrollableIndex < skrollablesLength; skrollableIndex++) {                                                      // 894
			skrollable = _skrollables[skrollableIndex];                                                                         // 895
			keyFrames = skrollable.keyFrames;                                                                                   // 896
                                                                                                                       // 897
			keyFrameIndex = 0;                                                                                                  // 898
			keyFramesLength = keyFrames.length;                                                                                 // 899
                                                                                                                       // 900
			for(; keyFrameIndex < keyFramesLength; keyFrameIndex++) {                                                           // 901
				kf = keyFrames[keyFrameIndex];                                                                                     // 902
                                                                                                                       // 903
				constantValue = processedConstants[kf.constant] || 0;                                                              // 904
                                                                                                                       // 905
				if(kf.isEnd) {                                                                                                     // 906
					kf.frame = _maxKeyFrame - kf.offset + constantValue;                                                              // 907
				}                                                                                                                  // 908
			}                                                                                                                   // 909
                                                                                                                       // 910
			skrollable.keyFrames.sort(_keyFrameComparator);                                                                     // 911
		}                                                                                                                    // 912
	};                                                                                                                    // 913
                                                                                                                       // 914
	/**                                                                                                                   // 915
	 * Calculates and sets the style properties for the element at the given frame.                                       // 916
	 * @param fakeFrame The frame to render at when smooth scrolling is enabled.                                          // 917
	 * @param actualFrame The actual frame we are at.                                                                     // 918
	 */                                                                                                                   // 919
	var _calcSteps = function(fakeFrame, actualFrame) {                                                                   // 920
		//Iterate over all skrollables.                                                                                      // 921
		var skrollableIndex = 0;                                                                                             // 922
		var skrollablesLength = _skrollables.length;                                                                         // 923
                                                                                                                       // 924
		for(; skrollableIndex < skrollablesLength; skrollableIndex++) {                                                      // 925
			var skrollable = _skrollables[skrollableIndex];                                                                     // 926
			var element = skrollable.element;                                                                                   // 927
			var frame = skrollable.smoothScrolling ? fakeFrame : actualFrame;                                                   // 928
			var frames = skrollable.keyFrames;                                                                                  // 929
			var framesLength = frames.length;                                                                                   // 930
			var firstFrame = frames[0];                                                                                         // 931
			var lastFrame = frames[frames.length - 1];                                                                          // 932
			var beforeFirst = frame < firstFrame.frame;                                                                         // 933
			var afterLast = frame > lastFrame.frame;                                                                            // 934
			var firstOrLastFrame = beforeFirst ? firstFrame : lastFrame;                                                        // 935
			var emitEvents = skrollable.emitEvents;                                                                             // 936
			var lastFrameIndex = skrollable.lastFrameIndex;                                                                     // 937
			var key;                                                                                                            // 938
			var value;                                                                                                          // 939
                                                                                                                       // 940
			//If we are before/after the first/last frame, set the styles according to the given edge strategy.                 // 941
			if(beforeFirst || afterLast) {                                                                                      // 942
				//Check if we already handled this edge case last time.                                                            // 943
				//Note: using setScrollTop it's possible that we jumped from one edge to the other.                                // 944
				if(beforeFirst && skrollable.edge === -1 || afterLast && skrollable.edge === 1) {                                  // 945
					continue;                                                                                                         // 946
				}                                                                                                                  // 947
                                                                                                                       // 948
				//Add the skrollr-before or -after class.                                                                          // 949
				if(beforeFirst) {                                                                                                  // 950
					_updateClass(element, [SKROLLABLE_BEFORE_CLASS], [SKROLLABLE_AFTER_CLASS, SKROLLABLE_BETWEEN_CLASS]);             // 951
                                                                                                                       // 952
					//This handles the special case where we exit the first keyframe.                                                 // 953
					if(emitEvents && lastFrameIndex > -1) {                                                                           // 954
						_emitEvent(element, firstFrame.eventType, _direction);                                                           // 955
						skrollable.lastFrameIndex = -1;                                                                                  // 956
					}                                                                                                                 // 957
				} else {                                                                                                           // 958
					_updateClass(element, [SKROLLABLE_AFTER_CLASS], [SKROLLABLE_BEFORE_CLASS, SKROLLABLE_BETWEEN_CLASS]);             // 959
                                                                                                                       // 960
					//This handles the special case where we exit the last keyframe.                                                  // 961
					if(emitEvents && lastFrameIndex < framesLength) {                                                                 // 962
						_emitEvent(element, lastFrame.eventType, _direction);                                                            // 963
						skrollable.lastFrameIndex = framesLength;                                                                        // 964
					}                                                                                                                 // 965
				}                                                                                                                  // 966
                                                                                                                       // 967
				//Remember that we handled the edge case (before/after the first/last keyframe).                                   // 968
				skrollable.edge = beforeFirst ? -1 : 1;                                                                            // 969
                                                                                                                       // 970
				switch(skrollable.edgeStrategy) {                                                                                  // 971
					case 'reset':                                                                                                     // 972
						_reset(element);                                                                                                 // 973
						continue;                                                                                                        // 974
					case 'ease':                                                                                                      // 975
						//Handle this case like it would be exactly at first/last keyframe and just pass it on.                          // 976
						frame = firstOrLastFrame.frame;                                                                                  // 977
						break;                                                                                                           // 978
					default:                                                                                                          // 979
					case 'set':                                                                                                       // 980
						var props = firstOrLastFrame.props;                                                                              // 981
                                                                                                                       // 982
						for(key in props) {                                                                                              // 983
							if(hasProp.call(props, key)) {                                                                                  // 984
								value = _interpolateString(props[key].value);                                                                  // 985
                                                                                                                       // 986
								//Set style or attribute.                                                                                      // 987
								if(key.indexOf('@') === 0) {                                                                                   // 988
									element.setAttribute(key.substr(1), value);                                                                   // 989
								} else {                                                                                                       // 990
									skrollr.setStyle(element, key, value);                                                                        // 991
								}                                                                                                              // 992
							}                                                                                                               // 993
						}                                                                                                                // 994
                                                                                                                       // 995
						continue;                                                                                                        // 996
				}                                                                                                                  // 997
			} else {                                                                                                            // 998
				//Did we handle an edge last time?                                                                                 // 999
				if(skrollable.edge !== 0) {                                                                                        // 1000
					_updateClass(element, [SKROLLABLE_CLASS, SKROLLABLE_BETWEEN_CLASS], [SKROLLABLE_BEFORE_CLASS, SKROLLABLE_AFTER_CLASS]);
					skrollable.edge = 0;                                                                                              // 1002
				}                                                                                                                  // 1003
			}                                                                                                                   // 1004
                                                                                                                       // 1005
			//Find out between which two key frames we are right now.                                                           // 1006
			var keyFrameIndex = 0;                                                                                              // 1007
                                                                                                                       // 1008
			for(; keyFrameIndex < framesLength - 1; keyFrameIndex++) {                                                          // 1009
				if(frame >= frames[keyFrameIndex].frame && frame <= frames[keyFrameIndex + 1].frame) {                             // 1010
					var left = frames[keyFrameIndex];                                                                                 // 1011
					var right = frames[keyFrameIndex + 1];                                                                            // 1012
                                                                                                                       // 1013
					for(key in left.props) {                                                                                          // 1014
						if(hasProp.call(left.props, key)) {                                                                              // 1015
							var progress = (frame - left.frame) / (right.frame - left.frame);                                               // 1016
                                                                                                                       // 1017
							//Transform the current progress using the given easing function.                                               // 1018
							progress = left.props[key].easing(progress);                                                                    // 1019
                                                                                                                       // 1020
							//Interpolate between the two values                                                                            // 1021
							value = _calcInterpolation(left.props[key].value, right.props[key].value, progress);                            // 1022
                                                                                                                       // 1023
							value = _interpolateString(value);                                                                              // 1024
                                                                                                                       // 1025
							//Set style or attribute.                                                                                       // 1026
							if(key.indexOf('@') === 0) {                                                                                    // 1027
								element.setAttribute(key.substr(1), value);                                                                    // 1028
							} else {                                                                                                        // 1029
								skrollr.setStyle(element, key, value);                                                                         // 1030
							}                                                                                                               // 1031
						}                                                                                                                // 1032
					}                                                                                                                 // 1033
                                                                                                                       // 1034
					//Are events enabled on this element?                                                                             // 1035
					//This code handles the usual cases of scrolling through different keyframes.                                     // 1036
					//The special cases of before first and after last keyframe are handled above.                                    // 1037
					if(emitEvents) {                                                                                                  // 1038
						//Did we pass a new keyframe?                                                                                    // 1039
						if(lastFrameIndex !== keyFrameIndex) {                                                                           // 1040
							if(_direction === 'down') {                                                                                     // 1041
								_emitEvent(element, left.eventType, _direction);                                                               // 1042
							} else {                                                                                                        // 1043
								_emitEvent(element, right.eventType, _direction);                                                              // 1044
							}                                                                                                               // 1045
                                                                                                                       // 1046
							skrollable.lastFrameIndex = keyFrameIndex;                                                                      // 1047
						}                                                                                                                // 1048
					}                                                                                                                 // 1049
                                                                                                                       // 1050
					break;                                                                                                            // 1051
				}                                                                                                                  // 1052
			}                                                                                                                   // 1053
		}                                                                                                                    // 1054
	};                                                                                                                    // 1055
                                                                                                                       // 1056
	/**                                                                                                                   // 1057
	 * Renders all elements.                                                                                              // 1058
	 */                                                                                                                   // 1059
	var _render = function() {                                                                                            // 1060
		if(_requestReflow) {                                                                                                 // 1061
			_requestReflow = false;                                                                                             // 1062
			_reflow();                                                                                                          // 1063
		}                                                                                                                    // 1064
                                                                                                                       // 1065
		//We may render something else than the actual scrollbar position.                                                   // 1066
		var renderTop = _instance.getScrollTop();                                                                            // 1067
                                                                                                                       // 1068
		//If there's an animation, which ends in current render call, call the callback after rendering.                     // 1069
		var afterAnimationCallback;                                                                                          // 1070
		var now = _now();                                                                                                    // 1071
		var progress;                                                                                                        // 1072
                                                                                                                       // 1073
		//Before actually rendering handle the scroll animation, if any.                                                     // 1074
		if(_scrollAnimation) {                                                                                               // 1075
			//It's over                                                                                                         // 1076
			if(now >= _scrollAnimation.endTime) {                                                                               // 1077
				renderTop = _scrollAnimation.targetTop;                                                                            // 1078
				afterAnimationCallback = _scrollAnimation.done;                                                                    // 1079
				_scrollAnimation = undefined;                                                                                      // 1080
			} else {                                                                                                            // 1081
				//Map the current progress to the new progress using given easing function.                                        // 1082
				progress = _scrollAnimation.easing((now - _scrollAnimation.startTime) / _scrollAnimation.duration);                // 1083
                                                                                                                       // 1084
				renderTop = (_scrollAnimation.startTop + progress * _scrollAnimation.topDiff) | 0;                                 // 1085
			}                                                                                                                   // 1086
                                                                                                                       // 1087
			_instance.setScrollTop(renderTop, true);                                                                            // 1088
		}                                                                                                                    // 1089
		//Smooth scrolling only if there's no animation running and if we're not forcing the rendering.                      // 1090
		else if(!_forceRender) {                                                                                             // 1091
			var smoothScrollingDiff = _smoothScrolling.targetTop - renderTop;                                                   // 1092
                                                                                                                       // 1093
			//The user scrolled, start new smooth scrolling.                                                                    // 1094
			if(smoothScrollingDiff) {                                                                                           // 1095
				_smoothScrolling = {                                                                                               // 1096
					startTop: _lastTop,                                                                                               // 1097
					topDiff: renderTop - _lastTop,                                                                                    // 1098
					targetTop: renderTop,                                                                                             // 1099
					startTime: _lastRenderCall,                                                                                       // 1100
					endTime: _lastRenderCall + _smoothScrollingDuration                                                               // 1101
				};                                                                                                                 // 1102
			}                                                                                                                   // 1103
                                                                                                                       // 1104
			//Interpolate the internal scroll position (not the actual scrollbar).                                              // 1105
			if(now <= _smoothScrolling.endTime) {                                                                               // 1106
				//Map the current progress to the new progress using easing function.                                              // 1107
				progress = easings.sqrt((now - _smoothScrolling.startTime) / _smoothScrollingDuration);                            // 1108
                                                                                                                       // 1109
				renderTop = (_smoothScrolling.startTop + progress * _smoothScrolling.topDiff) | 0;                                 // 1110
			}                                                                                                                   // 1111
		}                                                                                                                    // 1112
                                                                                                                       // 1113
		//That's were we actually "scroll" on mobile.                                                                        // 1114
		if(_isMobile && _skrollrBody) {                                                                                      // 1115
			//Set the transform ("scroll it").                                                                                  // 1116
			skrollr.setStyle(_skrollrBody, 'transform', 'translate(0, ' + -(_mobileOffset) + 'px) ' + _translateZ);             // 1117
		}                                                                                                                    // 1118
                                                                                                                       // 1119
		//Did the scroll position even change?                                                                               // 1120
		if(_forceRender || _lastTop !== renderTop) {                                                                         // 1121
			//Remember in which direction are we scrolling?                                                                     // 1122
			_direction = (renderTop > _lastTop) ? 'down' : (renderTop < _lastTop ? 'up' : _direction);                          // 1123
                                                                                                                       // 1124
			_forceRender = false;                                                                                               // 1125
                                                                                                                       // 1126
			var listenerParams = {                                                                                              // 1127
				curTop: renderTop,                                                                                                 // 1128
				lastTop: _lastTop,                                                                                                 // 1129
				maxTop: _maxKeyFrame,                                                                                              // 1130
				direction: _direction                                                                                              // 1131
			};                                                                                                                  // 1132
                                                                                                                       // 1133
			//Tell the listener we are about to render.                                                                         // 1134
			var continueRendering = _listeners.beforerender && _listeners.beforerender.call(_instance, listenerParams);         // 1135
                                                                                                                       // 1136
			//The beforerender listener function is able the cancel rendering.                                                  // 1137
			if(continueRendering !== false) {                                                                                   // 1138
				//Now actually interpolate all the styles.                                                                         // 1139
				_calcSteps(renderTop, _instance.getScrollTop());                                                                   // 1140
                                                                                                                       // 1141
				//Remember when we last rendered.                                                                                  // 1142
				_lastTop = renderTop;                                                                                              // 1143
                                                                                                                       // 1144
				if(_listeners.render) {                                                                                            // 1145
					_listeners.render.call(_instance, listenerParams);                                                                // 1146
				}                                                                                                                  // 1147
			}                                                                                                                   // 1148
                                                                                                                       // 1149
			if(afterAnimationCallback) {                                                                                        // 1150
				afterAnimationCallback.call(_instance, false);                                                                     // 1151
			}                                                                                                                   // 1152
		}                                                                                                                    // 1153
                                                                                                                       // 1154
		_lastRenderCall = now;                                                                                               // 1155
	};                                                                                                                    // 1156
                                                                                                                       // 1157
	/**                                                                                                                   // 1158
	 * Parses the properties for each key frame of the given skrollable.                                                  // 1159
	 */                                                                                                                   // 1160
	var _parseProps = function(skrollable) {                                                                              // 1161
		//Iterate over all key frames                                                                                        // 1162
		var keyFrameIndex = 0;                                                                                               // 1163
		var keyFramesLength = skrollable.keyFrames.length;                                                                   // 1164
                                                                                                                       // 1165
		for(; keyFrameIndex < keyFramesLength; keyFrameIndex++) {                                                            // 1166
			var frame = skrollable.keyFrames[keyFrameIndex];                                                                    // 1167
			var easing;                                                                                                         // 1168
			var value;                                                                                                          // 1169
			var prop;                                                                                                           // 1170
			var props = {};                                                                                                     // 1171
                                                                                                                       // 1172
			var match;                                                                                                          // 1173
                                                                                                                       // 1174
			while((match = rxPropValue.exec(frame.props)) !== null) {                                                           // 1175
				prop = match[1];                                                                                                   // 1176
				value = match[2];                                                                                                  // 1177
                                                                                                                       // 1178
				easing = prop.match(rxPropEasing);                                                                                 // 1179
                                                                                                                       // 1180
				//Is there an easing specified for this prop?                                                                      // 1181
				if(easing !== null) {                                                                                              // 1182
					prop = easing[1];                                                                                                 // 1183
					easing = easing[2];                                                                                               // 1184
				} else {                                                                                                           // 1185
					easing = DEFAULT_EASING;                                                                                          // 1186
				}                                                                                                                  // 1187
                                                                                                                       // 1188
				//Exclamation point at first position forces the value to be taken literal.                                        // 1189
				value = value.indexOf('!') ? _parseProp(value) : [value.slice(1)];                                                 // 1190
                                                                                                                       // 1191
				//Save the prop for this key frame with his value and easing function                                              // 1192
				props[prop] = {                                                                                                    // 1193
					value: value,                                                                                                     // 1194
					easing: easings[easing]                                                                                           // 1195
				};                                                                                                                 // 1196
			}                                                                                                                   // 1197
                                                                                                                       // 1198
			frame.props = props;                                                                                                // 1199
		}                                                                                                                    // 1200
	};                                                                                                                    // 1201
                                                                                                                       // 1202
	/**                                                                                                                   // 1203
	 * Parses a value extracting numeric values and generating a format string                                            // 1204
	 * for later interpolation of the new values in old string.                                                           // 1205
	 *                                                                                                                    // 1206
	 * @param val The CSS value to be parsed.                                                                             // 1207
	 * @return Something like ["rgba(?%,?%, ?%,?)", 100, 50, 0, .7]                                                       // 1208
	 * where the first element is the format string later used                                                            // 1209
	 * and all following elements are the numeric value.                                                                  // 1210
	 */                                                                                                                   // 1211
	var _parseProp = function(val) {                                                                                      // 1212
		var numbers = [];                                                                                                    // 1213
                                                                                                                       // 1214
		//One special case, where floats don't work.                                                                         // 1215
		//We replace all occurences of rgba colors                                                                           // 1216
		//which don't use percentage notation with the percentage notation.                                                  // 1217
		rxRGBAIntegerColor.lastIndex = 0;                                                                                    // 1218
		val = val.replace(rxRGBAIntegerColor, function(rgba) {                                                               // 1219
			return rgba.replace(rxNumericValue, function(n) {                                                                   // 1220
				return n / 255 * 100 + '%';                                                                                        // 1221
			});                                                                                                                 // 1222
		});                                                                                                                  // 1223
                                                                                                                       // 1224
		//Handle prefixing of "gradient" values.                                                                             // 1225
		//For now only the prefixed value will be set. Unprefixed isn't supported anyway.                                    // 1226
		if(theDashedCSSPrefix) {                                                                                             // 1227
			rxGradient.lastIndex = 0;                                                                                           // 1228
			val = val.replace(rxGradient, function(s) {                                                                         // 1229
				return theDashedCSSPrefix + s;                                                                                     // 1230
			});                                                                                                                 // 1231
		}                                                                                                                    // 1232
                                                                                                                       // 1233
		//Now parse ANY number inside this string and create a format string.                                                // 1234
		val = val.replace(rxNumericValue, function(n) {                                                                      // 1235
			numbers.push(+n);                                                                                                   // 1236
			return '{?}';                                                                                                       // 1237
		});                                                                                                                  // 1238
                                                                                                                       // 1239
		//Add the formatstring as first value.                                                                               // 1240
		numbers.unshift(val);                                                                                                // 1241
                                                                                                                       // 1242
		return numbers;                                                                                                      // 1243
	};                                                                                                                    // 1244
                                                                                                                       // 1245
	/**                                                                                                                   // 1246
	 * Fills the key frames with missing left and right hand properties.                                                  // 1247
	 * If key frame 1 has property X and key frame 2 is missing X,                                                        // 1248
	 * but key frame 3 has X again, then we need to assign X to key frame 2 too.                                          // 1249
	 *                                                                                                                    // 1250
	 * @param sk A skrollable.                                                                                            // 1251
	 */                                                                                                                   // 1252
	var _fillProps = function(sk) {                                                                                       // 1253
		//Will collect the properties key frame by key frame                                                                 // 1254
		var propList = {};                                                                                                   // 1255
		var keyFrameIndex;                                                                                                   // 1256
		var keyFramesLength;                                                                                                 // 1257
                                                                                                                       // 1258
		//Iterate over all key frames from left to right                                                                     // 1259
		keyFrameIndex = 0;                                                                                                   // 1260
		keyFramesLength = sk.keyFrames.length;                                                                               // 1261
                                                                                                                       // 1262
		for(; keyFrameIndex < keyFramesLength; keyFrameIndex++) {                                                            // 1263
			_fillPropForFrame(sk.keyFrames[keyFrameIndex], propList);                                                           // 1264
		}                                                                                                                    // 1265
                                                                                                                       // 1266
		//Now do the same from right to fill the last gaps                                                                   // 1267
                                                                                                                       // 1268
		propList = {};                                                                                                       // 1269
                                                                                                                       // 1270
		//Iterate over all key frames from right to left                                                                     // 1271
		keyFrameIndex = sk.keyFrames.length - 1;                                                                             // 1272
                                                                                                                       // 1273
		for(; keyFrameIndex >= 0; keyFrameIndex--) {                                                                         // 1274
			_fillPropForFrame(sk.keyFrames[keyFrameIndex], propList);                                                           // 1275
		}                                                                                                                    // 1276
	};                                                                                                                    // 1277
                                                                                                                       // 1278
	var _fillPropForFrame = function(frame, propList) {                                                                   // 1279
		var key;                                                                                                             // 1280
                                                                                                                       // 1281
		//For each key frame iterate over all right hand properties and assign them,                                         // 1282
		//but only if the current key frame doesn't have the property by itself                                              // 1283
		for(key in propList) {                                                                                               // 1284
			//The current frame misses this property, so assign it.                                                             // 1285
			if(!hasProp.call(frame.props, key)) {                                                                               // 1286
				frame.props[key] = propList[key];                                                                                  // 1287
			}                                                                                                                   // 1288
		}                                                                                                                    // 1289
                                                                                                                       // 1290
		//Iterate over all props of the current frame and collect them                                                       // 1291
		for(key in frame.props) {                                                                                            // 1292
			propList[key] = frame.props[key];                                                                                   // 1293
		}                                                                                                                    // 1294
	};                                                                                                                    // 1295
                                                                                                                       // 1296
	/**                                                                                                                   // 1297
	 * Calculates the new values for two given values array.                                                              // 1298
	 */                                                                                                                   // 1299
	var _calcInterpolation = function(val1, val2, progress) {                                                             // 1300
		var valueIndex;                                                                                                      // 1301
		var val1Length = val1.length;                                                                                        // 1302
                                                                                                                       // 1303
		//They both need to have the same length                                                                             // 1304
		if(val1Length !== val2.length) {                                                                                     // 1305
			throw 'Can\'t interpolate between "' + val1[0] + '" and "' + val2[0] + '"';                                         // 1306
		}                                                                                                                    // 1307
                                                                                                                       // 1308
		//Add the format string as first element.                                                                            // 1309
		var interpolated = [val1[0]];                                                                                        // 1310
                                                                                                                       // 1311
		valueIndex = 1;                                                                                                      // 1312
                                                                                                                       // 1313
		for(; valueIndex < val1Length; valueIndex++) {                                                                       // 1314
			//That's the line where the two numbers are actually interpolated.                                                  // 1315
			interpolated[valueIndex] = val1[valueIndex] + ((val2[valueIndex] - val1[valueIndex]) * progress);                   // 1316
		}                                                                                                                    // 1317
                                                                                                                       // 1318
		return interpolated;                                                                                                 // 1319
	};                                                                                                                    // 1320
                                                                                                                       // 1321
	/**                                                                                                                   // 1322
	 * Interpolates the numeric values into the format string.                                                            // 1323
	 */                                                                                                                   // 1324
	var _interpolateString = function(val) {                                                                              // 1325
		var valueIndex = 1;                                                                                                  // 1326
                                                                                                                       // 1327
		rxInterpolateString.lastIndex = 0;                                                                                   // 1328
                                                                                                                       // 1329
		return val[0].replace(rxInterpolateString, function() {                                                              // 1330
			return val[valueIndex++];                                                                                           // 1331
		});                                                                                                                  // 1332
	};                                                                                                                    // 1333
                                                                                                                       // 1334
	/**                                                                                                                   // 1335
	 * Resets the class and style attribute to what it was before skrollr manipulated the element.                        // 1336
	 * Also remembers the values it had before reseting, in order to undo the reset.                                      // 1337
	 */                                                                                                                   // 1338
	var _reset = function(elements, undo) {                                                                               // 1339
		//We accept a single element or an array of elements.                                                                // 1340
		elements = [].concat(elements);                                                                                      // 1341
                                                                                                                       // 1342
		var skrollable;                                                                                                      // 1343
		var element;                                                                                                         // 1344
		var elementsIndex = 0;                                                                                               // 1345
		var elementsLength = elements.length;                                                                                // 1346
                                                                                                                       // 1347
		for(; elementsIndex < elementsLength; elementsIndex++) {                                                             // 1348
			element = elements[elementsIndex];                                                                                  // 1349
			skrollable = _skrollables[element[SKROLLABLE_ID_DOM_PROPERTY]];                                                     // 1350
                                                                                                                       // 1351
			//Couldn't find the skrollable for this DOM element.                                                                // 1352
			if(!skrollable) {                                                                                                   // 1353
				continue;                                                                                                          // 1354
			}                                                                                                                   // 1355
                                                                                                                       // 1356
			if(undo) {                                                                                                          // 1357
				//Reset class and style to the "dirty" (set by skrollr) values.                                                    // 1358
				element.style.cssText = skrollable.dirtyStyleAttr;                                                                 // 1359
				_updateClass(element, skrollable.dirtyClassAttr);                                                                  // 1360
			} else {                                                                                                            // 1361
				//Remember the "dirty" (set by skrollr) class and style.                                                           // 1362
				skrollable.dirtyStyleAttr = element.style.cssText;                                                                 // 1363
				skrollable.dirtyClassAttr = _getClass(element);                                                                    // 1364
                                                                                                                       // 1365
				//Reset class and style to what it originally was.                                                                 // 1366
				element.style.cssText = skrollable.styleAttr;                                                                      // 1367
				_updateClass(element, skrollable.classAttr);                                                                       // 1368
			}                                                                                                                   // 1369
		}                                                                                                                    // 1370
	};                                                                                                                    // 1371
                                                                                                                       // 1372
	/**                                                                                                                   // 1373
	 * Detects support for 3d transforms by applying it to the skrollr-body.                                              // 1374
	 */                                                                                                                   // 1375
	var _detect3DTransforms = function() {                                                                                // 1376
		_translateZ = 'translateZ(0)';                                                                                       // 1377
		skrollr.setStyle(_skrollrBody, 'transform', _translateZ);                                                            // 1378
                                                                                                                       // 1379
		var computedStyle = getStyle(_skrollrBody);                                                                          // 1380
		var computedTransform = computedStyle.getPropertyValue('transform');                                                 // 1381
		var computedTransformWithPrefix = computedStyle.getPropertyValue(theDashedCSSPrefix + 'transform');                  // 1382
		var has3D = (computedTransform && computedTransform !== 'none') || (computedTransformWithPrefix && computedTransformWithPrefix !== 'none');
                                                                                                                       // 1384
		if(!has3D) {                                                                                                         // 1385
			_translateZ = '';                                                                                                   // 1386
		}                                                                                                                    // 1387
	};                                                                                                                    // 1388
                                                                                                                       // 1389
	/**                                                                                                                   // 1390
	 * Set the CSS property on the given element. Sets prefixed properties as well.                                       // 1391
	 */                                                                                                                   // 1392
	skrollr.setStyle = function(el, prop, val) {                                                                          // 1393
		var style = el.style;                                                                                                // 1394
                                                                                                                       // 1395
		//Camel case.                                                                                                        // 1396
		prop = prop.replace(rxCamelCase, rxCamelCaseFn).replace('-', '');                                                    // 1397
                                                                                                                       // 1398
		//Make sure z-index gets a <integer>.                                                                                // 1399
		//This is the only <integer> case we need to handle.                                                                 // 1400
		if(prop === 'zIndex') {                                                                                              // 1401
			if(isNaN(val)) {                                                                                                    // 1402
				//If it's not a number, don't touch it.                                                                            // 1403
				//It could for example be "auto" (#351).                                                                           // 1404
				style[prop] = val;                                                                                                 // 1405
			} else {                                                                                                            // 1406
				//Floor the number.                                                                                                // 1407
				style[prop] = '' + (val | 0);                                                                                      // 1408
			}                                                                                                                   // 1409
		}                                                                                                                    // 1410
		//#64: "float" can't be set across browsers. Needs to use "cssFloat" for all except IE.                              // 1411
		else if(prop === 'float') {                                                                                          // 1412
			style.styleFloat = style.cssFloat = val;                                                                            // 1413
		}                                                                                                                    // 1414
		else {                                                                                                               // 1415
			//Need try-catch for old IE.                                                                                        // 1416
			try {                                                                                                               // 1417
				//Set prefixed property if there's a prefix.                                                                       // 1418
				if(theCSSPrefix) {                                                                                                 // 1419
					style[theCSSPrefix + prop.slice(0,1).toUpperCase() + prop.slice(1)] = val;                                        // 1420
				}                                                                                                                  // 1421
                                                                                                                       // 1422
				//Set unprefixed.                                                                                                  // 1423
				style[prop] = val;                                                                                                 // 1424
			} catch(ignore) {}                                                                                                  // 1425
		}                                                                                                                    // 1426
	};                                                                                                                    // 1427
                                                                                                                       // 1428
	/**                                                                                                                   // 1429
	 * Cross browser event handling.                                                                                      // 1430
	 */                                                                                                                   // 1431
	var _addEvent = skrollr.addEvent = function(element, names, callback) {                                               // 1432
		var intermediate = function(e) {                                                                                     // 1433
			//Normalize IE event stuff.                                                                                         // 1434
			e = e || window.event;                                                                                              // 1435
                                                                                                                       // 1436
			if(!e.target) {                                                                                                     // 1437
				e.target = e.srcElement;                                                                                           // 1438
			}                                                                                                                   // 1439
                                                                                                                       // 1440
			if(!e.preventDefault) {                                                                                             // 1441
				e.preventDefault = function() {                                                                                    // 1442
					e.returnValue = false;                                                                                            // 1443
					e.defaultPrevented = true;                                                                                        // 1444
				};                                                                                                                 // 1445
			}                                                                                                                   // 1446
                                                                                                                       // 1447
			return callback.call(this, e);                                                                                      // 1448
		};                                                                                                                   // 1449
                                                                                                                       // 1450
		names = names.split(' ');                                                                                            // 1451
                                                                                                                       // 1452
		var name;                                                                                                            // 1453
		var nameCounter = 0;                                                                                                 // 1454
		var namesLength = names.length;                                                                                      // 1455
                                                                                                                       // 1456
		for(; nameCounter < namesLength; nameCounter++) {                                                                    // 1457
			name = names[nameCounter];                                                                                          // 1458
                                                                                                                       // 1459
			if(element.addEventListener) {                                                                                      // 1460
				element.addEventListener(name, callback, false);                                                                   // 1461
			} else {                                                                                                            // 1462
				element.attachEvent('on' + name, intermediate);                                                                    // 1463
			}                                                                                                                   // 1464
                                                                                                                       // 1465
			//Remember the events to be able to flush them later.                                                               // 1466
			_registeredEvents.push({                                                                                            // 1467
				element: element,                                                                                                  // 1468
				name: name,                                                                                                        // 1469
				listener: callback                                                                                                 // 1470
			});                                                                                                                 // 1471
		}                                                                                                                    // 1472
	};                                                                                                                    // 1473
                                                                                                                       // 1474
	var _removeEvent = skrollr.removeEvent = function(element, names, callback) {                                         // 1475
		names = names.split(' ');                                                                                            // 1476
                                                                                                                       // 1477
		var nameCounter = 0;                                                                                                 // 1478
		var namesLength = names.length;                                                                                      // 1479
                                                                                                                       // 1480
		for(; nameCounter < namesLength; nameCounter++) {                                                                    // 1481
			if(element.removeEventListener) {                                                                                   // 1482
				element.removeEventListener(names[nameCounter], callback, false);                                                  // 1483
			} else {                                                                                                            // 1484
				element.detachEvent('on' + names[nameCounter], callback);                                                          // 1485
			}                                                                                                                   // 1486
		}                                                                                                                    // 1487
	};                                                                                                                    // 1488
                                                                                                                       // 1489
	var _removeAllEvents = function() {                                                                                   // 1490
		var eventData;                                                                                                       // 1491
		var eventCounter = 0;                                                                                                // 1492
		var eventsLength = _registeredEvents.length;                                                                         // 1493
                                                                                                                       // 1494
		for(; eventCounter < eventsLength; eventCounter++) {                                                                 // 1495
			eventData = _registeredEvents[eventCounter];                                                                        // 1496
                                                                                                                       // 1497
			_removeEvent(eventData.element, eventData.name, eventData.listener);                                                // 1498
		}                                                                                                                    // 1499
                                                                                                                       // 1500
		_registeredEvents = [];                                                                                              // 1501
	};                                                                                                                    // 1502
                                                                                                                       // 1503
	var _emitEvent = function(element, name, direction) {                                                                 // 1504
		if(_listeners.keyframe) {                                                                                            // 1505
			_listeners.keyframe.call(_instance, element, name, direction);                                                      // 1506
		}                                                                                                                    // 1507
	};                                                                                                                    // 1508
                                                                                                                       // 1509
	var _reflow = function() {                                                                                            // 1510
		var pos = _instance.getScrollTop();                                                                                  // 1511
                                                                                                                       // 1512
		//Will be recalculated by _updateDependentKeyFrames.                                                                 // 1513
		_maxKeyFrame = 0;                                                                                                    // 1514
                                                                                                                       // 1515
		if(_forceHeight && !_isMobile) {                                                                                     // 1516
			//un-"force" the height to not mess with the calculations in _updateDependentKeyFrames (#216).                      // 1517
			body.style.height = '';                                                                                             // 1518
		}                                                                                                                    // 1519
                                                                                                                       // 1520
		_updateDependentKeyFrames();                                                                                         // 1521
                                                                                                                       // 1522
		if(_forceHeight && !_isMobile) {                                                                                     // 1523
			//"force" the height.                                                                                               // 1524
			body.style.height = (_maxKeyFrame + documentElement.clientHeight) + 'px';                                           // 1525
		}                                                                                                                    // 1526
                                                                                                                       // 1527
		//The scroll offset may now be larger than needed (on desktop the browser/os prevents scrolling farther than the bottom).
		if(_isMobile) {                                                                                                      // 1529
			_instance.setScrollTop(Math.min(_instance.getScrollTop(), _maxKeyFrame));                                           // 1530
		} else {                                                                                                             // 1531
			//Remember and reset the scroll pos (#217).                                                                         // 1532
			_instance.setScrollTop(pos, true);                                                                                  // 1533
		}                                                                                                                    // 1534
                                                                                                                       // 1535
		_forceRender = true;                                                                                                 // 1536
	};                                                                                                                    // 1537
                                                                                                                       // 1538
	/*                                                                                                                    // 1539
	 * Returns a copy of the constants object where all functions and strings have been evaluated.                        // 1540
	 */                                                                                                                   // 1541
	var _processConstants = function() {                                                                                  // 1542
		var viewportHeight = documentElement.clientHeight;                                                                   // 1543
		var copy = {};                                                                                                       // 1544
		var prop;                                                                                                            // 1545
		var value;                                                                                                           // 1546
                                                                                                                       // 1547
		for(prop in _constants) {                                                                                            // 1548
			value = _constants[prop];                                                                                           // 1549
                                                                                                                       // 1550
			if(typeof value === 'function') {                                                                                   // 1551
				value = value.call(_instance);                                                                                     // 1552
			}                                                                                                                   // 1553
			//Percentage offset.                                                                                                // 1554
			else if((/p$/).test(value)) {                                                                                       // 1555
				value = (value.slice(0, -1) / 100) * viewportHeight;                                                               // 1556
			}                                                                                                                   // 1557
                                                                                                                       // 1558
			copy[prop] = value;                                                                                                 // 1559
		}                                                                                                                    // 1560
                                                                                                                       // 1561
		return copy;                                                                                                         // 1562
	};                                                                                                                    // 1563
                                                                                                                       // 1564
	/*                                                                                                                    // 1565
	 * Returns the height of the document.                                                                                // 1566
	 */                                                                                                                   // 1567
	var _getDocumentHeight = function() {                                                                                 // 1568
		var skrollrBodyHeight = (_skrollrBody && _skrollrBody.offsetHeight || 0);                                            // 1569
		var bodyHeight = Math.max(skrollrBodyHeight, body.scrollHeight, body.offsetHeight, documentElement.scrollHeight, documentElement.offsetHeight, documentElement.clientHeight);
                                                                                                                       // 1571
		return bodyHeight - documentElement.clientHeight;                                                                    // 1572
	};                                                                                                                    // 1573
                                                                                                                       // 1574
	/**                                                                                                                   // 1575
	 * Returns a string of space separated classnames for the current element.                                            // 1576
	 * Works with SVG as well.                                                                                            // 1577
	 */                                                                                                                   // 1578
	var _getClass = function(element) {                                                                                   // 1579
		var prop = 'className';                                                                                              // 1580
                                                                                                                       // 1581
		//SVG support by using className.baseVal instead of just className.                                                  // 1582
		if(window.SVGElement && element instanceof window.SVGElement) {                                                      // 1583
			element = element[prop];                                                                                            // 1584
			prop = 'baseVal';                                                                                                   // 1585
		}                                                                                                                    // 1586
                                                                                                                       // 1587
		return element[prop];                                                                                                // 1588
	};                                                                                                                    // 1589
                                                                                                                       // 1590
	/**                                                                                                                   // 1591
	 * Adds and removes a CSS classes.                                                                                    // 1592
	 * Works with SVG as well.                                                                                            // 1593
	 * add and remove are arrays of strings,                                                                              // 1594
	 * or if remove is ommited add is a string and overwrites all classes.                                                // 1595
	 */                                                                                                                   // 1596
	var _updateClass = function(element, add, remove) {                                                                   // 1597
		var prop = 'className';                                                                                              // 1598
                                                                                                                       // 1599
		//SVG support by using className.baseVal instead of just className.                                                  // 1600
		if(window.SVGElement && element instanceof window.SVGElement) {                                                      // 1601
			element = element[prop];                                                                                            // 1602
			prop = 'baseVal';                                                                                                   // 1603
		}                                                                                                                    // 1604
                                                                                                                       // 1605
		//When remove is ommited, we want to overwrite/set the classes.                                                      // 1606
		if(remove === undefined) {                                                                                           // 1607
			element[prop] = add;                                                                                                // 1608
			return;                                                                                                             // 1609
		}                                                                                                                    // 1610
                                                                                                                       // 1611
		//Cache current classes. We will work on a string before passing back to DOM.                                        // 1612
		var val = element[prop];                                                                                             // 1613
                                                                                                                       // 1614
		//All classes to be removed.                                                                                         // 1615
		var classRemoveIndex = 0;                                                                                            // 1616
		var removeLength = remove.length;                                                                                    // 1617
                                                                                                                       // 1618
		for(; classRemoveIndex < removeLength; classRemoveIndex++) {                                                         // 1619
			val = _untrim(val).replace(_untrim(remove[classRemoveIndex]), ' ');                                                 // 1620
		}                                                                                                                    // 1621
                                                                                                                       // 1622
		val = _trim(val);                                                                                                    // 1623
                                                                                                                       // 1624
		//All classes to be added.                                                                                           // 1625
		var classAddIndex = 0;                                                                                               // 1626
		var addLength = add.length;                                                                                          // 1627
                                                                                                                       // 1628
		for(; classAddIndex < addLength; classAddIndex++) {                                                                  // 1629
			//Only add if el not already has class.                                                                             // 1630
			if(_untrim(val).indexOf(_untrim(add[classAddIndex])) === -1) {                                                      // 1631
				val += ' ' + add[classAddIndex];                                                                                   // 1632
			}                                                                                                                   // 1633
		}                                                                                                                    // 1634
                                                                                                                       // 1635
		element[prop] = _trim(val);                                                                                          // 1636
	};                                                                                                                    // 1637
                                                                                                                       // 1638
	var _trim = function(a) {                                                                                             // 1639
		return a.replace(rxTrim, '');                                                                                        // 1640
	};                                                                                                                    // 1641
                                                                                                                       // 1642
	/**                                                                                                                   // 1643
	 * Adds a space before and after the string.                                                                          // 1644
	 */                                                                                                                   // 1645
	var _untrim = function(a) {                                                                                           // 1646
		return ' ' + a + ' ';                                                                                                // 1647
	};                                                                                                                    // 1648
                                                                                                                       // 1649
	var _now = Date.now || function() {                                                                                   // 1650
		return +new Date();                                                                                                  // 1651
	};                                                                                                                    // 1652
                                                                                                                       // 1653
	var _keyFrameComparator = function(a, b) {                                                                            // 1654
		return a.frame - b.frame;                                                                                            // 1655
	};                                                                                                                    // 1656
                                                                                                                       // 1657
	/*                                                                                                                    // 1658
	 * Private variables.                                                                                                 // 1659
	 */                                                                                                                   // 1660
                                                                                                                       // 1661
	//Singleton                                                                                                           // 1662
	var _instance;                                                                                                        // 1663
                                                                                                                       // 1664
	/*                                                                                                                    // 1665
		A list of all elements which should be animated associated with their the metadata.                                  // 1666
		Exmaple skrollable with two key frames animating from 100px width to 20px:                                           // 1667
                                                                                                                       // 1668
		skrollable = {                                                                                                       // 1669
			element: <the DOM element>,                                                                                         // 1670
			styleAttr: <style attribute of the element before skrollr>,                                                         // 1671
			classAttr: <class attribute of the element before skrollr>,                                                         // 1672
			keyFrames: [                                                                                                        // 1673
				{                                                                                                                  // 1674
					frame: 100,                                                                                                       // 1675
					props: {                                                                                                          // 1676
						width: {                                                                                                         // 1677
							value: ['{?}px', 100],                                                                                          // 1678
							easing: <reference to easing function>                                                                          // 1679
						}                                                                                                                // 1680
					},                                                                                                                // 1681
					mode: "absolute"                                                                                                  // 1682
				},                                                                                                                 // 1683
				{                                                                                                                  // 1684
					frame: 200,                                                                                                       // 1685
					props: {                                                                                                          // 1686
						width: {                                                                                                         // 1687
							value: ['{?}px', 20],                                                                                           // 1688
							easing: <reference to easing function>                                                                          // 1689
						}                                                                                                                // 1690
					},                                                                                                                // 1691
					mode: "absolute"                                                                                                  // 1692
				}                                                                                                                  // 1693
			]                                                                                                                   // 1694
		};                                                                                                                   // 1695
	*/                                                                                                                    // 1696
	var _skrollables;                                                                                                     // 1697
                                                                                                                       // 1698
	var _skrollrBody;                                                                                                     // 1699
                                                                                                                       // 1700
	var _listeners;                                                                                                       // 1701
	var _forceHeight;                                                                                                     // 1702
	var _maxKeyFrame = 0;                                                                                                 // 1703
                                                                                                                       // 1704
	var _scale = 1;                                                                                                       // 1705
	var _constants;                                                                                                       // 1706
                                                                                                                       // 1707
	var _mobileDeceleration;                                                                                              // 1708
                                                                                                                       // 1709
	//Current direction (up/down).                                                                                        // 1710
	var _direction = 'down';                                                                                              // 1711
                                                                                                                       // 1712
	//The last top offset value. Needed to determine direction.                                                           // 1713
	var _lastTop = -1;                                                                                                    // 1714
                                                                                                                       // 1715
	//The last time we called the render method (doesn't mean we rendered!).                                              // 1716
	var _lastRenderCall = _now();                                                                                         // 1717
                                                                                                                       // 1718
	//For detecting if it actually resized (#271).                                                                        // 1719
	var _lastViewportWidth = 0;                                                                                           // 1720
	var _lastViewportHeight = 0;                                                                                          // 1721
                                                                                                                       // 1722
	var _requestReflow = false;                                                                                           // 1723
                                                                                                                       // 1724
	//Will contain data about a running scrollbar animation, if any.                                                      // 1725
	var _scrollAnimation;                                                                                                 // 1726
                                                                                                                       // 1727
	var _smoothScrollingEnabled;                                                                                          // 1728
                                                                                                                       // 1729
	var _smoothScrollingDuration;                                                                                         // 1730
                                                                                                                       // 1731
	//Will contain settins for smooth scrolling if enabled.                                                               // 1732
	var _smoothScrolling;                                                                                                 // 1733
                                                                                                                       // 1734
	//Can be set by any operation/event to force rendering even if the scrollbar didn't move.                             // 1735
	var _forceRender;                                                                                                     // 1736
                                                                                                                       // 1737
	//Each skrollable gets an unique ID incremented for each skrollable.                                                  // 1738
	//The ID is the index in the _skrollables array.                                                                      // 1739
	var _skrollableIdCounter = 0;                                                                                         // 1740
                                                                                                                       // 1741
	var _edgeStrategy;                                                                                                    // 1742
                                                                                                                       // 1743
                                                                                                                       // 1744
	//Mobile specific vars. Will be stripped by UglifyJS when not in use.                                                 // 1745
	var _isMobile = false;                                                                                                // 1746
                                                                                                                       // 1747
	//The virtual scroll offset when using mobile scrolling.                                                              // 1748
	var _mobileOffset = 0;                                                                                                // 1749
                                                                                                                       // 1750
	//If the browser supports 3d transforms, this will be filled with 'translateZ(0)' (empty string otherwise).           // 1751
	var _translateZ;                                                                                                      // 1752
                                                                                                                       // 1753
	//Will contain data about registered events by skrollr.                                                               // 1754
	var _registeredEvents = [];                                                                                           // 1755
                                                                                                                       // 1756
	//Animation frame id returned by RequestAnimationFrame (or timeout when RAF is not supported).                        // 1757
	var _animFrame;                                                                                                       // 1758
                                                                                                                       // 1759
	//Expose skrollr as either a global variable or a require.js module                                                   // 1760
	if(typeof define === 'function' && define.amd) {                                                                      // 1761
		define('skrollr', function () {                                                                                      // 1762
			return skrollr;                                                                                                     // 1763
		});                                                                                                                  // 1764
	} else if (typeof module !== 'undefined' && module.exports) {                                                         // 1765
		module.exports = skrollr;                                                                                            // 1766
	} else {                                                                                                              // 1767
		window.skrollr = skrollr;                                                                                            // 1768
	}                                                                                                                     // 1769
                                                                                                                       // 1770
}(window, document));                                                                                                  // 1771
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/skrollr-meteor/lib/template.skrollr-init.js                                                                //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
                                                                                                                       // 1
Template.__define__("skrollr", (function() {                                                                           // 2
  var self = this;                                                                                                     // 3
  var template = this;                                                                                                 // 4
  return "";                                                                                                           // 5
}));                                                                                                                   // 6
                                                                                                                       // 7
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/skrollr-meteor/lib/skrollr-init.js                                                                         //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
Template.skrollr.rendered = function() {                                                                               // 1
	skrollr.init();                                                                                                       // 2
}                                                                                                                      // 3
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);
