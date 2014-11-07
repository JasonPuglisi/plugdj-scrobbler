var artist = '';
var track = '';
var duration = 0;

var unixStart = 0;
var start = 0;
var elapsed = 0;
var scrobbled = false;
var updated = false;

var selfPlaying = 0;

var lastfmSession;
var lastfmScrobbling;
var lastfmUpdating;

self.port.on('setSession', function(session) {
	lastfmSession = session;
});

self.port.on('setScrobbling', function(scrobble) {
	lastfmScrobbling = scrobble;

self.port.on('setUpdating', function(update) {
	lastfmUpdating = update;
});

checkMedia();

var checkMediaLoop;

function checkMedia(response) {
	if (response) {
		console.log('Scrobbled: ', response);
	}

	else {
		if (lastfmSession && unsafeWindow.API && unsafeWindow.API.getVolume()) {
			var media = unsafeWindow.API.getMedia();

			if (media && media.author && media.title && media.duration) {
				if (artist !== media.author || track !== media.title || duration !== media.duration) {
					artist = media.author;
					track = media.title;
					duration = media.duration;

					unixStart = Math.round(new Date().getTime() / 1000);
					start = unsafeWindow.API.getTimeElapsed();
					elapsed = 0;
					scrobbled = false;
					self.port.emit('scrobbled', false);
					updated = false;

					selfPlaying = 0;

					if (unsafeWindow.API.getUser().id === unsafeWindow.API.getDJ().id) selfPlaying = 1;
				}

				if (lastfmUpdating && !updated) {
					updated = true;
					updateNowPlaying();
				}

				if (lastfmScrobbling && !scrobbled && duration > 29) {
					var elapsed = unsafeWindow.API.getTimeElapsed() - start;

					if (elapsed >= Math.min(duration / 2, 240)) {
						scrobbled = true;
						self.port.emit('scrobbled', true);

						var parameters = {
							'sk': lastfmSession,
							'artist': artist, 
							'track': track, 
							'duration': duration,
							'timestamp': unixStart,
							'chosenByUser': selfPlaying
						};

						call('track.scrobble', checkMedia, parameters);
					}
				}
			}

			else {
				if (artist !== '' || track !== '' || duration !== 0) {
					artist = '';
					track = '';
					duration = 0;

					unixStart = 0;
					start = 0;
					elapsed = 0;
					scrobbled = false;
					self.port.emit('scrobbled', false);
					update = false;

					selfPlaying = 0;
				}
			}
		}

		checkMediaLoop = window.setTimeout(checkMedia, 2000);
	}
}

function updateNowPlaying(response) {
	if (response) {
		console.log('Updated now playing: ', response);
	}

	else {
		var parameters = {
			'sk': lastfmSession,
			'artist': artist, 
			'track': track,
			'duration': duration
		}

		call('track.updateNowPlaying', updateNowPlaying, parameters);
	}
}

function setScrobbling(scrobble) {
	lastfmScrobbling = scrobble;
}

function setUpdating(update) {
	lastfmUpdating = update;
}
