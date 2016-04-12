import wordSlug from 'word-slug';
import qr from 'qr-image';


export default router => {
	router.get('/randomroom', function(req, res) {
		res.redirect('/m/' + wordSlug(3));
	});

	router.get('/m/:roomname', function(req, res) {
		res.sendFile('minimap.html', {root: 'dist'});
	});

	router.get('/qr/:roomname', function(req, res) {
		const img = qr.image(`${req.protocol}://${req.headers.host}/m/${req.params.roomname}`, {
			type: 'png',
			margin: 2
		});
		res.type('image/png');
		img.pipe(res);
	});
}
