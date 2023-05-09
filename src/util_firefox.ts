const retrieveWindowVariables = (variables: string[]): Record<string, any> => {
	const ret = {}

	const scriptContent = variables.reduce((acc, curr) => {
		return acc + `if (typeof ${curr} !== 'undefined') document.body.setAttribute('tmp_${curr}', JSON.stringify(${curr}));`
	}, "")

	const script = document.createElement("script")
	script.id = "tmpScript"
	script.appendChild(document.createTextNode(scriptContent))
	;(document.body || document.head || document.documentElement).appendChild(script)

	for (const variable of variables) {
		ret[variable] = JSON.parse(document.body.getAttribute("tmp_" + variable))
		document.body.removeAttribute("tmp_" + variable)
	}

	document.getElementById("tmpScript").remove()
	return ret
}

export const retrieveWindowVariable = (variable: string): any => retrieveWindowVariables([variable])[variable]
