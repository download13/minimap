var TYPE = 2;
// TODO: later come up with a better non-colliding way of making ids

module.exports = exports = function(trackingSelf) {
	return {type: TYPE, trackingSelf: trackingSelf};
};


exports.type = TYPE;
