export const colorLog = (color: string, ...args: any[]) => console.log(`%c${args.join(" ")}`, `color: ${color}`)
export const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const retrieveWindowVariables = (variables: string[]): Record<string, any> => {
    const ret = {}

    const scriptContent = variables.reduce((acc, curr) => {
        return (
            acc +
            `if (typeof ${curr} !== 'undefined') document.body.setAttribute('tmp_${curr}', JSON.stringify(${curr}));`
        )
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

export const unselectAll = () => {
    if (window.getSelection) {
        if (window.getSelection().empty) {
            window.getSelection().empty()
        } else if (window.getSelection().removeAllRanges) {
            window.getSelection().removeAllRanges()
        }
    } else if ((document as any).selection) {
        ;(document as any).selection.empty()
    }
}
