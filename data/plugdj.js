var artist = '';
var track = '';
var duration = 0;

var lastfmSession;

self.port.on('setSession', function(session) {
	lastfmSession = session;
})

check();

function check() {
	if (lastfmSession && unsafeWindow.API && unsafeWindow.API.getVolume()) {
		var API = unsafeWindow.API;

		var media = API.getMedia();

		if (media && media.author && media.title && media.duration) {
			if (artist !== media.author || track !== media.title || duration !== media.duration) {
				artist = media.author;
				track = media.title;
				duration = media.duration;

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
		'sk': lastfmSession,
		'artist': artist, 
		'track': track,
		'duration': duration
	}

	call('track.updateNowPlaying', updatePlaying, parameters);
}

function updatePlaying(data) {
	console.log('Success ', data);
}
