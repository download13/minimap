var fs = require('fs');

var path = require('path');

var swsend = require('sw-send');

var hogan = require('hogan.js');

var config = require('../config');

var router = require('http-router-fn')();


var templatePath = path.resolve(__dirname, '..', 'templates');

function loadTemplate(name) {
	return hogan.compile(fs.readFileSync(path.join(templatePath, name + '.html'), 'utf8'));
}


var canonicalIndexUrl = 'http://' + config.domain + '/';


var indexTemplate = loadTemplate('index');

var appTemplate = loadTemplate('app');

// TODO: set cache headers
router.get('/', swsend, function(req, res) {
	res.send(indexTemplate.render({
		canonicalUrl: canonicalIndexUrl
	}));
});

router.get('/m/:roomname', swsend, function(req, res) {
	var roomname = req.params[0];

	res.send(appTemplate.render({
		canonicalUrl: canonicalIndexUrl + 'm/' + roomname,
		roomname: roomname
	}));
});


module.exports = router;

