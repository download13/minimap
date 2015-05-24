var fs = require('fs');

var UglifyJS = require('uglify-js');


var result = UglifyJS.minify([
	'public/js/helpers/qrcode.min.js',
	'public/js/helpers/emitter.js',
	'public/js/helpers/model.js',
	'public/js/views/iconbutton.js',
	'public/js/views/icontray.js',
	'public/js/views/qrbutton.js',
	'public/js/views/qrcode.js',
	'public/js/views/trackbutton.js',
	'public/js/views/minimap.js',
	'public/js/models/profile.js',
	'public/js/models/minimap.js',
	'public/js/models/stateroom.js',
	'public/js/presenters/minimap.js'
]);

fs.writeFileSync('public/js/minimap.min.js', result.code);
