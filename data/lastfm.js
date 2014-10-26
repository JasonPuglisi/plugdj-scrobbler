var lastfmKey = '8c2c754cdff3f4da859781b4e229e807';
var lastfmSecret = '180463126834e5dae185dbc5d5508b0f';

var lastfmToken;
var lastfmSession;

var authStage = 0;

$('.instructions').click(function() {
	if (authStage === 0) {
		self.port.emit('setSession', '');

		lastfmAuthenticate();
	}

	else if (authStage === 1) {
		lastfmConfirm();
	}
});

self.port.on('setSession', lastfmConfirm);

setStage('default');

function setStage(stage) {
	switch(stage) {
		case 'default':
			authStage = 0;
			setInstructions('Your account is not linked. Click to complete the process, then come back here.');
		break;
		case 'getting_token':
			authStage = 1;
			setInstructions('Click to confirm your account link.');
		break;
		case 'link_completed':
			authStage = 0;
			setInstructions('Account linked. Click to relink.');
		break;
		case 'link_failed':
			authStage = 0;
			setInstructions('Account link failed. Click to try again.');
		break;
	}
}

function setInstructions(message) {
	$('.instructions').html(message);
}

function lastfmAuthenticate(token) {
	if (token) {
		lastfmToken = token;

		self.port.emit('setPanelDisplay', false);
		self.port.emit('openTab', 'http://www.last.fm/api/auth/?api_key=' + lastfmKey + '&token=' + token);

		setStage('getting_token');
	}

	else {
		getToken();
	}
}

function lastfmConfirm(session) {
	if (session) {
		lastfmSession = session;

		self.port.emit('setSession', session);

		setStage('link_completed');
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
			setStage('link_failed');
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
