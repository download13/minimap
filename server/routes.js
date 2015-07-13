var fs = require('fs');

var path = require('path');

var send = require('sw-send');

var redirect = require('sw-redirect');

var hogan = require('hogan.js');

var router = require('http-router-fn')();

var fileHandler = require('file-mw').createFileHandler;

var wordSlug = require('word-slug');


var templatePath = path.resolve(__dirname, '..', 'templates');

function loadTemplate(name) {
	return hogan.compile(fs.readFileSync(path.join(templatePath, name + '.html'), 'utf8'));
}

var appTemplate = loadTemplate('app');

// TODO: set cache headers
router.get('/', fileHandler(__dirname + '/../templates/index.html', {buffer: true}));

router.get('/randomroom', redirect, function(req, res) {
	res.redirect('/m/' + wordSlug(3));
});

router.get('/m/:roomname', send, function(req, res) {
	var roomname = req.params[0];

	res.send(appTemplate.render({roomname: roomname}));
});


module.exports = router;

