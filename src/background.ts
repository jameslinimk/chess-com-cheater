chrome.runtime.onMessage.addListener((request, _, callback) => {
	if (request.id == "fetchData") {
		const url = request.url
		fetch(url, {
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
			},
		})
			.then((response) => response.json())
			.then((response) => callback({ error: null, response }))
			.catch((error) => callback({ error, response: null }))
		return true
	}
})
