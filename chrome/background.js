function removeCruft(url) {
	var hexCruft = '0123456789abcdef',
		uriParts = parseUri(url),
		file = uriParts.file;
	if(file) {
		var split = file.split("."),
			name = split[0],
			ext = split[1],
			splitName = name.split("-"),
			last = splitName[splitName.length - 1];
		if(last.split('').filter(function(char) {
			return hexCruft.indexOf(char) == -1;
		}).length == 0) {
			splitName.pop();
		}
		var newFile = splitName.join('-') + "." + ext;
		return url.replace(file, newFile);
	} else {
		return url;
	}

}

var KS = {
	enabled: true,
	enableOn: [
		"khanacademy.org"
	],
	filter: {
		urls: [
			"*://*.khanacademy.org/*",
			"*://khanacademy.org/*",
			"*://*.kastatic.org/*",
			"*://kastatic.org/*",
			"*://*.google-analytics.com/*",
			"*://google-analytics.com/*",
			"*://*.google.com/*",
			"*://google.com/*",
			"*://khan-static.oss-cn-shanghai.aliyuncs.com/*",
		]
	},
	redirects: [
		{
			from: /cdn\.kastatic\.org\/(images|javascript|genfiles|fonts|KA-youtube-converted)/g,
			to: 'khan-static.oss-cn-shanghai.aliyuncs.com/$1',
			filters: [removeCruft]
		}
	],
	isHostEnabled(url) {
		var uri = parseUri(url);
		return !!KS.enableOn.filter(function(d) {
			return uri.host.indexOf(d) != -1;
		}).length;
	},
	redirect: function(url) {
		var redirects = KS.redirects;
		for(var k in redirects) {
			var redir = redirects[k];
			var res = redir.from.exec(url);
			if(res) {
				var newUrl = url.replace(redir.from, redir.to);
				res.forEach(function(match, ind) {
					newUrl = newUrl.replace(
						"$" + ind.toString(),
						match
					);
				});
				redir.filters.forEach(function(fn) {
					newUrl = fn(newUrl);
				});
				return newUrl;
			}
		}
		return false;
	},
	cancellable: [
		"facebook.com",
		"facebook.net",
		"google.com",
		"google-analytics.com",

	],
	cancel(url) {
		var uri = parseUri(url);
		return !!KS.cancellable.filter(function(c) {
			return uri.host.indexOf(c) != -1;
		}).length;
	}
};

chrome.webRequest.onBeforeRequest.addListener(function(details) {
	if(KS.enabled && tabs[details.tabId] && KS.isHostEnabled(tabs[details.tabId].url)) {
		if(KS.cancel(details.url)) {
			return {cancel: true};
		}
		var redir = KS.redirect(details.url);
		if(redir) {
			return {
				redirectUrl: redir
			};
		}
	}
}, KS.filter, ["blocking"]);

chrome.webRequest.onHeadersReceived.addListener(function(details) {
	details.responseHeaders.push({
		name: "Access-Control-Allow-Origin",
		value: "*"
	})
	return {responseHeaders: details.responseHeaders};

}, KS.filter, ["blocking", "responseHeaders"]);

chrome.browserAction.onClicked.addListener(function() {
	chrome.storage.sync.get("appEnabled", function(res) {
		chrome.storage.sync.set({appEnabled: !res.appEnabled});
	});
});

chrome.storage.onChanged.addListener(function(changes, namespace) {
	if(changes.appEnabled) {
		KS.enabled = changes.appEnabled.newValue;
		chrome.browserAction.setIcon({
			path: KS.enabled?
				"icons/enabled.png" :
				"icons/disabled.png"
		})
	}
});

function startup() {
	chrome.storage.sync.set({appEnabled: true});
}

startup();