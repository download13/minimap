// Maybe have a better 404 handler someday.
// It doesn't really make any difference right now since
// the site is so simple you should never hit a 404 by following a link.
module.exports = function(req, res) {
	res.writeHead(404);
	res.end('Not Found');
}
