import { loadPopup } from "./popup.js"
import { Config } from "./types.js"
import { colorLog, retrieveWindowVariables } from "./util.js"

export const getFen = () => {
    const fen = []
    for (let y = 8; y > 0; y--) {
        let row = ""
        let empty = 0
        for (let x = 1; x <= 8; x++) {
            // TODO Filter by non-highlight
            const classList = document.getElementsByClassName(`square-${x}${y}`)?.[0]?.classList
            const classes = classList ? Array.from(classList) : []

            let pieceStr = classes.find((c) => c.length === 2)

            console.log(`(${x}, ${y}) ${pieceStr}`)

            if (!pieceStr) {
                empty += 1
                if (x === 8) row += empty
                continue
            }

            if (empty !== 0) {
                row += empty
                empty = 0
            }

            const [color, piece] = pieceStr
            if (color === "w") row += piece.toUpperCase()
            else row += piece.toLowerCase()
        }
        fen.push(row)
    }
    return fen.join("/")
}

export const validateFen = (fen: string) => {
    const pieces = "rnbqkbnrpRNBQKBNRP".split("")
    const numbers = "12345678".split("")

    const splitFen = fen.split("/")
    if (splitFen.length !== 8) return false
    for (const row of splitFen) {
        let sum = 0
        for (const c of row) {
            if (pieces.includes(c)) {
                sum += 1
                continue
            }

            if (numbers.includes(c)) {
                sum += parseInt(c)
                continue
            }

            return false
        }
        if (sum !== 8) return false
    }
    return true
}

export const getCurrentMove = () => {
    const moveDivs = document.querySelectorAll("div[data-ply]")
    if (moveDivs.length === 0) return "white"

    const lastMove = parseInt(moveDivs[moveDivs.length - 1].getAttribute("data-ply"))
    if (lastMove % 2 === 0) return "white"
    return "black"
}

const defaultEngine = "/bundles/app/js/vendor/jschessengine/stockfish.asm.1abfa10c.js"

const main = async () => {
    colorLog("green", "Starting chess.com cheats...")

    const config: Config = retrieveWindowVariables(["Config"])["Config"]
    if (!config) colorLog("red", "Config not found, reverting to default engine worker path...")

    const engine = new Worker(config?.pathToNonWasmEngine ?? defaultEngine)

    loadPopup()
}

main()
