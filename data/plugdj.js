var API = unsafeWindow.API;

var artist = '';
var track = '';
var duration = 0;

check();

function check() {
	if (API.getVolume()) {
		var media = API.getMedia();

		if (media && media.author && media.title && media.duration) {
			if (artist !== media.author || track !== media.title || duration !== media.duration) {
				artist = media.author;
				track = media.title;
				duration = media.duration;

				console.log(artist, ' ', track, ' ', duration);

				process();
			}
		}

		else {
			artist = '';
			track = '';
			duration = 0;
		}
	}

	window.setTimeout(check, 2000);
}

function process() {
	var parameters = {
		'method': 'track.updateNowPlaying',
		'api_key': lastfmKey,
		'artist': artist, 
		'track': track
	}
}
