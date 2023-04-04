import { Config } from "./types.js"
import { colorLog, retrieveWindowVariables } from "./util.js"

const getFen = () => {
    let fen = ""
    for (let y = 8; y > 0; y--) {
        let row = ""
        let empty = 0
        for (let x = 1; x <= 8; x++) {
            const classList = document.getElementsByClassName(`square-${x}${y}`)?.[0]?.classList
            const classes = classList ? Array.from(classList) : []

            let pieceStr: string = null
            for (const c of classes) {
                if (c.length === 2) {
                    pieceStr = c
                    break
                }
            }

            console.log({ x, y, pieceStr })

            if (!pieceStr) {
                empty += 1
                if (x === 8) row += empty
                continue
            }

            const [color, piece] = pieceStr
            if (color === "w") row += piece.toUpperCase()
            else row += piece.toLowerCase()

            if (empty !== 0) {
                row += empty
                empty = 0
            }
        }
        fen += row + "/"
    }
    return fen
}

const main = async () => {
    colorLog("red", "Starting chess.com cheats...")

    const config: Config = retrieveWindowVariables(["Config"])["Config"]

    const engine = new Worker(config.pathToEngineWorker)

    setInterval(() => {
        colorLog("red", "Fen:", getFen())
    }, 1000)
}

main()
