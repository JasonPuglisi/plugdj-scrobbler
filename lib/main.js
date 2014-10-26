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

tabs.on('ready', tabReady);
tabs.on('close', tabClose);

pageMod.PageMod({
	include: /https:\/\/plug\.dj\/.*/,
	contentScriptFile: [self.data.url('vendor/jquery-1.11.1.min.js'), self.data.url('vendor/md5.js'), self.data.url('config.js'), self.data.url('plugdj.js')],
	contentScriptWhen: 'end'
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

function setSession(session) {
	prefs.lastfmSession = session;
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

	if (!plugdjOpen && checkPlugdjOpen) {
		button.icon = {
			'16': './icon-16-active.png',
			'32': './icon-32-active.png',
			'64': './icon-64-active.png'
		};
	}

	else if (plugdjOpen && !checkPlugdjOpen) {
		button.icon = {
			'16': './icon-16-inactive.png',
			'32': './icon-32-inactive.png',
			'64': './icon-64-inactive.png'
		};
	}

	plugdjOpen = checkPlugdjOpen;

	panel.port.emit('setPlugdjOpen', plugdjOpen);
}

function checkPlugdjUrl(url) {
	var plugdjUrl = 'https://plug.dj/';

	return url.indexOf(plugdjUrl) === 0 && url.length > plugdjUrl.length;
}
