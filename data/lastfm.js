var lastfmKey = '8c2c754cdff3f4da859781b4e229e807';
var lastfmSecret = '180463126834e5dae185dbc5d5508b0f';

var lastfmToken;
var lastfmSession;

var authStage = 0;

$('#lastfmAuthenticate').click(function() {
	if (authStage === 0) {
		authStage++;
		lastfmAuthenticate();
	}

	else if (authStage === 1) {
		authStage++;
		lastfmConfirm();
	}
});

function lastfmAuthenticate(token) {
	if (token) {
		lastfmToken = token;

		self.port.emit('openTab', 'http://www.last.fm/api/auth/?api_key=' + lastfmKey + '&token=' + token);

		$('#lastfmAuthenticate').html('Click to confirm your account link.');
	}

	else {
		getToken();
	}
}

function lastfmConfirm(session) {
	if (session) {
		lastfmSession = session;

		self.port.emit('setSession', session);

		authStage = 0;
		$('#lastfmAuthenticate').html('Account link confirmed. Click to relink.');
	}

	else {
		getSession();
	}
}

function getToken(response) {
	if (response) {
		lastfmAuthenticate(response.token);
	}

	else {
		$.ajax({
			url: 'http://ws.audioscrobbler.com/2.0/?method=auth.getToken&api_key=' + lastfmKey + '&format=json',
			type: 'GET',
			success: getToken,
			dataType: 'json'
		});
	}
}

function getSession(response) {
	if (response) {
		if (!response.session) {
			authStage = 0;
			$('#lastfmAuthenticate').html('Authentication failed. Click to try again.');
		} else {
			lastfmConfirm(response.session.key);
		}
	}

	else {
		var parameters = {
			'method': 'auth.getSession',
			'api_key': lastfmKey,
			'token': lastfmToken
		};

		var sig = getSig(parameters);

		$.ajax({
			url: 'http://ws.audioscrobbler.com/2.0/?api_key=' + lastfmKey + '&method=auth.getSession&token=' + lastfmToken + '&format=json&api_sig=' + sig,
			type: 'GET',
			success: getSession,
			error: getSession
		});
	}
}


function getSig(parameters) {
	var sig = '';

	Object.keys(parameters).sort().forEach(function(key) {
		sig += key + parameters[key];
	});

	sig += lastfmSecret;

	return CryptoJS.MD5(sig).toString(CryptoJS.enc.Hex);
}
