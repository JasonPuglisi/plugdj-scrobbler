var lastfmKey = '8c2c754cdff3f4da859781b4e229e807';
var lastfmSecret = '180463126834e5dae185dbc5d5508b0f';

function getSig(parameters) {
	var sig = '';

	Object.keys(parameters).sort().forEach(function(key) {
		sig += key + parameters[key];
	});

	sig += lastfmSecret;

	return CryptoJS.MD5(sig).toString(CryptoJS.enc.Hex);
}
