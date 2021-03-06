/* Reference variables */

var lastfmToken = '';
var authStage = 0;
var plugdjOpen = false;

/* Port event handlers */

self.port.on('setSession', lastfmConfirm);
self.port.on('setPlugdjOpen', setPlugdjOpen);
self.port.on('setScrobbling', setScrobbling);
self.port.on('setUpdating', setUpdating);

/* HTML event handlers */

$('#instructions').click(function() {
	switch (authStage) {
		case 0:
			self.port.emit('setSession', '');
			lastfmAuthenticate();
			break;
		case 1:
			lastfmConfirm();
	}
});

$('#plugdj-link').click(function() {
	if (!plugdjOpen) {
		self.port.emit('setPanelDisplay', false);
		self.port.emit('openTab', 'https://plug.dj/');
	}
});

$('#scrobble').click(function() {
	if ($('#scrobble').is(':checked'))
		self.port.emit('setScrobbling', true);
	else
		self.port.emit('setScrobbling', false);
});

$('#update').click(function() {
	if ($('#update').is(':checked'))
		self.port.emit('setUpdating', true);
	else
		self.port.emit('setUpdating', false);
});

/* Panel initialization */

setStage('default');
setPlugdjOpen(false);

/* Authentication functions */

// Update authentication state and instructions
function setStage(stage) {
	switch(stage) {
		case 'default':
			authStage = 0;
			setInstructions('Your account is not linked. Click to complete the process, then come back here.');
			break;
		case 'getting_token':
			authStage = 1;
			setInstructions('Click to confirm your account link.');
			showControls(false);
			break;
		case 'link_completed':
			authStage = 0;
			setInstructions('Account linked. Click to relink.');
			showControls(true);
			break;
		case 'link_failed':
			authStage = 0;
			setInstructions('Account link failed. Click to try again.');
			break;
	}
}

// Create account link using token
function lastfmAuthenticate(token) {
	if (token) {
		lastfmToken = token;

		self.port.emit('setPanelDisplay', false);
		self.port.emit('openTab', 'http://www.last.fm/api/auth/?api_key=' + lastfmKey + '&token=' + token);

		setStage('getting_token');
	}
	else
		getToken();
}

// Get token got use in creating account link
function getToken(response) {
	if (response)
		lastfmAuthenticate(response.token);
	else
		call('auth.getToken', getToken, {}, false);
}

// Get permanent session key using token after account link is created
function getSession(response) {
	if (response) {
		if (!response.session)
			setStage('link_failed');
		else
			lastfmConfirm(response.session.key);
	}
	else {
		var parameters = {
			'token': lastfmToken
		};

		call('auth.getSession', getSession, parameters, false);
	}
}

// Set account link status to complete and update session key
function lastfmConfirm(session) {
	if (session) {
		lastfmSession = session;

		self.port.emit('setSession', session);

		setStage('link_completed');
	}
	else
		getSession();
}

/* HTML functions */

function setInstructions(message) {
	$('#instructions').html(message);
}

function showControls(show) {
	if (show && $('#controls').hasClass('hidden'))
		$('#controls').removeClass('hidden');
	if (!show && !$('#controls').hasClass('hidden'))
		$('#controls').addClass('hidden');
}

function setPlugdjOpen(status) {
	switch(status) {
		case false:
			setPlugdjLink('Open Plug.dj', true);
			break;
		case true:
			setPlugdjLink('Plug.dj is open', false);
			break;
	}
}

function setPlugdjLink(message, isLink) {
	$('#plugdj-link').html(message);

	if (isLink && !$('#plugdj-link').hasClass('link'))
		$('#plugdj-link').addClass('link');
	if (!isLink && $('#plugdj-link').hasClass('link'))
		$('#plugdj-link').removeClass('link');
}

/* Utility functions */

function setScrobbling(scrobble) {
	if (scrobble)
		$('#scrobble').prop('checked', true);
	else
		$('#scrobble').prop('checked', false);
}

function setUpdating(update) {
	if (update)
		$('#update').prop('checked', true);
	else
		$('#update').prop('checked', false);
}
