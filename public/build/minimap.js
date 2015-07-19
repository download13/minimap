/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	// Nobody else will initialize this so we better do it bere
	__webpack_require__(1);
	
	
	// Components
	__webpack_require__(5)();
	
	__webpack_require__(17)();
	
	__webpack_require__(25)('map');


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var stateroom = __webpack_require__(2);
	
	
	var latlng = {lat: 0, lng: 0};
	
	
	navigator.geolocation.watchPosition(function(pos) {
		setLatLng(pos.coords.latitude, pos.coords.longitude);
	}, function(err) {
		if(err.PERMISSION_DENIED) {
			alert('You must allow the app to see your location or it won\'t work');
		} else if(err.POSITION_UNAVAILABLE) {
			alert('Location information not available from this device.');
		} else if(err.TIMEOUT) {
			alert('Took too long to get location information.');
		} else {
			alert('Unknown error: ' + err);
		}
	}, {
		enableHighAccuracy: true,
		maximumAge: 0
	});
	
	
	setLatLng(0, 0);
	
	
	function setLatLng(lat, lng) {
		latlng.lat = lat;
		latlng.lng = lng;
	
		stateroom.set('p', JSON.stringify(latlng));
	}


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	var StateRoom = __webpack_require__(3);
	
	
	var roomname = location.pathname.split('/').pop();
	
	// TODO: Use a durable websocket standin
	var ws = new WebSocket('ws://' + location.host + '/ws/' + roomname);
	
	
	module.exports = new StateRoom(ws);


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	var asEmitter = __webpack_require__(4);
	
	
	// TODO: Break this out into a synchronized map primitive
	
	var CMD_ADD_CLIENT = 0;
	var CMD_REMOVE_CLIENT = 1;
	var CMD_SET = 2;
	var CMD_DELETE = 3;
	
	
	function StateRoomClient(ws) {
		asEmitter(this);
	
	
		this.id = null;
	
		this._localState = Object.create(null);
	
		this._ws = ws;
	
	
		var self = this;
	
		ws.onopen = function() {
			self._members = Object.create(null);
	
			self._flushLocalState();
	
			// A message comes from the server as JSON
			// [fromId, cmdCode, arguments]
			// [null, 0, ['bestIdInTheWorld']] adds a member with the id bestIdInTheWorld
			ws.onmessage = function(e) {
				try {
					var message = JSON.parse(e.data);
				} catch(err) {
					console.error('Invalid JSON sent from StateRoom server: ' + e.data);
					return;
				}
	
				var fromId = message[0];
	
				var cmd = message[1];
	
				var args = message[2];
	
				self._handleCmd(fromId, cmd, args);
			};
		};
	}
	
	StateRoomClient.prototype.get = function(key, memberId) {
		return this._members[memberId][key];
	};
	
	StateRoomClient.prototype.set = function(key, value) {
		var valueType = typeof value;
	
		if(valueType !== 'string' && valueType !== 'number') {
			throw new Error('Value must be a string or number');
		}
	
		this._localState[key] = value;
	
		this._flushLocalState();
	};
	
	StateRoomClient.prototype.delete = function(key) {
		if(key in this._localState) {
			this._localState[key] = undefined;
		}
	
		this._flushLocalState();
	};
	
	StateRoomClient.prototype.clear = function() {
		this._localState = Object.create(null);
	
		this._sendCmd(CMD_CLEAR);
	};
	
	StateRoomClient.prototype._flushLocalState = function() {
		if(this._ws.readyState !== this._ws.OPEN) return;
	
		Object.keys(this._localState).forEach(function(key) {
			var value = this._localState[key];
	
			if(value === undefined) {
				this._sendCmd(CMD_DELETE, [key]);
			} else {
				this._sendCmd(CMD_SET, [key, value]);
			}
	
			delete this._localState[key];
		}, this);
	};
	
	StateRoomClient.prototype._sendCmd = function(cmd, args) {
		this._ws.send(JSON.stringify([cmd, args]));
	};
	
	StateRoomClient.prototype._handleCmd = function(fromId, cmd, args) {
		if(fromId) { // Member command
			switch(cmd) {
			case CMD_SET:
				this._setProperty(fromId, args);
				break;
	
			case CMD_DELETE:
				this._deleteProperty(fromId, args);
				break;
	
			default:
				throw new Error('Unknown message type recieved: ' + cmd);
			}
		} else { // Room command
			switch(cmd) {
				case CMD_ADD_CLIENT:
					if(!this.id) { // This should be the first message it sees as a new member
						this.id = args[0];
	
						this.emit('ready');
					} else {
						this._addMember(args[0]);
					}
					break;
	
				case CMD_REMOVE_CLIENT:
					this._removeMember(args[0]);
			}
		}
	};
	
	StateRoomClient.prototype._addMember = function(id) {
		this._members[id] = Object.create(null);
	
		this.emit('join', id);
	};
	
	StateRoomClient.prototype._removeMember = function(id) {
		delete this._members[id];
	
		this.emit('part', id);
	};
	
	StateRoomClient.prototype._setProperty = function(fromId, args) {
		var key = args[0];
		var value = args[1];
	
		this._members[fromId][key] = value;
	
		this.emit('set', fromId, key, value);
	};
	
	StateRoomClient.prototype._deleteProperty = function(fromId, args) {
		var key = args[0];
	
		var memberState = this._members[fromId];
	
		var oldValue = memberState[key];
	
		delete memberState[key];
	
		this.emit('delete', fromId, key, oldValue);
	};
	
	
	module.exports = StateRoomClient;


/***/ },
/* 4 */
/***/ function(module, exports) {

	function asEmitter(obj) {
		var handlers = {};
	
		obj.on = on;
		obj.off = off;
		obj.emit = emit;
	
		function on(name, fn) {
			if(!handlers[name]) {
				handlers[name] = [];
			}
	
			handlers[name].push(fn);
	
			return this;
		}
	
		function off(name, fn) {
			var handlerList = handlers[name];
	
			if(handlerList) {
				if(fn) {
					var pos = handlerList.indexOf(fn);
	
					if(pos !== -1) {
						handlerList.splice(pos, 1);
					}
				} else {
					delete handlers[name];
				}
			}
	
			return this;
		}
	
		function emit(name) {
			var args = [].slice.call(arguments, 1);
	
			var handlerList = handlers[name];
	
			if(handlerList) {
				handlerList.forEach(function(handler) {
					handler.apply(null, args);
				});
			}
	
			return this;
		}
	
		return obj;
	}
	
	
	module.exports = asEmitter;


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(6);
	
	
	var dispatch = __webpack_require__(10).dispatch;
	
	var qrTrayAction = __webpack_require__(11);
	
	var qrTrayStore = __webpack_require__(12);
	
	var QRCode = __webpack_require__(14);
	
	var $ = __webpack_require__(15);
	
	var createModalTray = __webpack_require__(16);
	
	
	module.exports = function() {
		var tray = createModalTray()
		.on('backdrop-click', hideAction);
	
		$(tray.holder)
		.addClass('qrcode')
		.on('click', hideAction);
	
		function hideAction() {
			dispatch(qrTrayAction(false));
		}
	
		var qrcode = new QRCode(tray.holder);
	
		qrTrayStore.onChange(function() {
			// Only update the code if it's going to be seen
			if(qrTrayStore.open) {
				qrcode.makeCode(qrTrayStore.displayedUrl);
			}
	
			tray.setOpen(qrTrayStore.open);
		});
	}


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag
	
	// load the styles
	var content = __webpack_require__(7);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(9)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../../../node_modules/css-loader/index.js!./style.css", function() {
				var newContent = require("!!./../../../../node_modules/css-loader/index.js!./style.css");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(8)();
	// imports
	
	
	// module
	exports.push([module.id, ".qrcode {\n\twidth: 256px;\n\theight: 256px;\n\n\tbackground: white;\n}\n", ""]);
	
	// exports


/***/ },
/* 8 */
/***/ function(module, exports) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	// css base code, injected by the css-loader
	module.exports = function() {
		var list = [];
	
		// return the list of modules as css string
		list.toString = function toString() {
			var result = [];
			for(var i = 0; i < this.length; i++) {
				var item = this[i];
				if(item[2]) {
					result.push("@media " + item[2] + "{" + item[1] + "}");
				} else {
					result.push(item[1]);
				}
			}
			return result.join("");
		};
	
		// import a list of modules into the list
		list.i = function(modules, mediaQuery) {
			if(typeof modules === "string")
				modules = [[null, modules, ""]];
			var alreadyImportedModules = {};
			for(var i = 0; i < this.length; i++) {
				var id = this[i][0];
				if(typeof id === "number")
					alreadyImportedModules[id] = true;
			}
			for(i = 0; i < modules.length; i++) {
				var item = modules[i];
				// skip already imported module
				// this implementation is not 100% perfect for weird media query combinations
				//  when a module is imported multiple times with different media queries.
				//  I hope this will never occur (Hey this way we have smaller bundles)
				if(typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
					if(mediaQuery && !item[2]) {
						item[2] = mediaQuery;
					} else if(mediaQuery) {
						item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
					}
					list.push(item);
				}
			}
		};
		return list;
	};


/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	var stylesInDom = {},
		memoize = function(fn) {
			var memo;
			return function () {
				if (typeof memo === "undefined") memo = fn.apply(this, arguments);
				return memo;
			};
		},
		isOldIE = memoize(function() {
			return /msie [6-9]\b/.test(window.navigator.userAgent.toLowerCase());
		}),
		getHeadElement = memoize(function () {
			return document.head || document.getElementsByTagName("head")[0];
		}),
		singletonElement = null,
		singletonCounter = 0;
	
	module.exports = function(list, options) {
		if(false) {
			if(typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
		}
	
		options = options || {};
		// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
		// tags it will allow on a page
		if (typeof options.singleton === "undefined") options.singleton = isOldIE();
	
		var styles = listToStyles(list);
		addStylesToDom(styles, options);
	
		return function update(newList) {
			var mayRemove = [];
			for(var i = 0; i < styles.length; i++) {
				var item = styles[i];
				var domStyle = stylesInDom[item.id];
				domStyle.refs--;
				mayRemove.push(domStyle);
			}
			if(newList) {
				var newStyles = listToStyles(newList);
				addStylesToDom(newStyles, options);
			}
			for(var i = 0; i < mayRemove.length; i++) {
				var domStyle = mayRemove[i];
				if(domStyle.refs === 0) {
					for(var j = 0; j < domStyle.parts.length; j++)
						domStyle.parts[j]();
					delete stylesInDom[domStyle.id];
				}
			}
		};
	}
	
	function addStylesToDom(styles, options) {
		for(var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];
			if(domStyle) {
				domStyle.refs++;
				for(var j = 0; j < domStyle.parts.length; j++) {
					domStyle.parts[j](item.parts[j]);
				}
				for(; j < item.parts.length; j++) {
					domStyle.parts.push(addStyle(item.parts[j], options));
				}
			} else {
				var parts = [];
				for(var j = 0; j < item.parts.length; j++) {
					parts.push(addStyle(item.parts[j], options));
				}
				stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
			}
		}
	}
	
	function listToStyles(list) {
		var styles = [];
		var newStyles = {};
		for(var i = 0; i < list.length; i++) {
			var item = list[i];
			var id = item[0];
			var css = item[1];
			var media = item[2];
			var sourceMap = item[3];
			var part = {css: css, media: media, sourceMap: sourceMap};
			if(!newStyles[id])
				styles.push(newStyles[id] = {id: id, parts: [part]});
			else
				newStyles[id].parts.push(part);
		}
		return styles;
	}
	
	function createStyleElement() {
		var styleElement = document.createElement("style");
		var head = getHeadElement();
		styleElement.type = "text/css";
		head.appendChild(styleElement);
		return styleElement;
	}
	
	function createLinkElement() {
		var linkElement = document.createElement("link");
		var head = getHeadElement();
		linkElement.rel = "stylesheet";
		head.appendChild(linkElement);
		return linkElement;
	}
	
	function addStyle(obj, options) {
		var styleElement, update, remove;
	
		if (options.singleton) {
			var styleIndex = singletonCounter++;
			styleElement = singletonElement || (singletonElement = createStyleElement());
			update = applyToSingletonTag.bind(null, styleElement, styleIndex, false);
			remove = applyToSingletonTag.bind(null, styleElement, styleIndex, true);
		} else if(obj.sourceMap &&
			typeof URL === "function" &&
			typeof URL.createObjectURL === "function" &&
			typeof URL.revokeObjectURL === "function" &&
			typeof Blob === "function" &&
			typeof btoa === "function") {
			styleElement = createLinkElement();
			update = updateLink.bind(null, styleElement);
			remove = function() {
				styleElement.parentNode.removeChild(styleElement);
				if(styleElement.href)
					URL.revokeObjectURL(styleElement.href);
			};
		} else {
			styleElement = createStyleElement();
			update = applyToTag.bind(null, styleElement);
			remove = function() {
				styleElement.parentNode.removeChild(styleElement);
			};
		}
	
		update(obj);
	
		return function updateStyle(newObj) {
			if(newObj) {
				if(newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap)
					return;
				update(obj = newObj);
			} else {
				remove();
			}
		};
	}
	
	var replaceText = (function () {
		var textStore = [];
	
		return function (index, replacement) {
			textStore[index] = replacement;
			return textStore.filter(Boolean).join('\n');
		};
	})();
	
	function applyToSingletonTag(styleElement, index, remove, obj) {
		var css = remove ? "" : obj.css;
	
		if (styleElement.styleSheet) {
			styleElement.styleSheet.cssText = replaceText(index, css);
		} else {
			var cssNode = document.createTextNode(css);
			var childNodes = styleElement.childNodes;
			if (childNodes[index]) styleElement.removeChild(childNodes[index]);
			if (childNodes.length) {
				styleElement.insertBefore(cssNode, childNodes[index]);
			} else {
				styleElement.appendChild(cssNode);
			}
		}
	}
	
	function applyToTag(styleElement, obj) {
		var css = obj.css;
		var media = obj.media;
		var sourceMap = obj.sourceMap;
	
		if(media) {
			styleElement.setAttribute("media", media)
		}
	
		if(styleElement.styleSheet) {
			styleElement.styleSheet.cssText = css;
		} else {
			while(styleElement.firstChild) {
				styleElement.removeChild(styleElement.firstChild);
			}
			styleElement.appendChild(document.createTextNode(css));
		}
	}
	
	function updateLink(linkElement, obj) {
		var css = obj.css;
		var media = obj.media;
		var sourceMap = obj.sourceMap;
	
		if(sourceMap) {
			// http://stackoverflow.com/a/26603875
			css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */";
		}
	
		var blob = new Blob([css], { type: "text/css" });
	
		var oldSrc = linkElement.href;
	
		linkElement.href = URL.createObjectURL(blob);
	
		if(oldSrc)
			URL.revokeObjectURL(oldSrc);
	}


