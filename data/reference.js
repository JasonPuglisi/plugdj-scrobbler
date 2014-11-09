var lastfmKey = '8c2c754cdff3f4da859781b4e229e807';
var lastfmSecret = '180463126834e5dae185dbc5d5508b0f';
var lastfmBaseUrl = 'https://ws.audioscrobbler.com/2.0/';

/*
 * createSignature() and call()
 *
 * Modified slightly from Google Music Scrobbler
 * https://github.com/fuzeman/GoogleMusicScrobbler
 *
 */

function createSignature(parameters) {
	var sig = '';

	Object.keys(parameters).sort().forEach(function(key) {
		if (key !== 'format') {
			if (parameters[key] === undefined || parameters[key] === null)
				parameters[key] = '';
			sig += key + parameters[key];
		}
	});

	sig += lastfmSecret;

	return CryptoJS.MD5(sig).toString(CryptoJS.enc.Hex);
}

function call(method, callback, parameters, write) {
	parameters = parameters || {};

	if (write === undefined || write === null)
		write = true;

	parameters.method = method;
	parameters.api_key = lastfmKey;
	parameters.format = 'json';
	parameters.api_sig = createSignature(parameters);

	var request = null;

	if (write)
		request = $.ajax(lastfmBaseUrl, {
			type: 'POST',
			data: parameters
		});

	else {
		var paramString = '';

		Object.keys(parameters).forEach(function(key) {
			paramString += key + '=' + parameters[key] + '&';
		});

		paramString = paramString.substring(0, paramString.length - 1);
		request = $.ajax(lastfmBaseUrl + '?' + paramString);
	}

	request.done(callback);

	request.fail(function(jqxhr, status) {
		console.log('Failed ', status);
	});
}
