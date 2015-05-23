var http = require('http');

var mwCompose = require('mw-compose');


// Composes a middleware stack from handlers
var app = mwCompose([
	require('./static-files'),
	require('./routes'),
	require('./not-found')
]);

var server = http.createServer(app);

// Attach the websocket handler to the server
require('./websocket')(server);

// It's going to be in a Docker container so just listen on 80
server.listen(80, function() {
	console.log('Listening on port 80');
});