/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	var asEmitter = __webpack_require__(4);
	
	
	var DEBUG = false;
	
	var emitter = asEmitter({});
	
	
	module.exports = {
		dispatch: function(action) {
			if(DEBUG) {
				console.log('Action dispatched:', action);
			}
	
			emitter.emit(action.type, action);
		},
		register: function(actionType, fn) {
			emitter.on(actionType, fn);
		}
	};


/***/ },
/* 11 */
/***/ function(module, exports) {

	var TYPE = 3;
	
	
	module.exports = exports = function(open, url) {
		return {type: TYPE, open: open, url: url};
	};
	
	
	exports.type = TYPE;


/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	var dispatcher = __webpack_require__(10);
	
	var QR_TRAY_ACTION = __webpack_require__(11).type;
	
	var asStore = __webpack_require__(13);
	
	
	var qrCodeTray = asStore({
		open: false,
		displayedUrl: 'about:blank'
	});
	
	
	dispatcher.register(QR_TRAY_ACTION, function(payload) {
		qrCodeTray.open = payload.open;
	
		if(payload.url) {
			qrCodeTray.displayedUrl = payload.url;
		}
	
		qrCodeTray.emitChange();
	});
	
	
	module.exports = qrCodeTray;


/***/ },
/* 13 */
/***/ function(module, exports) {

	function asStore(a) {
		var handlers = [];
	
		a.onChange = function(fn) {
			if(handlers.indexOf(fn) !== -1) {
				throw new Error('Same callback registered twice: ' + fn);
			}
	
			handlers.push(fn);
	
			// Initialize
			fn();
		};
	
		a.emitChange = function() {
			handlers.forEach(function(handler) {
				handler();
			});
		};
	
		return a;
	}
	
	
	module.exports = asStore;


/***/ },
/* 14 */
/***/ function(module, exports) {

	var QRCode;!function(){function a(a){this.mode=c.MODE_8BIT_BYTE,this.data=a,this.parsedData=[];for(var b=[],d=0,e=this.data.length;e>d;d++){var f=this.data.charCodeAt(d);f>65536?(b[0]=240|(1835008&f)>>>18,b[1]=128|(258048&f)>>>12,b[2]=128|(4032&f)>>>6,b[3]=128|63&f):f>2048?(b[0]=224|(61440&f)>>>12,b[1]=128|(4032&f)>>>6,b[2]=128|63&f):f>128?(b[0]=192|(1984&f)>>>6,b[1]=128|63&f):b[0]=f,this.parsedData=this.parsedData.concat(b)}this.parsedData.length!=this.data.length&&(this.parsedData.unshift(191),this.parsedData.unshift(187),this.parsedData.unshift(239))}function b(a,b){this.typeNumber=a,this.errorCorrectLevel=b,this.modules=null,this.moduleCount=0,this.dataCache=null,this.dataList=[]}function i(a,b){if(void 0==a.length)throw new Error(a.length+"/"+b);for(var c=0;c<a.length&&0==a[c];)c++;this.num=new Array(a.length-c+b);for(var d=0;d<a.length-c;d++)this.num[d]=a[d+c]}function j(a,b){this.totalCount=a,this.dataCount=b}function k(){this.buffer=[],this.length=0}function m(){return"undefined"!=typeof CanvasRenderingContext2D}function n(){var a=!1,b=navigator.userAgent;return/android/i.test(b)&&(a=!0,aMat=b.toString().match(/android ([0-9]\.[0-9])/i),aMat&&aMat[1]&&(a=parseFloat(aMat[1]))),a}function r(a,b){for(var c=1,e=s(a),f=0,g=l.length;g>=f;f++){var h=0;switch(b){case d.L:h=l[f][0];break;case d.M:h=l[f][1];break;case d.Q:h=l[f][2];break;case d.H:h=l[f][3]}if(h>=e)break;c++}if(c>l.length)throw new Error("Too long data");return c}function s(a){var b=encodeURI(a).toString().replace(/\%[0-9a-fA-F]{2}/g,"a");return b.length+(b.length!=a?3:0)}a.prototype={getLength:function(){return this.parsedData.length},write:function(a){for(var b=0,c=this.parsedData.length;c>b;b++)a.put(this.parsedData[b],8)}},b.prototype={addData:function(b){var c=new a(b);this.dataList.push(c),this.dataCache=null},isDark:function(a,b){if(0>a||this.moduleCount<=a||0>b||this.moduleCount<=b)throw new Error(a+","+b);return this.modules[a][b]},getModuleCount:function(){return this.moduleCount},make:function(){this.makeImpl(!1,this.getBestMaskPattern())},makeImpl:function(a,c){this.moduleCount=4*this.typeNumber+17,this.modules=new Array(this.moduleCount);for(var d=0;d<this.moduleCount;d++){this.modules[d]=new Array(this.moduleCount);for(var e=0;e<this.moduleCount;e++)this.modules[d][e]=null}this.setupPositionProbePattern(0,0),this.setupPositionProbePattern(this.moduleCount-7,0),this.setupPositionProbePattern(0,this.moduleCount-7),this.setupPositionAdjustPattern(),this.setupTimingPattern(),this.setupTypeInfo(a,c),this.typeNumber>=7&&this.setupTypeNumber(a),null==this.dataCache&&(this.dataCache=b.createData(this.typeNumber,this.errorCorrectLevel,this.dataList)),this.mapData(this.dataCache,c)},setupPositionProbePattern:function(a,b){for(var c=-1;7>=c;c++)if(!(-1>=a+c||this.moduleCount<=a+c))for(var d=-1;7>=d;d++)-1>=b+d||this.moduleCount<=b+d||(this.modules[a+c][b+d]=c>=0&&6>=c&&(0==d||6==d)||d>=0&&6>=d&&(0==c||6==c)||c>=2&&4>=c&&d>=2&&4>=d?!0:!1)},getBestMaskPattern:function(){for(var a=0,b=0,c=0;8>c;c++){this.makeImpl(!0,c);var d=f.getLostPoint(this);(0==c||a>d)&&(a=d,b=c)}return b},createMovieClip:function(a,b,c){var d=a.createEmptyMovieClip(b,c),e=1;this.make();for(var f=0;f<this.modules.length;f++)for(var g=f*e,h=0;h<this.modules[f].length;h++){var i=h*e,j=this.modules[f][h];j&&(d.beginFill(0,100),d.moveTo(i,g),d.lineTo(i+e,g),d.lineTo(i+e,g+e),d.lineTo(i,g+e),d.endFill())}return d},setupTimingPattern:function(){for(var a=8;a<this.moduleCount-8;a++)null==this.modules[a][6]&&(this.modules[a][6]=0==a%2);for(var b=8;b<this.moduleCount-8;b++)null==this.modules[6][b]&&(this.modules[6][b]=0==b%2)},setupPositionAdjustPattern:function(){for(var a=f.getPatternPosition(this.typeNumber),b=0;b<a.length;b++)for(var c=0;c<a.length;c++){var d=a[b],e=a[c];if(null==this.modules[d][e])for(var g=-2;2>=g;g++)for(var h=-2;2>=h;h++)this.modules[d+g][e+h]=-2==g||2==g||-2==h||2==h||0==g&&0==h?!0:!1}},setupTypeNumber:function(a){for(var b=f.getBCHTypeNumber(this.typeNumber),c=0;18>c;c++){var d=!a&&1==(1&b>>c);this.modules[Math.floor(c/3)][c%3+this.moduleCount-8-3]=d}for(var c=0;18>c;c++){var d=!a&&1==(1&b>>c);this.modules[c%3+this.moduleCount-8-3][Math.floor(c/3)]=d}},setupTypeInfo:function(a,b){for(var c=this.errorCorrectLevel<<3|b,d=f.getBCHTypeInfo(c),e=0;15>e;e++){var g=!a&&1==(1&d>>e);6>e?this.modules[e][8]=g:8>e?this.modules[e+1][8]=g:this.modules[this.moduleCount-15+e][8]=g}for(var e=0;15>e;e++){var g=!a&&1==(1&d>>e);8>e?this.modules[8][this.moduleCount-e-1]=g:9>e?this.modules[8][15-e-1+1]=g:this.modules[8][15-e-1]=g}this.modules[this.moduleCount-8][8]=!a},mapData:function(a,b){for(var c=-1,d=this.moduleCount-1,e=7,g=0,h=this.moduleCount-1;h>0;h-=2)for(6==h&&h--;;){for(var i=0;2>i;i++)if(null==this.modules[d][h-i]){var j=!1;g<a.length&&(j=1==(1&a[g]>>>e));var k=f.getMask(b,d,h-i);k&&(j=!j),this.modules[d][h-i]=j,e--,-1==e&&(g++,e=7)}if(d+=c,0>d||this.moduleCount<=d){d-=c,c=-c;break}}}},b.PAD0=236,b.PAD1=17,b.createData=function(a,c,d){for(var e=j.getRSBlocks(a,c),g=new k,h=0;h<d.length;h++){var i=d[h];g.put(i.mode,4),g.put(i.getLength(),f.getLengthInBits(i.mode,a)),i.write(g)}for(var l=0,h=0;h<e.length;h++)l+=e[h].dataCount;if(g.getLengthInBits()>8*l)throw new Error("code length overflow. ("+g.getLengthInBits()+">"+8*l+")");for(g.getLengthInBits()+4<=8*l&&g.put(0,4);0!=g.getLengthInBits()%8;)g.putBit(!1);for(;;){if(g.getLengthInBits()>=8*l)break;if(g.put(b.PAD0,8),g.getLengthInBits()>=8*l)break;g.put(b.PAD1,8)}return b.createBytes(g,e)},b.createBytes=function(a,b){for(var c=0,d=0,e=0,g=new Array(b.length),h=new Array(b.length),j=0;j<b.length;j++){var k=b[j].dataCount,l=b[j].totalCount-k;d=Math.max(d,k),e=Math.max(e,l),g[j]=new Array(k);for(var m=0;m<g[j].length;m++)g[j][m]=255&a.buffer[m+c];c+=k;var n=f.getErrorCorrectPolynomial(l),o=new i(g[j],n.getLength()-1),p=o.mod(n);h[j]=new Array(n.getLength()-1);for(var m=0;m<h[j].length;m++){var q=m+p.getLength()-h[j].length;h[j][m]=q>=0?p.get(q):0}}for(var r=0,m=0;m<b.length;m++)r+=b[m].totalCount;for(var s=new Array(r),t=0,m=0;d>m;m++)for(var j=0;j<b.length;j++)m<g[j].length&&(s[t++]=g[j][m]);for(var m=0;e>m;m++)for(var j=0;j<b.length;j++)m<h[j].length&&(s[t++]=h[j][m]);return s};for(var c={MODE_NUMBER:1,MODE_ALPHA_NUM:2,MODE_8BIT_BYTE:4,MODE_KANJI:8},d={L:1,M:0,Q:3,H:2},e={PATTERN000:0,PATTERN001:1,PATTERN010:2,PATTERN011:3,PATTERN100:4,PATTERN101:5,PATTERN110:6,PATTERN111:7},f={PATTERN_POSITION_TABLE:[[],[6,18],[6,22],[6,26],[6,30],[6,34],[6,22,38],[6,24,42],[6,26,46],[6,28,50],[6,30,54],[6,32,58],[6,34,62],[6,26,46,66],[6,26,48,70],[6,26,50,74],[6,30,54,78],[6,30,56,82],[6,30,58,86],[6,34,62,90],[6,28,50,72,94],[6,26,50,74,98],[6,30,54,78,102],[6,28,54,80,106],[6,32,58,84,110],[6,30,58,86,114],[6,34,62,90,118],[6,26,50,74,98,122],[6,30,54,78,102,126],[6,26,52,78,104,130],[6,30,56,82,108,134],[6,34,60,86,112,138],[6,30,58,86,114,142],[6,34,62,90,118,146],[6,30,54,78,102,126,150],[6,24,50,76,102,128,154],[6,28,54,80,106,132,158],[6,32,58,84,110,136,162],[6,26,54,82,110,138,166],[6,30,58,86,114,142,170]],G15:1335,G18:7973,G15_MASK:21522,getBCHTypeInfo:function(a){for(var b=a<<10;f.getBCHDigit(b)-f.getBCHDigit(f.G15)>=0;)b^=f.G15<<f.getBCHDigit(b)-f.getBCHDigit(f.G15);return(a<<10|b)^f.G15_MASK},getBCHTypeNumber:function(a){for(var b=a<<12;f.getBCHDigit(b)-f.getBCHDigit(f.G18)>=0;)b^=f.G18<<f.getBCHDigit(b)-f.getBCHDigit(f.G18);return a<<12|b},getBCHDigit:function(a){for(var b=0;0!=a;)b++,a>>>=1;return b},getPatternPosition:function(a){return f.PATTERN_POSITION_TABLE[a-1]},getMask:function(a,b,c){switch(a){case e.PATTERN000:return 0==(b+c)%2;case e.PATTERN001:return 0==b%2;case e.PATTERN010:return 0==c%3;case e.PATTERN011:return 0==(b+c)%3;case e.PATTERN100:return 0==(Math.floor(b/2)+Math.floor(c/3))%2;case e.PATTERN101:return 0==b*c%2+b*c%3;case e.PATTERN110:return 0==(b*c%2+b*c%3)%2;case e.PATTERN111:return 0==(b*c%3+(b+c)%2)%2;default:throw new Error("bad maskPattern:"+a)}},getErrorCorrectPolynomial:function(a){for(var b=new i([1],0),c=0;a>c;c++)b=b.multiply(new i([1,g.gexp(c)],0));return b},getLengthInBits:function(a,b){if(b>=1&&10>b)switch(a){case c.MODE_NUMBER:return 10;case c.MODE_ALPHA_NUM:return 9;case c.MODE_8BIT_BYTE:return 8;case c.MODE_KANJI:return 8;default:throw new Error("mode:"+a)}else if(27>b)switch(a){case c.MODE_NUMBER:return 12;case c.MODE_ALPHA_NUM:return 11;case c.MODE_8BIT_BYTE:return 16;case c.MODE_KANJI:return 10;default:throw new Error("mode:"+a)}else{if(!(41>b))throw new Error("type:"+b);switch(a){case c.MODE_NUMBER:return 14;case c.MODE_ALPHA_NUM:return 13;case c.MODE_8BIT_BYTE:return 16;case c.MODE_KANJI:return 12;default:throw new Error("mode:"+a)}}},getLostPoint:function(a){for(var b=a.getModuleCount(),c=0,d=0;b>d;d++)for(var e=0;b>e;e++){for(var f=0,g=a.isDark(d,e),h=-1;1>=h;h++)if(!(0>d+h||d+h>=b))for(var i=-1;1>=i;i++)0>e+i||e+i>=b||(0!=h||0!=i)&&g==a.isDark(d+h,e+i)&&f++;f>5&&(c+=3+f-5)}for(var d=0;b-1>d;d++)for(var e=0;b-1>e;e++){var j=0;a.isDark(d,e)&&j++,a.isDark(d+1,e)&&j++,a.isDark(d,e+1)&&j++,a.isDark(d+1,e+1)&&j++,(0==j||4==j)&&(c+=3)}for(var d=0;b>d;d++)for(var e=0;b-6>e;e++)a.isDark(d,e)&&!a.isDark(d,e+1)&&a.isDark(d,e+2)&&a.isDark(d,e+3)&&a.isDark(d,e+4)&&!a.isDark(d,e+5)&&a.isDark(d,e+6)&&(c+=40);for(var e=0;b>e;e++)for(var d=0;b-6>d;d++)a.isDark(d,e)&&!a.isDark(d+1,e)&&a.isDark(d+2,e)&&a.isDark(d+3,e)&&a.isDark(d+4,e)&&!a.isDark(d+5,e)&&a.isDark(d+6,e)&&(c+=40);for(var k=0,e=0;b>e;e++)for(var d=0;b>d;d++)a.isDark(d,e)&&k++;var l=Math.abs(100*k/b/b-50)/5;return c+=10*l}},g={glog:function(a){if(1>a)throw new Error("glog("+a+")");return g.LOG_TABLE[a]},gexp:function(a){for(;0>a;)a+=255;for(;a>=256;)a-=255;return g.EXP_TABLE[a]},EXP_TABLE:new Array(256),LOG_TABLE:new Array(256)},h=0;8>h;h++)g.EXP_TABLE[h]=1<<h;for(var h=8;256>h;h++)g.EXP_TABLE[h]=g.EXP_TABLE[h-4]^g.EXP_TABLE[h-5]^g.EXP_TABLE[h-6]^g.EXP_TABLE[h-8];for(var h=0;255>h;h++)g.LOG_TABLE[g.EXP_TABLE[h]]=h;i.prototype={get:function(a){return this.num[a]},getLength:function(){return this.num.length},multiply:function(a){for(var b=new Array(this.getLength()+a.getLength()-1),c=0;c<this.getLength();c++)for(var d=0;d<a.getLength();d++)b[c+d]^=g.gexp(g.glog(this.get(c))+g.glog(a.get(d)));return new i(b,0)},mod:function(a){if(this.getLength()-a.getLength()<0)return this;for(var b=g.glog(this.get(0))-g.glog(a.get(0)),c=new Array(this.getLength()),d=0;d<this.getLength();d++)c[d]=this.get(d);for(var d=0;d<a.getLength();d++)c[d]^=g.gexp(g.glog(a.get(d))+b);return new i(c,0).mod(a)}},j.RS_BLOCK_TABLE=[[1,26,19],[1,26,16],[1,26,13],[1,26,9],[1,44,34],[1,44,28],[1,44,22],[1,44,16],[1,70,55],[1,70,44],[2,35,17],[2,35,13],[1,100,80],[2,50,32],[2,50,24],[4,25,9],[1,134,108],[2,67,43],[2,33,15,2,34,16],[2,33,11,2,34,12],[2,86,68],[4,43,27],[4,43,19],[4,43,15],[2,98,78],[4,49,31],[2,32,14,4,33,15],[4,39,13,1,40,14],[2,121,97],[2,60,38,2,61,39],[4,40,18,2,41,19],[4,40,14,2,41,15],[2,146,116],[3,58,36,2,59,37],[4,36,16,4,37,17],[4,36,12,4,37,13],[2,86,68,2,87,69],[4,69,43,1,70,44],[6,43,19,2,44,20],[6,43,15,2,44,16],[4,101,81],[1,80,50,4,81,51],[4,50,22,4,51,23],[3,36,12,8,37,13],[2,116,92,2,117,93],[6,58,36,2,59,37],[4,46,20,6,47,21],[7,42,14,4,43,15],[4,133,107],[8,59,37,1,60,38],[8,44,20,4,45,21],[12,33,11,4,34,12],[3,145,115,1,146,116],[4,64,40,5,65,41],[11,36,16,5,37,17],[11,36,12,5,37,13],[5,109,87,1,110,88],[5,65,41,5,66,42],[5,54,24,7,55,25],[11,36,12],[5,122,98,1,123,99],[7,73,45,3,74,46],[15,43,19,2,44,20],[3,45,15,13,46,16],[1,135,107,5,136,108],[10,74,46,1,75,47],[1,50,22,15,51,23],[2,42,14,17,43,15],[5,150,120,1,151,121],[9,69,43,4,70,44],[17,50,22,1,51,23],[2,42,14,19,43,15],[3,141,113,4,142,114],[3,70,44,11,71,45],[17,47,21,4,48,22],[9,39,13,16,40,14],[3,135,107,5,136,108],[3,67,41,13,68,42],[15,54,24,5,55,25],[15,43,15,10,44,16],[4,144,116,4,145,117],[17,68,42],[17,50,22,6,51,23],[19,46,16,6,47,17],[2,139,111,7,140,112],[17,74,46],[7,54,24,16,55,25],[34,37,13],[4,151,121,5,152,122],[4,75,47,14,76,48],[11,54,24,14,55,25],[16,45,15,14,46,16],[6,147,117,4,148,118],[6,73,45,14,74,46],[11,54,24,16,55,25],[30,46,16,2,47,17],[8,132,106,4,133,107],[8,75,47,13,76,48],[7,54,24,22,55,25],[22,45,15,13,46,16],[10,142,114,2,143,115],[19,74,46,4,75,47],[28,50,22,6,51,23],[33,46,16,4,47,17],[8,152,122,4,153,123],[22,73,45,3,74,46],[8,53,23,26,54,24],[12,45,15,28,46,16],[3,147,117,10,148,118],[3,73,45,23,74,46],[4,54,24,31,55,25],[11,45,15,31,46,16],[7,146,116,7,147,117],[21,73,45,7,74,46],[1,53,23,37,54,24],[19,45,15,26,46,16],[5,145,115,10,146,116],[19,75,47,10,76,48],[15,54,24,25,55,25],[23,45,15,25,46,16],[13,145,115,3,146,116],[2,74,46,29,75,47],[42,54,24,1,55,25],[23,45,15,28,46,16],[17,145,115],[10,74,46,23,75,47],[10,54,24,35,55,25],[19,45,15,35,46,16],[17,145,115,1,146,116],[14,74,46,21,75,47],[29,54,24,19,55,25],[11,45,15,46,46,16],[13,145,115,6,146,116],[14,74,46,23,75,47],[44,54,24,7,55,25],[59,46,16,1,47,17],[12,151,121,7,152,122],[12,75,47,26,76,48],[39,54,24,14,55,25],[22,45,15,41,46,16],[6,151,121,14,152,122],[6,75,47,34,76,48],[46,54,24,10,55,25],[2,45,15,64,46,16],[17,152,122,4,153,123],[29,74,46,14,75,47],[49,54,24,10,55,25],[24,45,15,46,46,16],[4,152,122,18,153,123],[13,74,46,32,75,47],[48,54,24,14,55,25],[42,45,15,32,46,16],[20,147,117,4,148,118],[40,75,47,7,76,48],[43,54,24,22,55,25],[10,45,15,67,46,16],[19,148,118,6,149,119],[18,75,47,31,76,48],[34,54,24,34,55,25],[20,45,15,61,46,16]],j.getRSBlocks=function(a,b){var c=j.getRsBlockTable(a,b);if(void 0==c)throw new Error("bad rs block @ typeNumber:"+a+"/errorCorrectLevel:"+b);for(var d=c.length/3,e=[],f=0;d>f;f++)for(var g=c[3*f+0],h=c[3*f+1],i=c[3*f+2],k=0;g>k;k++)e.push(new j(h,i));return e},j.getRsBlockTable=function(a,b){switch(b){case d.L:return j.RS_BLOCK_TABLE[4*(a-1)+0];case d.M:return j.RS_BLOCK_TABLE[4*(a-1)+1];case d.Q:return j.RS_BLOCK_TABLE[4*(a-1)+2];case d.H:return j.RS_BLOCK_TABLE[4*(a-1)+3];default:return void 0}},k.prototype={get:function(a){var b=Math.floor(a/8);return 1==(1&this.buffer[b]>>>7-a%8)},put:function(a,b){for(var c=0;b>c;c++)this.putBit(1==(1&a>>>b-c-1))},getLengthInBits:function(){return this.length},putBit:function(a){var b=Math.floor(this.length/8);this.buffer.length<=b&&this.buffer.push(0),a&&(this.buffer[b]|=128>>>this.length%8),this.length++}};var l=[[17,14,11,7],[32,26,20,14],[53,42,32,24],[78,62,46,34],[106,84,60,44],[134,106,74,58],[154,122,86,64],[192,152,108,84],[230,180,130,98],[271,213,151,119],[321,251,177,137],[367,287,203,155],[425,331,241,177],[458,362,258,194],[520,412,292,220],[586,450,322,250],[644,504,364,280],[718,560,394,310],[792,624,442,338],[858,666,482,382],[929,711,509,403],[1003,779,565,439],[1091,857,611,461],[1171,911,661,511],[1273,997,715,535],[1367,1059,751,593],[1465,1125,805,625],[1528,1190,868,658],[1628,1264,908,698],[1732,1370,982,742],[1840,1452,1030,790],[1952,1538,1112,842],[2068,1628,1168,898],[2188,1722,1228,958],[2303,1809,1283,983],[2431,1911,1351,1051],[2563,1989,1423,1093],[2699,2099,1499,1139],[2809,2213,1579,1219],[2953,2331,1663,1273]],o=function(){var a=function(a,b){this._el=a,this._htOption=b};return a.prototype.draw=function(a){function g(a,b){var c=document.createElementNS("http://www.w3.org/2000/svg",a);for(var d in b)b.hasOwnProperty(d)&&c.setAttribute(d,b[d]);return c}var b=this._htOption,c=this._el,d=a.getModuleCount();Math.floor(b.width/d),Math.floor(b.height/d),this.clear();var h=g("svg",{viewBox:"0 0 "+String(d)+" "+String(d),width:"100%",height:"100%",fill:b.colorLight});h.setAttributeNS("http://www.w3.org/2000/xmlns/","xmlns:xlink","http://www.w3.org/1999/xlink"),c.appendChild(h),h.appendChild(g("rect",{fill:b.colorDark,width:"1",height:"1",id:"template"}));for(var i=0;d>i;i++)for(var j=0;d>j;j++)if(a.isDark(i,j)){var k=g("use",{x:String(i),y:String(j)});k.setAttributeNS("http://www.w3.org/1999/xlink","href","#template"),h.appendChild(k)}},a.prototype.clear=function(){for(;this._el.hasChildNodes();)this._el.removeChild(this._el.lastChild)},a}(),p="svg"===document.documentElement.tagName.toLowerCase(),q=p?o:m()?function(){function a(){this._elImage.src=this._elCanvas.toDataURL("image/png"),this._elImage.style.display="block",this._elCanvas.style.display="none"}function d(a,b){var c=this;if(c._fFail=b,c._fSuccess=a,null===c._bSupportDataURI){var d=document.createElement("img"),e=function(){c._bSupportDataURI=!1,c._fFail&&_fFail.call(c)},f=function(){c._bSupportDataURI=!0,c._fSuccess&&c._fSuccess.call(c)};return d.onabort=e,d.onerror=e,d.onload=f,d.src="data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==",void 0}c._bSupportDataURI===!0&&c._fSuccess?c._fSuccess.call(c):c._bSupportDataURI===!1&&c._fFail&&c._fFail.call(c)}if(this._android&&this._android<=2.1){var b=1/window.devicePixelRatio,c=CanvasRenderingContext2D.prototype.drawImage;CanvasRenderingContext2D.prototype.drawImage=function(a,d,e,f,g,h,i,j){if("nodeName"in a&&/img/i.test(a.nodeName))for(var l=arguments.length-1;l>=1;l--)arguments[l]=arguments[l]*b;else"undefined"==typeof j&&(arguments[1]*=b,arguments[2]*=b,arguments[3]*=b,arguments[4]*=b);c.apply(this,arguments)}}var e=function(a,b){this._bIsPainted=!1,this._android=n(),this._htOption=b,this._elCanvas=document.createElement("canvas"),this._elCanvas.width=b.width,this._elCanvas.height=b.height,a.appendChild(this._elCanvas),this._el=a,this._oContext=this._elCanvas.getContext("2d"),this._bIsPainted=!1,this._elImage=document.createElement("img"),this._elImage.style.display="none",this._el.appendChild(this._elImage),this._bSupportDataURI=null};return e.prototype.draw=function(a){var b=this._elImage,c=this._oContext,d=this._htOption,e=a.getModuleCount(),f=d.width/e,g=d.height/e,h=Math.round(f),i=Math.round(g);b.style.display="none",this.clear();for(var j=0;e>j;j++)for(var k=0;e>k;k++){var l=a.isDark(j,k),m=k*f,n=j*g;c.strokeStyle=l?d.colorDark:d.colorLight,c.lineWidth=1,c.fillStyle=l?d.colorDark:d.colorLight,c.fillRect(m,n,f,g),c.strokeRect(Math.floor(m)+.5,Math.floor(n)+.5,h,i),c.strokeRect(Math.ceil(m)-.5,Math.ceil(n)-.5,h,i)}this._bIsPainted=!0},e.prototype.makeImage=function(){this._bIsPainted&&d.call(this,a)},e.prototype.isPainted=function(){return this._bIsPainted},e.prototype.clear=function(){this._oContext.clearRect(0,0,this._elCanvas.width,this._elCanvas.height),this._bIsPainted=!1},e.prototype.round=function(a){return a?Math.floor(1e3*a)/1e3:a},e}():function(){var a=function(a,b){this._el=a,this._htOption=b};return a.prototype.draw=function(a){for(var b=this._htOption,c=this._el,d=a.getModuleCount(),e=Math.floor(b.width/d),f=Math.floor(b.height/d),g=['<table style="border:0;border-collapse:collapse;">'],h=0;d>h;h++){g.push("<tr>");for(var i=0;d>i;i++)g.push('<td style="border:0;border-collapse:collapse;padding:0;margin:0;width:'+e+"px;height:"+f+"px;background-color:"+(a.isDark(h,i)?b.colorDark:b.colorLight)+';"></td>');g.push("</tr>")}g.push("</table>"),c.innerHTML=g.join("");var j=c.childNodes[0],k=(b.width-j.offsetWidth)/2,l=(b.height-j.offsetHeight)/2;k>0&&l>0&&(j.style.margin=l+"px "+k+"px")},a.prototype.clear=function(){this._el.innerHTML=""},a}();QRCode=function(a,b){if(this._htOption={width:256,height:256,typeNumber:4,colorDark:"#000000",colorLight:"#ffffff",correctLevel:d.H},"string"==typeof b&&(b={text:b}),b)for(var c in b)this._htOption[c]=b[c];"string"==typeof a&&(a=document.getElementById(a)),this._android=n(),this._el=a,this._oQRCode=null,this._oDrawing=new q(this._el,this._htOption),this._htOption.text&&this.makeCode(this._htOption.text)},QRCode.prototype.makeCode=function(a){this._oQRCode=new b(r(a,this._htOption.correctLevel),this._htOption.correctLevel),this._oQRCode.addData(a),this._oQRCode.make(),this._el.title=a,this._oDrawing.draw(this._oQRCode),this.makeImage()},QRCode.prototype.makeImage=function(){"function"==typeof this._oDrawing.makeImage&&(!this._android||this._android>=3)&&this._oDrawing.makeImage()},QRCode.prototype.clear=function(){this._oDrawing.clear()},QRCode.CorrectLevel=d}();module.exports=QRCode;


/***/ },
/* 15 */
/***/ function(module, exports) {

	/*
	 * Sprint JavaScript Library v0.9.2
	 * http://sprintjs.com
	 *
	 * Copyright (c) 2014, 2015 Benjamin De Cock
	 * Released under the MIT license
	 * http://sprintjs.com/license
	 */
	
	var Sprint;
	
	(function() {
	  "use strict";
	
	  var addEventListeners = function(listeners, el) {
	    var sprintClone = Sprint(el)
	    var events = Object.keys(listeners)
	    var eventsLen = events.length
	
	    for (var i = 0; i < eventsLen; i++) {
	      var event = events[i]
	      var handlers = listeners[event]
	      var handlersLen = handlers.length
	
	      for (var j = 0; j < handlersLen; j++) {
	        sprintClone.on(event, handlers[j])
	      }
	    }
	  }
	
	  var addPx = (function() {
	    var noPx = [
	      "animation-iteration-count",
	      "column-count",
	      "flex-grow",
	      "flex-shrink",
	      "font-weight",
	      "line-height",
	      "opacity",
	      "order",
	      "orphans",
	      "widows",
	      "z-index"
	    ]
	    return function addPx(cssProperty, value) {
	      if (inArray(cssProperty, noPx)) return value
	      var stringValue = typeof value == "string" ? value : value.toString()
	      if (value && !/\D/.test(stringValue)) {
	        stringValue += "px"
	      }
	      return stringValue
	    }
	  }())
	
	  var createDOM = function(HTMLString) {
	    var tmp = document.createElement("div")
	    var tag = /[\w:-]+/.exec(HTMLString)[0]
	    var inMap = wrapMap[tag]
	    var validHTML = HTMLString.trim()
	    if (inMap) {
	      validHTML = inMap.intro + validHTML + inMap.outro
	    }
	    tmp.insertAdjacentHTML("afterbegin", validHTML)
	    var node = tmp.lastChild
	    if (inMap) {
	      var i = inMap.outro.match(/</g).length
	      while (i--) {
	        node = node.lastChild
	      }
	    }
	    // prevent tmp to be node's parentNode
	    tmp.textContent = ""
	    return node
	  }
	
	  var domMethods = {
	    afterbegin: function(el) {
	      this.insertBefore(el, this.firstChild)
	    },
	    afterend: function(el) {
	      var parent = this.parentElement
	      parent && parent.insertBefore(el, this.nextSibling)
	    },
	    beforebegin: function(el) {
	      var parent = this.parentElement
	      parent && parent.insertBefore(el, this)
	    },
	    beforeend: function(el) {
	      this.appendChild(el)
	    }
	  }
	
	  var duplicateEventListeners = function(el, clone) {
	    // Element nodes only
	    if (el.nodeType > 1) return
	
	    // Duplicate event listeners for the parent element...
	    var listeners = getEvents(el)
	    listeners && addEventListeners(listeners, clone)
	
	    // ... and its descendants.
	    var descendants = selectElements("*", el)
	    var descendantsLen = descendants.length
	
	    // cloneDescendants is defined later to avoid calling selectElements() if not needed
	    var cloneDescendants
	
	    for (var i = 0; i < descendantsLen; i++) {
	      var listeners = getEvents(descendants[i])
	      if (!listeners) continue
	      if (!cloneDescendants) {
	        cloneDescendants = selectElements("*", clone)
	      }
	      addEventListeners(listeners, cloneDescendants[i])
	    }
	  }
	
	  var findAncestors = function(startAtParent, limitToParent, limitToFirstMatch, selector, context) {
	    var dom = []
	    var self = this
	    this.each(function() {
	      var prt = startAtParent ? this.parentElement : this
	      while (prt) {
	        if (context && context == prt) break
	        if (!selector || self.is(selector, prt)) {
	          dom.push(prt)
	          if (limitToFirstMatch) break
	        }
	        if (limitToParent) break
	        prt = prt.parentElement
	      }
	    })
	    return Sprint(removeDuplicates(dom))
	  }
	
	  var getEventFromNamespace = function(event) {
	    return splitNamespaces(event)[0]
	  }
	
	  var getEvents = function(domElement) {
	    return domElement.sprintEventListeners
	  }
	
	  var getEventsToRemove = function(domElement, event) {
	    /*
	     * Returns an array with the sprintEventListeners events matching potentially
	     * incomplete event names passed to .off().
	     * Example: .off("click.myPlugin") and .off("click.simple") would both remove a
	     * "click.myPlugin.simple" event.
	     */
	    return Object.keys(getEvents(domElement)).filter(function(prop) {
	      return splitNamespaces(event).every(function(name) {
	        return inArray(name, splitNamespaces(prop))
	      })
	    })
	  }
	
	  var getSetDimension = function(obj, prop, value) {
	    // get
	    if (value == null) {
	      var el = obj.get(0)
	      if (!el || el.nodeType > 1) return
	      var capitalizedProp = prop[0].toUpperCase() + prop.substring(1)
	      // dimension of HTML document
	      if (el == document) {
	        var offset = root["offset" + capitalizedProp]
	        var inner = window["inner" + capitalizedProp]
	        return offset > inner ? offset : inner
	      }
	      // dimension of viewport
	      if (el == window) {
	        return window["inner" + capitalizedProp]
	      }
	      // dimension of element
	      return el.getBoundingClientRect()[prop]
	    }
	
	    // set
	    var isFunction = typeof value == "function"
	    var stringValue = isFunction ? "" : addPx(prop, value)
	    return obj.each(function(index) {
	      if (this == document || this == window || this.nodeType > 1) return
	      if (isFunction) {
	        stringValue = addPx(prop, value.call(this, index, Sprint(this)[prop]()))
	      }
	      this.style[prop] = stringValue
	    })
	  }
	
	  var insertHTML = function(position, args) {
	    var argsLen = args.length
	    var contents = args
	
	    // reverse argument list for afterbegin and afterend
	    if (argsLen > 1 && position.indexOf("after") > -1) {
	      contents = []
	      var i = argsLen
	      while (i--) {
	        contents.push(args[i])
	      }
	    }
	
	    for (var i = 0; i < argsLen; i++) {
	      var content = contents[i]
	      if (typeof content == "string" || typeof content == "number") {
	        this.each(function() {
	          this.insertAdjacentHTML(position, content)
	        })
	      }
	      else if (typeof content == "function") {
	        this.each(function(index) {
	          var callbackValue = content.call(this, index, this.innerHTML)
	          insertHTML.call(Sprint(this), position, [callbackValue])
	        })
	      }
	      else {
	        var isSprintObj = content instanceof Init
	        var clonedElements = []
	        var elementsToInsert = (function() {
	          if (isSprintObj) {
	            return content.get()
	          }
	          if (Array.isArray(content)) {
	            return sanitize(content, true, true)
	          }
	          // DOM node
	          if (content.nodeType) {
	            return [content]
	          }
	          // getElementsByTagName, getElementsByClassName, querySelectorAll
	          return toArray(content)
	        }())
	        var elementsToInsertLen = elementsToInsert.length
	
	        this.each(function(index) {
	          /*
	           * The fragment serves multiple purposes:
	           * 1) It significantly boosts perf when multiple elements are added.
	           * 2) It avoids the need for elementsToInsert.reverse() for afterbegin and afterend
	           * 3) It removes an element from its original position before adding it back, which is
	           * especially useful for elements not part of the DOM tree. That means it's important even
	           * when elementsToInsertLen == 1.
	           */
	          var fragment = document.createDocumentFragment()
	          for (var i = 0; i < elementsToInsertLen; i++) {
	            var element = elementsToInsert[i]
	            var elementToInsert
	            if (index) {
	              elementToInsert = element.cloneNode(true)
	              duplicateEventListeners(element, elementToInsert)
	            }
	            else {
	              elementToInsert = element
	            }
	            fragment.appendChild(elementToInsert)
	            clonedElements.push(elementToInsert)
	          }
	          domMethods[position].call(this, fragment)
	        })
	
	        if (isSprintObj) {
	          content.dom = clonedElements
	          content.length = clonedElements.length
	        }
	        if (i < argsLen-1) continue
	        return clonedElements
	      }
	    }
	  }
	
	  var inArray = function(el, arr) {
	    var i = arr.length
	    while (i--) {
	      if (arr[i] === el) return true
	    }
	    return false
	  }
	
	  var isNamespaced = function(event) {
	    return /\./.test(event)
	  }
	
	  var manipulateClass = function(method, className, bool) {
	    if (className == null) {
	      if (method == "add") {
	        return this
	      }
	      return this.removeAttr("class")
	    }
	
	    var isString
	    var classNames
	    var classNamesLen
	
	    if (typeof className == "string") {
	      isString = true
	      classNames = className.trim().split(" ")
	      classNamesLen = classNames.length
	    }
	
	    return this.each(function(i, el) {
	      if (this.nodeType > 1) return
	      if (!isString) {
	        // className is a function
	        var callbackValue = className.call(el, i, el.className)
	        if (!callbackValue) return
	        classNames = callbackValue.trim().split(" ")
	        classNamesLen = classNames.length
	      }
	      for (var j = 0; j < classNamesLen; j++) {
	        var name = classNames[j]
	        if (!name) continue
	        bool == null
	          ? el.classList[method](name)
	          : el.classList.toggle(name, bool)
	      }
	    })
	  }
	
	  var matches = (function() {
	    var names = [
	      "mozMatchesSelector",
	      "webkitMatchesSelector",
	      "msMatchesSelector",
	      "matches"
	    ]
	    var i = names.length
	    while (i--) {
	      var name = names[i]
	      if (!Element.prototype[name]) continue
	      return name
	    }
	  }())
	
	  var removeDuplicates = function(arr) {
	    var clean = []
	    var cleanLen = 0
	    var arrLen = arr.length
	
	    for (var i = 0; i < arrLen; i++) {
	      var el = arr[i]
	      var duplicate = false
	
	      for (var j = 0; j < cleanLen; j++) {
	        if (el !== clean[j]) continue
	        duplicate = true
	        break
	      }
	
	      if (duplicate) continue
	      clean[cleanLen++] = el
	    }
	
	    return clean
	  }
	
	  var removeEvent = (function() {
	    var isHandlerShared = function(el, event, registeredHandler) {
	      var similarEventsHandlers = Object.keys(getEvents(el)).filter(function(prop) {
	        return getEventFromNamespace(event) === getEventFromNamespace(prop)
	      }).map(function(ev) {
	        return getEvents(el)[ev]
	      }).reduce(function(a, b) {
	        return a.concat(b)
	      }).filter(function(handler) {
	        return handler === registeredHandler
	      })
	      if (similarEventsHandlers.length < 2) return false
	      return true
	    }
	    var removeListener = function(el, event, namedHandler) {
	      return function(registeredHandler) {
	        if (namedHandler && namedHandler !== registeredHandler) return
	        el.removeEventListener(event, registeredHandler)
	        if (!isNamespaced(event) || isHandlerShared(el, event, registeredHandler)) return
	        el.removeEventListener(getEventFromNamespace(event), registeredHandler)
	      }
	    }
	    var clearRegisteredHandlers = function(registeredHandlers, namedHandler) {
	      return registeredHandlers.filter(function(handler) {
	        return namedHandler && namedHandler !== handler
	      })
	    }
	    return function(el, namedHandler) {
	      return function(event) {
	        getEvents(el)[event].forEach(removeListener(el, event, namedHandler))
	        getEvents(el)[event] = clearRegisteredHandlers(getEvents(el)[event], namedHandler)
	      }
	    }
	  }())
	
	  var removeMatchedEvents = function(el, namedHandler) {
	    return function(event) {
	      getEventsToRemove(el, event).forEach(removeEvent(el, namedHandler))
	    }
	  }
	
	  var root = document.documentElement
	
	  var sanitize = function(arr, flattenObjects, requireDomNodes) {
	    /*
	     * Remove null's from array. Optionally, flatten Sprint objects and convert strings and numbers
	     * to DOM text nodes.
	     */
	    var arrLen = arr.length
	    var i = arrLen
	
	    // Check if arr needs to be sanitized first (significant perf boost for the most common case)
	    while (i--) {
	      // arr needs to be sanitized
	      if ( (!arr[i] && arr[i] !== 0)
	        || (flattenObjects && arr[i] instanceof Init)
	        || (requireDomNodes && (typeof arr[i] == "string" || typeof arr[i] == "number"))
	      ) {
	        var sanitized = []
	        for (var j = 0; j < arrLen; j++) {
	          var el = arr[j]
	          if (!el && el !== 0) continue
	          if (flattenObjects && el instanceof Init) {
	            for (var k = 0; k < el.length; k++) {
	              sanitized.push(el.get(k))
	            }
	            continue
	          }
	          if (requireDomNodes && (typeof el == "string" || typeof el == "number")) {
	            sanitized.push(document.createTextNode(el))
	            continue
	          }
	          sanitized.push(el)
	        }
	        return sanitized
	      }
	    }
	
	    // arr didn't need to be sanitized, return it
	    return arr
	  }
	
	  var scroll = (function() {
	    var scrollRoot
	    return function(sprintObj, method, value) {
	      // define scroll root element on first run
	      if (!scrollRoot) {
	        var initialScrollPos = root.scrollTop
	        root.scrollTop = initialScrollPos + 1
	        var updatedScrollPos = root.scrollTop
	        root.scrollTop = initialScrollPos
	        scrollRoot = updatedScrollPos > initialScrollPos
	          ? root // spec-compliant browsers (like FF34 and IE11)
	          : document.body // naughty boys (like Chrome 39 and Safari 8)
	      }
	
	      // get scroll position
	      if (value == null) {
	        var el = sprintObj.get(0)
	        if (!el) return
	        if (el == window || el == document) {
	          el = scrollRoot
	        }
	        return el[method]
	      }
	
	      // set scroll position
	      return sprintObj.each(function() {
	        var el = this
	        if (el == window || el == document) {
	          el = scrollRoot
	        }
	        el[method] = value
	      })
	    }
	  }())
	
	  var selectAdjacentSiblings = function(sprintObj, direction, selector, until) {
	    var dom = []
	    var prop = direction + "ElementSibling"
	    sprintObj.each(function() {
	      var el = this
	      while (el = el[prop]) {
	        if (until && sprintObj.is(until, el)) break
	        if (selector && !sprintObj.is(selector, el)) continue
	        dom.push(el)
	      }
	    })
	    return Sprint(removeDuplicates(dom))
	  }
	
	  var selectImmediateAdjacentSibling = function(sprintObj, direction, selector) {
	    var prop = direction + "ElementSibling"
	    return sprintObj.map(function() {
	      var el = this[prop]
	      if (!el || (selector && !sprintObj.is(selector, el))) return
	      return el
	    }, false)
	  }
	
	  var selectElements = function(selector, context) {
	    context = context || document
	    // class, id, tag name or universal selector
	    if (/^[\#.]?[\w-]+$/.test(selector)) {
	      var firstChar = selector[0]
	      if (firstChar == ".") {
	        return toArray(context.getElementsByClassName(selector.slice(1)))
	      }
	      if (firstChar == "#") {
	        var el = context.getElementById(selector.slice(1))
	        return el ? [el] : []
	      }
	      if (selector == "body") {
	        return [document.body]
	      }
	      return toArray(context.getElementsByTagName(selector))
	    }
	    return toArray(context.querySelectorAll(selector))
	  }
	
	  var splitNamespaces = function(event) {
	    return sanitize(event.split("."))
	  }
	
	  var toArray = function(obj) {
	    var arr = []
	    var i = obj.length
	    while (i--) {
	      arr[i] = obj[i]
	    }
	    return arr
	  }
	
	  var wrap = (function() {
	    var callback = function(wrappingElement, variant) {
	      var wrap = Sprint(wrappingElement).clone(true).get(0)
	      var innerWrap = wrap
	      if (!wrap || this.nodeType > 1) return
	      while (innerWrap.firstChild) {
	        innerWrap = innerWrap.firstChild
	      }
	      if (variant == "inner") {
	        while (this.firstChild) {
	          innerWrap.appendChild(this.firstChild)
	        }
	        this.appendChild(wrap)
	      }
	      else {
	        var el = variant == "all" ? this.get(0) : this
	        var prt = el.parentNode
	        var next = el.nextSibling
	        variant == "all"
	          ? this.each(function() { innerWrap.appendChild(this) })
	          : innerWrap.appendChild(el)
	        prt.insertBefore(wrap, next)
	      }
	    }
	    return function(wrappingElement, variant) {
	      if (typeof wrappingElement == "function") {
	        this.each(function(i) {
	          Sprint(this)[variant == "inner" ? "wrapInner" : "wrap"](wrappingElement.call(this, i))
	        })
	      }
	      else {
	        variant == "all"
	          ? callback.call(this, wrappingElement, variant)
	          : this.each(function() { callback.call(this, wrappingElement, variant) })
	      }
	      return this
	    }
	  }())
	
	  var wrapMap = {
	    legend: {
	      intro: "<fieldset>",
	      outro: "</fieldset>"
	    },
	    area: {
	      intro: "<map>",
	      outro: "</map>"
	    },
	    param: {
	      intro: "<object>",
	      outro: "</object>"
	    },
	    thead: {
	      intro: "<table>",
	      outro: "</table>"
	    },
	    tr: {
	      intro: "<table><tbody>",
	      outro: "</tbody></table>"
	    },
	    col: {
	      intro: "<table><tbody></tbody><colgroup>",
	      outro: "</colgroup></table>"
	    },
	    td: {
	      intro: "<table><tbody><tr>",
	      outro: "</tr></tbody></table>"
	    }
	  };
	  // elements needing a construct already defined by other elements
	  ["tbody", "tfoot", "colgroup", "caption"].forEach(function(tag) {
	    wrapMap[tag] = wrapMap.thead
	  })
	  wrapMap.th = wrapMap.td
	
	  // constructor
	
	  var Init = function(selector, context) {
	    if (typeof selector == "string") {
	      // create DOM element
	      if (selector[0] == "<") {
	        this.dom = [createDOM(selector)]
	      }
	      // select DOM elements
	      else {
	        this.dom = context && context instanceof Init
	          ? context.find(selector).get()
	          : selectElements(selector, context)
	      }
	    }
	    else if (Array.isArray(selector)) {
	      this.dom = sanitize(selector)
	    }
	    else if (
	      selector instanceof NodeList ||
	      selector instanceof HTMLCollection
	    ) {
	      this.dom = toArray(selector)
	    }
	    else if (selector instanceof Init) {
	      return selector
	    }
	    else if (typeof selector == "function") {
	      return this.ready(selector)
	    }
	    else {
	      // assume DOM node
	      this.dom = selector ? [selector] : []
	    }
	    this.length = this.dom.length
	  }
	
	  Init.prototype = {
	    add: function(selector) {
	      var dom = this.get()
	      var objToAdd = Sprint(selector)
	      var domToAdd = objToAdd.get()
	      for (var i = 0; i < objToAdd.length; i++) {
	        dom.push(domToAdd[i])
	      }
	      return Sprint(removeDuplicates(dom))
	    },
	    addClass: function(className) {
	      return manipulateClass.call(this, "add", className)
	    },
	    after: function() {
	      insertHTML.call(this, "afterend", arguments)
	      return this
	    },
	    append: function() {
	      insertHTML.call(this, "beforeend", arguments)
	      return this
	    },
	    appendTo: function(target) {
	      return Sprint(insertHTML.call(Sprint(target), "beforeend", [this]))
	    },
	    attr: function(name, value) {
	      var isFunc = typeof value == "function"
	      if (typeof value == "string" || typeof value == "number" || isFunc) {
	        return this.each(function(i) {
	          if (this.nodeType > 1) return
	          this.setAttribute(
	            name, isFunc ? value.call(this, i, this.getAttribute(name)) : value
	          )
	        })
	      }
	      if (typeof name == "object") {
	        var attrNames = Object.keys(name)
	        var attrNamesLen = attrNames.length
	        return this.each(function() {
	          if (this.nodeType > 1) return
	          for (var i = 0; i < attrNamesLen; i++) {
	            var attribute = attrNames[i]
	            this.setAttribute(attribute, name[attribute])
	          }
	        })
	      }
	      var el = this.get(0)
	      if (!el || el.nodeType > 1) return
	      var attrValue = el.getAttribute(name)
	      if (attrValue == null) {
	        return undefined
	      }
	      if (!attrValue) {
	        return name
	      }
	      return attrValue
	    },
	    before: function() {
	      insertHTML.call(this, "beforebegin", arguments)
	      return this
	    },
	    children: function(selector) {
	      var dom = []
	      var self = this
	      this.each(function() {
	        if (this.nodeType > 1) return
	        var nodes = this.children
	        var nodesLen = nodes.length
	        for (var i = 0; i < nodesLen; i++) {
	          var node = nodes[i]
	          if (!selector || self.is(selector, node)) {
	            dom.push(node)
	          }
	        }
	      })
	      return Sprint(dom)
	    },
	    clone: function(withEvents) {
	      return this.map(function() {
	        if (!this) return
	        var clone = this.cloneNode(true)
	        withEvents && duplicateEventListeners(this, clone)
	        return clone
	      }, false)
	    },
	    closest: function(selector, context) {
	      return findAncestors.call(this, false, false, true, selector, context)
	    },
	    css: function(property, value) {
	      var valueType = typeof value
	      var isString = valueType == "string"
	
	      // set
	      if (isString || valueType == "number") {
	        var isRelativeValue = isString && /=/.test(value)
	        if (isRelativeValue) {
	          var relativeValue = parseInt(value[0] + value.slice(2))
	        }
	        return this.each(function() {
	          if (this.nodeType > 1) return
	          if (isRelativeValue) {
	            var current = parseInt(getComputedStyle(this).getPropertyValue(property))
	            var result = current + relativeValue
	          }
	          this.style[property] = addPx(property, isRelativeValue ? result : value)
	        })
	      }
	      // set
	      if (valueType == "function") {
	        return this.each(function(index) {
	          if (this.nodeType > 1) return
	          var oldValue = getComputedStyle(this).getPropertyValue(property)
	          this.style[property] = value.call(this, index, oldValue)
	        })
	      }
	      // read
	      if (typeof property == "string") {
	        var el = this.get(0)
	        if (!el || el.nodeType > 1) return
	        return getComputedStyle(el).getPropertyValue(property)
	      }
	      // read
	      if (Array.isArray(property)) {
	        var el = this.get(0)
	        if (!el || el.nodeType > 1) return
	        var o = {}
	        var styles = getComputedStyle(el)
	        var propertyLen = property.length
	        for (var i = 0; i < propertyLen; i++) {
	          var prop = property[i]
	          o[prop] = styles.getPropertyValue(prop)
	        }
	        return o
	      }
	      // set
	      var properties = Object.keys(property)
	      var propertiesLen = properties.length
	      return this.each(function() {
	        if (this.nodeType > 1) return
	        for (var i = 0; i < propertiesLen; i++) {
	          var prop = properties[i]
	          this.style[prop] = addPx(prop, property[prop])
	        }
	      })
	    },
	    detach: function() {
	      return this.map(function() {
	        var parent = this.parentElement
	        if (!parent) return
	        parent.removeChild(this)
	        return this
	      }, false)
	    },
	    each: function(callback) {
	      // callback(index, element) where element == this
	      var dom = this.dom
	      var len = this.length
	      for (var i = 0; i < len; i++) {
	        var node = dom[i]
	        callback.call(node, i, node)
	      }
	      return this
	    },
	    empty: function() {
	      return this.each(function() {
	        this.innerHTML = ""
	      })
	    },
	    eq: function(index) {
	      return Sprint(this.get(index))
	    },
	    filter: function(selector) {
	      var isFunc = typeof selector == "function"
	      var self = this
	      return this.map(function(i) {
	        if ( this.nodeType > 1
	          || (!isFunc && !self.is(selector, this))
	          || (isFunc && !selector.call(this, i, this))
	        ) return
	        return this
	      }, false)
	    },
	    find: function(selector) {
	      // .find(selector)
	      if (typeof selector == "string") {
	        var dom = []
	        this.each(function() {
	          if (this.nodeType > 1) return
	          var elements = selectElements(selector, this)
	          var elementsLen = elements.length
	          for (var i = 0; i < elementsLen; i++) {
	            dom.push(elements[i])
	          }
	        })
	        return Sprint(removeDuplicates(dom))
	      }
	
	      // .find(element)
	      var elementsToFind = selector.nodeType ? [selector] : selector.get()
	      var elementsToFindLen = elementsToFind.length
	      var elementsFound = []
	      var elementsFoundLen = 0
	
	      for (var i = 0; i < this.length; i++) {
	        var el = this.get(i)
	        if (el.nodeType > 1) continue
	        // check if each element in `this` contains the elements to find
	        for (var j = 0; j < elementsToFindLen; j++) {
	          var elementToFind = elementsToFind[j]
	          if (!el.contains(elementToFind)) continue
	          elementsFound[elementsFoundLen++] = elementToFind
	          if (elementsFoundLen < elementsToFindLen) continue
	          // everything has been found, return results
	          return Sprint(elementsFound)
	        }
	      }
	
	      // some elements in elementsToFind weren't descendants of `this`
	      return Sprint(elementsFound)
	    },
	    first: function() {
	      return this.eq(0)
	    },
	    get: function(index) {
	      if (index == null) {
	        return this.dom
	      }
	      if (index < 0) {
	        index += this.length
	      }
	      return this.dom[index]
	    },
	    has: function(selector) {
	      // .has(selector)
	      if (typeof selector == "string") {
	        return this.map(function() {
	          if (this.nodeType > 1 || !selectElements(selector, this)[0]) return
	          return this
	        }, false)
	      }
	
	      // .has(contained)
	      var result = []
	      var i = this.length
	      while (i--) {
	        var el = this.get(i)
	        if (!el.contains(selector)) continue
	        result.push(el)
	        break
	      }
	      return Sprint(result)
	    },
	    hasClass: function(name) {
	      var i = this.length
	      while (i--) {
	        var el = this.get(i)
	        if (el.nodeType > 1) return
	        if (el.classList.contains(name)) {
	          return true
	        }
	      }
	      return false
	    },
	    height: function(value) {
	      return getSetDimension(this, "height", value)
	    },
	    html: function(htmlString) {
	      if (htmlString == null) {
	        var el = this.get(0)
	        if (!el) return
	        return el.innerHTML
	      }
	      if (typeof htmlString == "function") {
	        return this.each(function(i) {
	          var content = htmlString.call(this, i, this.innerHTML)
	          Sprint(this).html(content)
	        })
	      }
	      return this.each(function() {
	        this.innerHTML = htmlString
	      })
	    },
	    index: function(el) {
	      if (!this.length) return
	      var toFind
	      var sprintElements
	      if (!el) {
	        toFind = this.get(0)
	        sprintElements = this.first().parent().children()
	      }
	      else if (typeof el == "string") {
	        toFind = this.get(0)
	        sprintElements = Sprint(el)
	      }
	      else {
	        toFind = el instanceof Init ? el.get(0) : el
	        sprintElements = this
	      }
	      var elements = sprintElements.get()
	      var i = elements.length
	      while (i--) {
	        if (elements[i] == toFind) {
	          return i
	        }
	      }
	      return -1
	    },
	    insertAfter: function(target) {
	      Sprint(target).after(this)
	      return this
	    },
	    insertBefore: function(target) {
	      Sprint(target).before(this)
	      return this
	    },
	    is: function(selector, element) {
	      // element is undocumented, internal-use only.
	      // It gives better perfs as it prevents the creation of many objects in internal methods.
	      var set = element ? [element] : this.get()
	      var setLen = set.length
	
	      if (typeof selector == "string") {
	        for (var i = 0; i < setLen; i++) {
	          var el = set[i]
	          if (el.nodeType > 1) continue
	          if (el[matches](selector)) {
	            return true
	          }
	        }
	        return false
	      }
	      if (typeof selector == "object") {
	        // Sprint object or DOM element(s)
	        var obj
	        if (selector instanceof Init) {
	          obj = selector.get()
	        }
	        else {
	          obj = selector.length ? selector : [selector]
	        }
	        var objLen = obj.length
	        for (var i = 0; i < setLen; i++) {
	          for (var j = 0; j < objLen; j++) {
	            if (set[i] === obj[j]) {
	              return true
	            }
	          }
	        }
	        return false
	      }
	      if (typeof selector == "function") {
	        for (var i = 0; i < setLen; i++) {
	          if (selector.call(this, i, this)) {
	            return true
	          }
	        }
	        return false
	      }
	    },
	    last: function() {
	      return this.eq(-1)
	    },
	    map: function(callback, flattenArrays) {
	      /*
	       * flattenArrays (bool, true by default) is for internal usage only (although it might be
	       * interesting to document it publicly).
	       * Many methods rely on map(), thus being able to avoid the unnecessary Array.isArray() check
	       * on each element is a significant perf boost.
	       */
	      if (flattenArrays == null) {
	        flattenArrays = true
	      }
	
	      var dom = this.get()
	      var len = this.length
	      var values = []
	
	      for (var i = 0; i < len; i++) {
	        var el = dom[i]
	        var val = callback.call(el, i, el)
	
	        if (flattenArrays && Array.isArray(val)) {
	          var valLen = val.length
	          for (var j = 0; j < valLen; j++) {
	            values.push(val[j])
	          }
	          continue
	        }
	
	        values.push(val)
	      }
	
	      return Sprint(values)
	    },
	    next: function(selector) {
	      return selectImmediateAdjacentSibling(this, "next", selector)
	    },
	    nextAll: function(selector) {
	      return selectAdjacentSiblings(this, "next", selector)
	    },
	    nextUntil: function(selector, filter) {
	      return selectAdjacentSiblings(this, "next", filter, selector)
	    },
	    not: function(selector) {
	      var isFunc = typeof selector == "function"
	      var self = this
	      return this.map(function(i) {
	        if (isFunc) {
	          if (selector.call(this, i, this)) return
	        }
	        else {
	          if (self.is(selector, this)) return
	        }
	        return this
	      }, false)
	    },
	    off: function(events, handler) {
	      if (typeof events == "object") {
	        Object.keys(events).forEach(function(event) {
	          this.off(event, events[event])
	        }, this)
	        return this
	      }
	      if (events) {
	        events = events.trim().split(" ")
	      }
	      return this.each(function() {
	        if (!getEvents(this)) return
	        if (events) {
	          events.forEach(removeMatchedEvents(this, handler))
	          return
	        }
	        Object.keys(getEvents(this)).forEach(removeEvent(this))
	      })
	    },
	    offset: function(coordinates) {
	      if (!coordinates) {
	        var el = this.get(0)
	        if (!el || el.nodeType > 1) return
	        var pos = el.getBoundingClientRect()
	        return {
	          top: pos.top,
	          left: pos.left
	        }
	      }
	      if (typeof coordinates == "object") {
	        return this.each(function() {
	          if (this.nodeType > 1) return
	          var $this = Sprint(this)
	          $this.css("position") == "static"
	            ? $this.css("position", "relative")
	            : $this.css({
	              top: 0,
	              left: 0
	            })
	          var pos = $this.offset()
	          $this.css({
	            top: coordinates.top - pos.top + "px",
	            left: coordinates.left - pos.left + "px"
	          })
	        })
	      }
	      if (typeof coordinates == "function") {
	        return this.each(function(i) {
	          var $this = Sprint(this)
	          var posObj = coordinates.call(this, i, $this.offset())
	          $this.offset(posObj)
	        })
	      }
	    },
	    offsetParent: function() {
	      var dom = []
	      this.each(function() {
	        if (this.nodeType > 1) return
	        var prt = this
	        while (prt != root) {
	          prt = prt.parentNode
	          var pos = getComputedStyle(prt).getPropertyValue("position")
	          if (!pos) break
	          if (pos != "static") {
	            dom.push(prt)
	            return
	          }
	        }
	        dom.push(root)
	      })
	      return Sprint(dom)
	    },
	    on: function(events, handler) {
	      // .on(events, handler)
	      if (handler) {
	        var eventsArr = events.trim().split(" ")
	
	        return this.each(function() {
	          if (!getEvents(this)) {
	            this.sprintEventListeners = {}
	          }
	          eventsArr.forEach(function(event) {
	            if (!getEvents(this)[event]) {
	              getEvents(this)[event] = []
	            }
	            getEvents(this)[event].push(handler)
	
	            // Ensure we add both the standard event (eg: "click") and the full event
	            // (eg: "click.foo") in order to be able to trigger them manually and programmatically.
	            this.addEventListener(event, handler)
	            if (!isNamespaced(event)) return
	            this.addEventListener(getEventFromNamespace(event), handler)
	          }, this)
	        })
	      }
	
	      // .on({ event: handler })
	      Object.keys(events).forEach(function(event) {
	        this.on(event, events[event])
	      }, this)
	      return this
	    },
	    parent: function(selector) {
	      return findAncestors.call(this, true, true, false, selector)
	    },
	    parents: function(selector) {
	      /* Differences with jQuery:
	       * 1. $("html").parent() and $("html").parents() return an empty set.
	       * 2. The returned set won't be in reverse order.
	       */
	      return findAncestors.call(this, true, false, false, selector)
	    },
	    position: function() {
	      var pos = {
	        first: this.offset(),
	        prt: this.parent().offset()
	      }
	      if (!pos.first) return
	      return {
	        top: pos.first.top - pos.prt.top,
	        left: pos.first.left - pos.prt.left
	      }
	    },
	    prop: function(propertyName, value) {
	      if (typeof propertyName == "object") {
	        var props = Object.keys(propertyName)
	        var propsLen = props.length
	        return this.each(function() {
	          for (var i = 0; i < propsLen; i++) {
	            var prop = props[i]
	            this[prop] = propertyName[prop]
	          }
	        })
	      }
	      if (value == null) {
	        var el = this.get(0)
	        if (!el) return
	        return el[propertyName]
	      }
	      var isFunc = typeof value == "function"
	      return this.each(function(i) {
	        this[propertyName] = isFunc ? value.call(this, i, this[propertyName]) : value
	      })
	    },
	    prepend: function() {
	      insertHTML.call(this, "afterbegin", arguments)
	      return this
	    },
	    prependTo: function(target) {
	      return Sprint(insertHTML.call(Sprint(target), "afterbegin", [this]))
	    },
	    prev: function(selector) {
	      return selectImmediateAdjacentSibling(this, "previous", selector)
	    },
	    prevAll: function(selector) {
	      return selectAdjacentSiblings(this, "previous", selector)
	    },
	    prevUntil: function(selector, filter) {
	      return selectAdjacentSiblings(this, "previous", filter, selector)
	    },
	    ready: function(handler) {
	      this.dom = [document]
	      this.length = 1
	      return this.on("DOMContentLoaded", handler)
	    },
	    remove: function(selector) {
	      var self = this
	      return this.each(function() {
	        var parent = this.parentElement
	        if (!parent) return
	        if (!selector || self.is(selector, this)) {
	          parent.removeChild(this)
	        }
	      })
	    },
	    removeAttr: function(attributeName) {
	      if (attributeName) {
	        var attributes = attributeName.trim().split(" ")
	        var attributesLen = attributes.length
	        this.each(function() {
	          if (this.nodeType > 1) return
	          for (var i = 0; i < attributesLen; i++) {
	            this.removeAttribute(attributes[i])
	          }
	        })
	      }
	      return this
	    },
	    removeClass: function(className) {
	      return manipulateClass.call(this, "remove", className)
	    },
	    removeProp: function(propertyName) {
	      return this.each(function() {
	        this[propertyName] = undefined
	      })
	    },
	    replaceAll: function(target) {
	      Sprint(target).replaceWith(this)
	      return this
	    },
	    replaceWith: function(newContent) {
	      if (typeof newContent == "function") {
	        return this.each(function(i) {
	          Sprint(this).replaceWith(newContent.call(this, i, this))
	        })
	      }
	      return this.before(newContent).remove()
	    },
	    scrollLeft: function(value) {
	      return scroll(this, "scrollLeft", value)
	    },
	    scrollTop: function(value) {
	      return scroll(this, "scrollTop", value)
	    },
	    siblings: function(selector) {
	      var siblings = []
	      var self = this
	      this.each(function(i, el) {
	        Sprint(this).parent().children().each(function() {
	          if (this == el || (selector && !self.is(selector, this))) return
	          siblings.push(this)
	        })
	      })
	      return Sprint(siblings)
	    },
	    size: function() {
	      return this.length
	    },
	    slice: function(start, end) {
	      var dom = this.get()
	      var range = []
	      var i = start >= 0 ? start : start + this.length
	      var l = this.length
	      if (end < 0) {
	        l += end
	      }
	      else if (end >= 0) {
	        l = end > this.length ? this.length : end
	      }
	      for (; i < l; i++) {
	        range.push(dom[i])
	      }
	      return Sprint(range)
	    },
	    text: function(content) {
	      if (content == null) {
	        var textContents = []
	        this.each(function() {
	          textContents.push(this.textContent)
	        })
	        return textContents.join("")
	      }
	      var isFunc = typeof content == "function"
	      return this.each(function(i) {
	        this.textContent = isFunc ? content.call(this, i, this.textContent) : content
	      })
	    },
	    toggleClass: function(className, bool) {
	      return manipulateClass.call(this, "toggle", className, bool)
	    },
	    trigger: function(event) {
	      // IE polyfill
	      if (!window.CustomEvent || typeof window.CustomEvent !== "function") {
	        var CustomEvent = function(event, params) {
	          var evt
	          params = params || {
	            bubbles: false,
	            cancelable: false,
	            detail: undefined
	          }
	          evt = document.createEvent("CustomEvent")
	          evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail)
	          return evt
	        }
	        CustomEvent.prototype = window.Event.prototype
	        window.CustomEvent = CustomEvent
	      }
	      return this.each(function() {
	        getEventsToRemove(this, event).forEach(function(matchedEvent) {
	          this.dispatchEvent(new CustomEvent(matchedEvent, {
	            bubbles: true,
	            cancelable: true
	          }))
	        }, this)
	      })
	    },
	    unwrap: function() {
	      this.parent().each(function() {
	        if (this == document.body || this == root) return
	        Sprint(this).replaceWith(this.childNodes)
	      })
	      return this
	    },
	    val: function(value) {
	      if (value == null) {
	        var el = this.get(0)
	        if (!el) return
	        if (el.multiple) {
	          var values = []
	          this.first().children(":checked").each(function() {
	            values.push(this.value)
	          })
	          return values
	        }
	        return el.value
	      }
	      if (Array.isArray(value)) {
	        var self = this
	        return this.each(function() {
	          if (this.multiple) {
	            self.children().each(function() {
	              this.selected = inArray(this.value, value)
	            })
	            return
	          }
	          this.checked = inArray(this.value, value)
	        })
	      }
	      if (typeof value == "function") {
	        return this.each(function(i) {
	          Sprint(this).val(value.call(this, i, this.value))
	        })
	      }
	      return this.each(function() {
	        this.value = value
	      })
	    },
	    width: function(value) {
	      return getSetDimension(this, "width", value)
	    },
	    wrap: function(wrappingElement) {
	      return wrap.call(this, wrappingElement)
	    },
	    wrapAll: function(wrappingElement) {
	      return wrap.call(this, wrappingElement, "all")
	    },
	    wrapInner: function(wrappingElement) {
	      return wrap.call(this, wrappingElement, "inner")
	    }
	  }
	
	  // public
	
	  Sprint = function(selector, context) {
	    return new Init(selector, context)
	  }
	
	  module.exports = Sprint;
	}());


/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	var asEmitter = __webpack_require__(4);
	
	var $ = __webpack_require__(15);
	
	
	module.exports = function() {
		var holder = $('<div>')
		.css({
			display: 'inline'
		});
	
		var backdrop = $('<div>')
		.css({
			display: 'none',
			background: 'rgba(0, 0, 0, 0.25)',
			position: 'fixed',
			top: 0,
			left: 0,
			width: '100%',
			height: '100%',
			justifyContent: 'center',
			alignItems: 'center'
		})
		.on('click', function() {
			r.emit('backdrop-click');
		})
		.append(holder)
		.appendTo(document.body);
	
	
		var r = asEmitter({
			holder: holder.get(0),
			setOpen: function(open) {
				backdrop.css({display: open ? 'flex' : 'none'});
			}
		});
	
		return r;
	};


/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(18);
	
	
	var dispatch = __webpack_require__(10).dispatch;
	
	var iconSelectedAction = __webpack_require__(20);
	
	var iconTrayAction = __webpack_require__(21);
	
	var iconTrayStore = __webpack_require__(22);
	
	var $ = __webpack_require__(15);
	
	var createModalTray = __webpack_require__(16);
	
	
	function IconTrayView() {
		var self = this;
	
		var tray = self.tray = createModalTray()
		.on('backdrop-click', function() {
			dispatch(iconTrayAction(false));
		});
	
		$(tray.holder)
		.addClass('icontray')
		.on('click', function(e) {
			e.stopPropagation();
		});
	
		self._imgs = {};
	
		self._currentImg = null;
	
	
		self._setIcons(iconTrayStore.availableIconUrls);
	
		// TODO: Add a listener to the modal-tray and find out when it's been clicked, then emit a close action
	
		iconTrayStore.onChange(function(value, key) {
			switch(key) {
			case 'open':
				self.tray.setOpen(value);
				break;
	
			case 'selectedIconUrl':
				self._setCurrentIcon(value);
			}
		});
	}
	
	IconTrayView.prototype._setIcons = function(urlList) {
		var self = this;
	
		var holder = $(self.tray.holder);
	
		holder.children().remove();
	
		self._imgs = {};
	
		var iconElements = urlList.map(function(url) {
			return self._imgs[url] =
				$('<img>')
				.attr({src: url})
				.on('click', function(e) {
					dispatch(iconSelectedAction(url));
	
					// Looks nicer with a slight delay before closing
					setTimeout(function() {
						dispatch(iconTrayAction(false));
					}, 50);
				});
		});
	
		holder.append(iconElements);
	};
	
	IconTrayView.prototype._setCurrentIcon = function(url) {
		var currentImage = this._currentImg;
	
		if(currentImage) {
			currentImage.removeClass('selected');
		}
	
		this._currentImg = currentImage = this._imgs[url];
	
		currentImage.addClass('selected');
	};
	
	
	module.exports = function() {
		return new IconTrayView();
	};


/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag
	
	// load the styles
	var content = __webpack_require__(19);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(9)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../../../node_modules/css-loader/index.js!./style.css", function() {
				var newContent = require("!!./../../../../node_modules/css-loader/index.js!./style.css");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(8)();
	// imports
	
	
	// module
	exports.push([module.id, ".icontray {\n\tmax-width: 400px;\n\ttext-align: center;\n\n\tbackground: white;\n}\n\n.icontray > img {\n\tdisplay: inline-block;\n\n\tpadding: 10px;\n\n\tcursor: pointer;\n}\n\n.icontray > img.selected {\n\tbackground-color: #def;\n}\n", ""]);
	
	// exports


/***/ },
/* 20 */
/***/ function(module, exports) {

	var TYPE = 0;
	
	
	module.exports = exports = function(iconUrl) {
		return {type: TYPE, iconUrl: iconUrl};
	};
	
	
	exports.type = TYPE;


/***/ },
/* 21 */
/***/ function(module, exports) {

	var TYPE = 1;
	
	
	module.exports = exports = function(open) {
		return {type: TYPE, open: open};
	};
	
	
	exports.type = TYPE;


/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	var dispatcher = __webpack_require__(10);
	
	var stateroom = __webpack_require__(2);
	
	var ICON_TRAY_ACTION = __webpack_require__(21).type;
	
	var ICON_SELECTED_ACTION = __webpack_require__(20).type;
	
	var asMapStore = __webpack_require__(23);
	
	var configStore = __webpack_require__(24);
	
	
	var availableIconUrls = [
		'alligator',
		'ant',
		'bat',
		'bear',
		'bee',
		'bird',
		'blackcock',
		'butterfly',
		'camel',
		'cat',
		'chicken',
		'cow',
		'deer',
		'dog',
		'dolphin',
		'dragon',
		'dragonfly',
		'duck',
		'eggs',
		'elephant',
		'emu',
		'fox',
		'frog',
		'giraffe',
		'hare',
		'kangaroo',
		'leopard',
		'lobster',
		'monkey',
		'moose',
		'oyster',
		'paw',
		'penguin',
		'pig',
		'seal',
		'sealion',
		'shark',
		'snail',
		'snake',
		'spider',
		'squirrel',
		'tiger',
		'turtle',
		'whale'
	].map(function(name) {return '/icons/' + name + '.png'});
	
	
	
	var iconTray = asMapStore({
		availableIconUrls: availableIconUrls
	});
	
	iconTray.set('open', false);
	
	// Initialize
	var selfIconUrl = configStore.get('selfIconUrl');
	
	if(!selfIconUrl) {
		var iconIndex = Math.floor(Math.random() * availableIconUrls.length);
	
		selfIconUrl = availableIconUrls[iconIndex];
	}
	
	setSelfIconUrl(selfIconUrl);
	
	
	dispatcher.register(ICON_TRAY_ACTION, function(payload) {
		iconTray.set('open', payload.open);
	});
	
	dispatcher.register(ICON_SELECTED_ACTION, function(payload) {
		setSelfIconUrl(payload.iconUrl);
	});
	
	
	function setSelfIconUrl(url) {
		configStore.set('selfIconUrl', url);
	
		stateroom.set('i', url);
	
		iconTray.set('selectedIconUrl', url);
	}
	
	
	module.exports = iconTray;


/***/ },
/* 23 */
/***/ function(module, exports) {

	var hasOwnProperty = Object.prototype.hasOwnProperty;
	
	
	module.exports = function(a) {
		var items = Object.create(null);
	
		var addHandlers = [];
		var removeHandlers = [];
	
		function emitAdd(value, key, object) {
			addHandlers.forEach(function(handler) {
				handler(value, key, object);
			});
		}
	
		function emitRemove(value, key, object) {
			removeHandlers.forEach(function(handler) {
				handler(value, key, object);
			});
		}
	
	
		a.onChange = function(addFn, removeFn) {
			if(addHandlers.indexOf(addFn) !== -1) {
				throw new Error('Same add callback registered twice: ' + addFn);
			}
	
			addHandlers.push(addFn);
	
			if(removeHandlers.indexOf(removeFn) !== -1) {
				throw new Error('Same remove callback registered twice: ' + removeFn);
			}
	
			if(removeFn) {
				removeHandlers.push(removeFn);
			}
	
			// Initialize
			each(items, addFn);
		};
	
		a.get = function(key) {
			return items[key];
		};
	
		a.has = function(key) {
			return hasOwnProperty.call(items, key)
		};
	
		a.set = function(key, value) {
			if(hasOwnProperty.call(items, key)) {
				var removed = items[key];
	
				delete items[key];
	
				emitRemove(removed, key, items);
			}
	
			items[key] = value;
	
			emitAdd(value, key, items);
		};
	
		a.delete = function(key) {
			var removed = items[key];
	
			delete items[key];
	
			emitRemove(removed, key, items);
		};
	
		a.forEach = each.bind(null, items);
	
		return a;
	};
	
	
	function each(o, fn) {
		Object.keys(o).forEach(function(key) {
			fn(o[key], key, o);
		});
	}


/***/ },
/* 24 */
/***/ function(module, exports) {

	module.exports = {
		get: function(key) {
			return localStorage.getItem(key);
		},
		set: function(key, value) {
			localStorage.setItem(key, value);
		}
	};


/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	var dispatch = __webpack_require__(10).dispatch;
	
	var trackingSelfAction = __webpack_require__(26);
	
	var usersStore = __webpack_require__(27);
	
	var mapStore = __webpack_require__(28);
	
	var TrackButtonView = __webpack_require__(29);
	
	var QRButtonView = __webpack_require__(30);
	
	var IconButtonView = __webpack_require__(31);
	
	
	function MinimapView(elementId) {
		var trackButton = new TrackButtonView();
	
		var qrButton = new QRButtonView();
	
		var iconButton = new IconButtonView();
	
		var mapElement = document.getElementById(elementId);
	
		var map = new google.maps.Map(mapElement, {
			zoom: 20,
			center: {lat: 0, lng: 0},
			disableDefaultUI: true,
			// TODO Can we enable the scale control but set a min-max?
			mapTypeControl: true
		});
	
		map.controls[google.maps.ControlPosition.BOTTOM_LEFT].push(iconButton.el);
		map.controls[google.maps.ControlPosition.BOTTOM_LEFT].push(qrButton.el);
		map.controls[google.maps.ControlPosition.BOTTOM_LEFT].push(trackButton.el);
	
	
		// Whenever the map is manually moved stop tracking our marker
		google.maps.event.addListener(map, 'drag', function() {
			dispatch(trackingSelfAction(false));
		});
	
	
		// Keep the map markers in sync with the users in our room
		var selfMarker = null;
	
		var markers = {};
	
		usersStore.onChange(function(user) { // Add
			var marker = markers[user.id] = new google.maps.Marker({
				position: user.position,
				map: map,
				title: user.id,
				icon: user.iconUrl
			});
	
			if(user.isSelf) {
				selfMarker = marker;
			}
	
			user.onChange(function() {
				marker.setPosition(user.position);
	
				if(user.isSelf && mapStore.trackingSelf) {
					map.panTo(user.position);
				}
	
				marker.setIcon(user.iconUrl);
			});
		}, function(user) { // Remove
			markers[user.id].setMap(null);
	
			delete markers[user.id];
		});
	
		mapStore.onChange(function() {
			if(mapStore.trackingSelf && selfMarker) {
				map.panTo(selfMarker.getPosition());
			}
		});
	}
	
	
	module.exports = MinimapView;


/***/ },
/* 26 */
/***/ function(module, exports) {

	var TYPE = 2;
	// TODO: later come up with a better non-colliding way of making ids
	
	module.exports = exports = function(trackingSelf) {
		return {type: TYPE, trackingSelf: trackingSelf};
	};
	
	
	exports.type = TYPE;


/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

	var stateroom = __webpack_require__(2);
	
	var asMapStore = __webpack_require__(23);
	
	var asStore = __webpack_require__(13);
	
	
	var users = asMapStore({});
	
	
	stateroom.on('join', function(memberId) {
		var user = asStore({
			id: memberId,
			position: {lat: 0, lng: 0}
		});
	
		if(memberId === stateroom.id) {
			user.isSelf = true;
		}
	
		users.set(memberId, user);
	});
	
	stateroom.on('set', function(memberId, key, value) {
		var user = users.get(memberId);
	
		// When a member's position is updated, show it on the minimap
		switch(key) {
			case 'p': // Position
				user.position = JSON.parse(value);
				break;
	
			case 'i': // Icon
				user.iconUrl = value;
		}
	
		user.emitChange();
	});
	
	stateroom.on('part', function(memberId) {
		users.delete(memberId);
	});
	
	
	module.exports = users;


/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	var dispatcher = __webpack_require__(10);
	
	var TRACKING_SELF_ACTION = __webpack_require__(26).type;
	
	var asStore = __webpack_require__(13);
	
	
	var map = asStore({
		trackingSelf: true
	});
	
	
	dispatcher.register(TRACKING_SELF_ACTION, function(payload) {
		map.trackingSelf = payload.trackingSelf;
	
		map.emitChange();
	});
	
	
	module.exports = map;


/***/ },
/* 29 */
/***/ function(module, exports, __webpack_require__) {

	var dispatch = __webpack_require__(10).dispatch;
	
	var trackingSelfAction = __webpack_require__(26);
	
	var mapStore = __webpack_require__(28);
	
	var $ = __webpack_require__(15);
	
	
	function TrackButtonView() {
		var el = $('<button>')
		.css({
			display: 'none',
			width: '50px',
			height: '50px'
		})
		.html('<img title="Track Self" alt="Crosshair icon" src="/images/crosshair.png">')
		.on('click', function() {
			dispatch(trackingSelfAction(true));
		});
	
		mapStore.onChange(function() {
			el.css({display: mapStore.trackingSelf ? 'none' : 'block'});
		});
	
		this.el = el.get(0);
	}
	
	
	module.exports = TrackButtonView;


/***/ },
/* 30 */
/***/ function(module, exports, __webpack_require__) {

	var dispatch = __webpack_require__(10).dispatch;
	
	var qrTrayAction = __webpack_require__(11);
	
	var $ = __webpack_require__(15);
	
	
	function QRButtonView(dispatcher) {
		var el = $('<button>')
		.css({
			display: 'block',
			width: '50px',
			height: '50px'
		})
		.html('<img title="QR Link" alt="QR code icon" src="/images/qrcode.png">')
		.on('click', function() {
			dispatch(qrTrayAction(true, location.href));
		});
	
		this.el = el.get(0);
	}
	
	
	module.exports = QRButtonView;


/***/ },
/* 31 */
/***/ function(module, exports, __webpack_require__) {

	var dispatch = __webpack_require__(10).dispatch;
	
	var iconTrayAction = __webpack_require__(21);
	
	var $ = __webpack_require__(15);
	
	
	function IconButtonView() {
		var el = $('<button>')
		.css({
			display: 'block',
			width: '50px',
			height: '50px'
		})
		.html('<img title="Change Marker" alt="Map marker icon" src="/images/marker.png">')
		.on('click', function() {
			dispatch(iconTrayAction(true));
		});
	
		this.el = el.get(0);
	}
	
	
	module.exports = IconButtonView;


/***/ }
/******/ ]);
//# sourceMappingURL=minimap.js.map