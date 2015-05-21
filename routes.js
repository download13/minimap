var fs = require('fs');

var swsend = require('sw-send');

var hogan = require('hogan.js');

var router = require('http-router-fn')();


// TODO: cache

// TODO: canonicalUrl

var indexTemplate = hogan.compile(fs.readFileSync(__dirname + '/templates/index.html', 'utf8'));

var appTemplate = hogan.compile(fs.readFileSync(__dirname + '/templates/app.html', 'utf8'));


router.get('/', swsend, function(req, res) {
	res.send(indexTemplate.render());
});

router.get('/m/:roomname', swsend, function(req, res) {
	var roomname = req.params[0];

	res.send(appTemplate.render({roomname: roomname}));
});


module.exports = router;