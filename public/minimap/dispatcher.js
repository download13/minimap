var Emitter = require('./helpers/emitter').Emitter;


// Maybe later I'll understand the requirements of the dispatcher better
function Dispatcher() {
	this._emitter = new Emitter();

	this._dispatching = false;
}

Dispatcher.prototype.register = function(name, fn) {
	this._emitter.on(name, fn);
};

Dispatcher.prototype.dispatch = function() {
	this._emitter.emit.apply(this._emitter, arguments);
};


/*
Actions:

open-icon-tray - User is opening the icon selection tray

icon-selected <url> - User has selected an icon from the tray
*/
