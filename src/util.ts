import Toastify from "toastify-js"

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

export const retrieveWindowVariable = (variable: string): any => retrieveWindowVariables([variable])[variable]

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

export const toast = (text: string, background = "#F3654C") =>
    Toastify({
        text: text,
        duration: 3000,
        gravity: "top",
        position: "center",
        style: {
            background,
            boxShadow: "0 10px 16px 0 rgba(0,0,0,0.2),0 6px 20px 0 rgba(0,0,0,0.19)",
        },
        close: true,
    }).showToast()

export const radians = (p1: [number, number], p2: [number, number]): number => Math.atan2(p2[1] - p1[1], p2[0] - p1[0])
export const project = (p: [number, number], radians: number, distance: number): [number, number] => [
    p[0] + Math.cos(radians) * distance,
    p[1] + Math.sin(radians) * distance,
]

export const moveArrowHeads = (
    tail: [number, number],
    head: [number, number],
    distance: number,
    reverseDistance: number
): [[number, number], [number, number]] => {
    const r = radians(tail, head)
    return [project(tail, r, reverseDistance), project(head, r, -distance)]
}
