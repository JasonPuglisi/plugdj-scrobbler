var prefs = require('sdk/simple-prefs').prefs;
var tabs = require('sdk/tabs');
var pageMod = require('sdk/page-mod');
var self = require('sdk/self');
var buttons = require('sdk/ui/button/toggle');
var panels = require('sdk/panel');

var plugdjOpen = false;

var button = buttons.ToggleButton({
	id: 'plugdj-scrobbler-button',
	label: 'Plug.dj Scrobbler',
	icon: {
		'16': './icon-16-inactive.png',
		'32': './icon-32-inactive.png',
		'64': './icon-64-inactive.png'
	},
	onChange: handleChange
});

var panel = panels.Panel({
	contentURL: self.data.url('panel.html'),
	contentScriptFile: [self.data.url('vendor/jquery-1.11.1.min.js'), self.data.url('vendor/md5.js'), self.data.url('config.js'), self.data.url('lastfm.js')],
	contentStyleFile: self.data.url('style.css'),
	onHide: handleHide
});

panel.port.on('setPanelDisplay', setPanelDisplay);
panel.port.on('openTab', openTab);
panel.port.on('setSession', setSession);
panel.port.on('setScrobbling', setScrobbling);
panel.port.on('setUpdating', setUpdating);

panel.port.emit('setScrobbling', prefs.lastfmScrobbling);
panel.port.emit('setUpdating', prefs.lastfmUpdating);

tabs.on('ready', tabReady);
tabs.on('close', tabClose);

var pageModPort;

var pageMod = pageMod.PageMod({
	include: /https:\/\/plug\.dj\/.*/,
	contentScriptFile: [self.data.url('vendor/jquery-1.11.1.min.js'), self.data.url('vendor/md5.js'), self.data.url('config.js'), self.data.url('plugdj.js')],
	onAttach: function(worker) {
		pageModPort = worker.port;

		worker.port.emit('setSession', prefs.lastfmSession);
		worker.port.emit('setScrobbling', prefs.lastfmScrobbling);
		worker.port.emit('setUpdating', prefs.lastfmUpdating);

		worker.port.on('scrobbled', setScrobbled);

		worker.on('detach', function() {
			pageModPort = false;
		});
	}
});

if (prefs.lastfmSession.length > 0) {
	panel.port.emit('setSession', prefs.lastfmSession);
}

function handleChange(state) {
	if (state.checked) {
		panel.show({
			position: button
		});
	}
}

function handleHide() {
	button.state('window', {
		checked: false
	});
}

function setPanelDisplay(display) {
	if (display) {
		panel.show({
			position: button
		});
	}

	else {
		panel.hide();
	}
}

function openTab(url) {
	tabs.open(url);
}

function tabReady(tab) {
	updatePlugdj();
}

function tabClose(tab) {
	updatePlugdj();
}

function updatePlugdj(open) {
	var checkPlugdjOpen = false;

	for (var i in tabs) {
		if (checkPlugdjUrl(tabs[i].url)) {
			checkPlugdjOpen = true;
		}
	}

	plugdjOpen = checkPlugdjOpen;

	panel.port.emit('setPlugdjOpen', plugdjOpen);

	if (!plugdjOpen) {
		button.icon = {
			'16': './icon-16-inactive.png',
			'32': './icon-32-inactive.png',
			'64': './icon-64-inactive.png'
		};
	}
}

function checkPlugdjUrl(url) {
	var plugdjUrl = 'https://plug.dj/';

	return url.indexOf(plugdjUrl) === 0 && url.length > plugdjUrl.length;
}

function setSession(session) {
	prefs.lastfmSession = session;
}

function setScrobbling(scrobble) {
	prefs.lastfmScrobbling = scrobble;

	if (pageModPort) {
		pageModPort.emit('setScrobbling', scrobble);
	}
}

function setUpdating(update) {
	prefs.lastfmUpdating = update;

	if (pageModPort) {
		pageModPort.emit('setUpdating', update);
	}
}

function setScrobbled(scrobbled) {
	if (scrobbled) {
		button.icon = {
			'16': './icon-16-active.png',
			'32': './icon-32-active.png',
			'64': './icon-64-active.png'
		};
	}

	else {
		button.icon = {
			'16': './icon-16-inactive.png',
			'32': './icon-32-inactive.png',
			'64': './icon-64-inactive.png'
		};
	}
}
