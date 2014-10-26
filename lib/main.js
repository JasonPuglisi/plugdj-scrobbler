var prefs = require('sdk/simple-prefs').prefs;
var tabs = require('sdk/tabs');
var self = require('sdk/self');
var buttons = require('sdk/ui/button/toggle');
var panels = require('sdk/panel');

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
	contentScriptFile: [self.data.url('vendor/jquery-1.11.1.min.js'), self.data.url('vendor/md5.js'), self.data.url('lastfm.js')],
	contentStyleFile: self.data.url('style.css'),
	onHide: handleHide
});


panel.port.on('setPanelDisplay', setPanelDisplay);
panel.port.on('openTab', openTab);
panel.port.on('setSession', setSession);

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
