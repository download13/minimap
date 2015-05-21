var http = require('http');

var mwCompose = require('mw-compose');

var fileMw = require('file-mw');



var app = mwCompose([
	fileMw(__dirname + '/public', {buffer: true, watch: true}), // TODO: Cache
	require('./routes'),
	notFound
]);

var server = http.createServer(app);

// Attach the websocket handler to the server
require('./hub')(server);

server.listen(80, function() {
	console.log('Listening on port 80');
});


function notFound(req, res) {
	res.writeHead(404);
	res.end('Not Found');
}
