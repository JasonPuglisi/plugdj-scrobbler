/* Dependencies */

var buttons = require('sdk/ui/button/toggle'),
	pageMod = require('sdk/page-mod'),
	panels = require('sdk/panel'),
	preferences = require('sdk/simple-prefs').prefs,
	self = require('sdk/self'),
	tabs = require('sdk/tabs');

/* Reference variables */

var plugdjOpen = false;
var plugdjPort = false;

/* Main components */

var button = buttons.ToggleButton({
	id: 'plugdj-scrobbler-button',
	label: 'Plug.dj Scrobbler',
	icon: {
		'16': './icon-16.png',
		'32': './icon-32.png',
		'64': './icon-64.png'
	},
	onChange: changeButton
});

var panel = panels.Panel({
	contentURL: self.data.url('panel.html'),
	contentScriptFile: [
		self.data.url('vendor/jquery-1.11.1.min.js'),
		self.data.url('vendor/md5.js'),
		self.data.url('reference.js'),
		self.data.url('panel.js')
	],
	contentStyleFile: self.data.url('style.css'),
	onHide: hidePanel
});

var plugdjPageMod = pageMod.PageMod({
	include: /https:\/\/plug\.dj\/.*/,
	contentScriptFile: [
		self.data.url('vendor/jquery-1.11.1.min.js'),
		self.data.url('vendor/md5.js'),
		self.data.url('reference.js'),
		self.data.url('pageMod.js')
	],
	onAttach: function(worker) {
		plugdjPort = worker.port;

		plugdjPort.on('scrobbled', setScrobbled);

		if (preferences.lastfmSession)
			plugdjPort.emit('setSession', preferences.lastfmSession);

		plugdjPort.emit('setScrobbling', preferences.lastfmScrobbling);
		plugdjPort.emit('setUpdating', preferences.lastfmUpdating);

		worker.on('detach', function() {
			plugdjPort = false;
		});
	}
});

/* Port event handlers */

panel.port.on('setPanelDisplay', setPanelDisplay);
panel.port.on('openTab', openTab);
panel.port.on('setSession', setSession);
panel.port.on('setScrobbling', setScrobbling);
panel.port.on('setUpdating', setUpdating);

/* Port event emitters */

if (preferences.lastfmSession)
	panel.port.emit('setSession', preferences.lastfmSession);

panel.port.emit('setScrobbling', preferences.lastfmScrobbling);
panel.port.emit('setUpdating', preferences.lastfmUpdating);

/* Tab event handlers */

tabs.on('ready', tabReady);
tabs.on('close', tabClose);

/* Button functions */

function changeButton(state) {
	if (state.checked) {
		panel.show({
			position: button
		});
	}
}

/* Panel functions */

function hidePanel() {
	button.state('window', {
		checked: false
	});
}

function setPanelDisplay(display) {
	if (display)
		panel.show({
			position: button
		});

	else
		panel.hide();
}

/* Tab functions */

function openTab(url) {
	tabs.open(url);
}

function tabReady(tab) {
	updatePlugdj();
}

function tabClose(tab) {
	updatePlugdj();
}

/* Preference functions */

function setSession(session) {
	preferences.lastfmSession = session;
}

function setScrobbling(scrobble) {
	preferences.lastfmScrobbling = scrobble;

	if (pageModPort)
		pageModPort.emit('setScrobbling', scrobble);
}

function setUpdating(update) {
	preferences.lastfmUpdating = update;

	if (pageModPort)
		pageModPort.emit('setUpdating', update);
}

/* Utility functions */

function updatePlugdj(open) {
	var checkPlugdjOpen = false;

	for (var i in tabs)
		if (checkPlugdjUrl(tabs[i].url))
			checkPlugdjOpen = true;

	if (checkPlugdjOpen !== plugdjOpen) {
		plugdjOpen = checkPlugdjOpen;

		panel.port.emit('setPlugdjOpen', plugdjOpen);

		if (!plugdjOpen)
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

function setScrobbled(scrobbled) {
	if (scrobbled)
		button.icon = {
			'16': './icon-16-active.png',
			'32': './icon-32-active.png',
			'64': './icon-64-active.png'
		};

	else
		button.icon = {
			'16': './icon-16-inactive.png',
			'32': './icon-32-inactive.png',
			'64': './icon-64-inactive.png'
		};
}
